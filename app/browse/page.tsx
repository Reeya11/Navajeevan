// app/browse/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/components/search-filters";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  city: string;
  area?: string;
  images: string[];
}

interface SearchFiltersType {
  search: string;
  category: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
}

interface HybridSearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  images: string[];
  score: number;
  matchType: string;
  createdAt: string;
}

export default function BrowsePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<SearchFiltersType>({
    search: '',
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: ''
  });
  
  const searchParams = useSearchParams();

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlSearch = searchParams.get('q') || searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlCondition = searchParams.get('condition') || '';
    const urlMinPrice = searchParams.get('minPrice') || '';
    const urlMaxPrice = searchParams.get('maxPrice') || '';

    const initialFilters: SearchFiltersType = {
      search: urlSearch,
      category: urlCategory,
      condition: urlCondition,
      minPrice: urlMinPrice,
      maxPrice: urlMaxPrice
    };

    setActiveFilters(initialFilters);
    
    // Only fetch if we have search parameters or it's initial load with existing params
    if (urlSearch || urlCategory || urlCondition || urlMinPrice || urlMaxPrice) {
      fetchItemsWithHybridSearch(initialFilters);
    } else {
      // Fetch all items if no specific filters
      fetchItemsWithHybridSearch({ search: '', category: '', condition: '', minPrice: '', maxPrice: '' });
    }
  }, [searchParams]);

  const fetchItemsWithHybridSearch = async (filters: SearchFiltersType) => {
    setIsLoading(true);
    try {
      // Build query for hybrid search API
      const params = new URLSearchParams();
      
      // Use 'q' parameter for hybrid search (semantic + keyword)
      if (filters.search) params.append('q', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const queryString = params.toString();
      const url = queryString ? `/api/search?${queryString}` : '/api/search';

      console.log('Fetching from hybrid search:', url);
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        if (data.success && Array.isArray(data.data.results)) {
          // Convert hybrid search results to Item format
          const hybridItems: Item[] = data.data.results.map((result: HybridSearchResult) => ({
            _id: result.id,
            title: result.title,
            description: result.description,
            price: result.price,
            category: result.category,
            condition: result.condition,
            city: result.location,
            area: '',
            images: result.images
          }));
          
          console.log('Hybrid search results:', hybridItems.length, 'items');
          setItems(hybridItems);
          setFilteredItems(hybridItems);
        } else {
          console.warn('Unexpected hybrid search response:', data);
          // Fallback to regular search if hybrid fails
          await fetchRegularItems(filters);
        }
      } else {
        console.error('Hybrid search failed:', res.status);
        // Fallback to regular search
        await fetchRegularItems(filters);
      }
    } catch (error) {
      console.error('Hybrid search error:', error);
      // Fallback to regular search
      await fetchRegularItems(filters);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback to regular search
  const fetchRegularItems = async (filters: SearchFiltersType) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const queryString = params.toString();
      const url = queryString ? `/api/items?${queryString}` : '/api/items';

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        let itemsArray: Item[] = [];
        
        if (Array.isArray(data)) {
          itemsArray = data;
        } else if (data.items && Array.isArray(data.items)) {
          itemsArray = data.items;
        } else if (data.success && Array.isArray(data.items)) {
          itemsArray = data.items;
        } else {
          console.warn('Unexpected API response format:', data);
          itemsArray = [];
        }
        
        console.log('Fallback regular search results:', itemsArray.length, 'items');
        setItems(itemsArray);
        setFilteredItems(itemsArray);
      } else {
        console.error('Regular search also failed');
        setItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('Regular search error:', error);
      setItems([]);
      setFilteredItems([]);
    }
  };

  const handleSearch = (filters: SearchFiltersType) => {
    setActiveFilters(filters);
    
    // Update URL with search parameters for shareable links
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.condition) params.set('condition', filters.condition);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    
    // Update URL without page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    fetchItemsWithHybridSearch(filters);
  };

  // Display match type badge for hybrid search results
  const getMatchTypeBadge = (item: Item) => {
    return (
      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
        Smart Match
      </span>
    );
  };

  // Ensure filteredItems is always an array for rendering
  const displayItems = Array.isArray(filteredItems) ? filteredItems : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Marketplace</h1>
          <p className="text-muted-foreground">
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'} found
            {activeFilters.search && ` for "${activeFilters.search}"`}
            <span className="text-blue-600 text-sm ml-2">🎯 AI-Powered Search</span>
          </p>
        </div>
        
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/sell">
            Sell Your Item
          </Link>
        </Button>
      </div>

      {/* Search and Filters - REMOVED initialFilters prop */}
      <div className="mb-8">
        <SearchFilters onSearch={handleSearch} />
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-muted-foreground">Searching with AI...</div>
          </div>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground text-lg mb-2">No items found</p>
          <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          <p className="text-sm text-blue-600 mt-2">💡 Try synonyms like "affordable" instead of "cheap"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <Link 
              key={item._id} 
              href={`/item/${item._id}`}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="bg-muted h-48 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground">No image</span>
                )}
              </div>
              
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-lg flex-1">{item.title}</h3>
                {getMatchTypeBadge(item)}
              </div>
              
              <p className="text-green-600 font-bold text-lg mb-2">Rs. {item.price}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {item.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.condition === 'New' ? 'bg-green-100 text-green-800' :
                  item.condition === 'Like New' ? 'bg-blue-100 text-blue-800' :
                  item.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                  item.condition === 'Fair' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.condition}
                </span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                  {item.category}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground flex items-center">
                📍 {item.city}{item.area ? `, ${item.area}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}