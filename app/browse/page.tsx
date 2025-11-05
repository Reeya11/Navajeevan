// app/browse/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/components/search-filters";
import Link from "next/link";

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

  // Fetch all items on initial load
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (filters: SearchFiltersType = activeFilters) => {
    setIsLoading(true);
    try {
      // Build query string from filters
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
        
        // Handle different response formats
        let itemsArray: Item[] = [];
        
        if (Array.isArray(data)) {
          // If response is directly an array
          itemsArray = data;
        } else if (data.items && Array.isArray(data.items)) {
          // If response has items property
          itemsArray = data.items;
        } else if (data.success && Array.isArray(data.items)) {
          // If response has success and items
          itemsArray = data.items;
        } else {
          // If response is unexpected format, log it
          console.warn('Unexpected API response format:', data);
          itemsArray = [];
        }
        
        console.log('Fetched items:', itemsArray);
        setItems(itemsArray);
        setFilteredItems(itemsArray);
      } else {
        console.error('Failed to fetch items:', res.status);
        setItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (filters: SearchFiltersType) => {
    setActiveFilters(filters);
    fetchItems(filters);
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
          </p>
        </div>
        
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/sell">
            Sell Your Item
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <SearchFilters onSearch={handleSearch} />
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="text-muted-foreground">Loading items...</div>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No items found</p>
          <p className="text-muted-foreground">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <Link 
              key={item._id} 
              href={`/item/${item._id}`}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
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
              
              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
              <p className="text-green-600 font-bold text-lg mb-1">Rs. {item.price}</p>
              <p className="text-sm text-muted-foreground capitalize mb-1">
                Condition: {item.condition}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                Category: {item.category}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.city}{item.area ? `, ${item.area}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}