// components/category/CategoryItems.tsx
'use client';
import { Category, getCategoryById } from '@/lib/categories';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface CategoryItemsProps {
  categoryId: string;
}

interface Item {
  _id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
  city: string;
  area: string;
  description?: string;
  createdAt: string;
  views: number;
}

export default function CategoryItems({ categoryId }: CategoryItemsProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const category = getCategoryById(categoryId);

  // Load saved items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedItems');
    if (saved) {
      setSavedItems(new Set(JSON.parse(saved)));
    }
  }, []);

  // Fetch items for this category
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/items?category=${categoryId}`);
        const data = await response.json();
        setItems(data.items || []);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchItems();
    }
  }, [categoryId]);

  const toggleSaveItem = (itemId: string) => {
    const newSavedItems = new Set(savedItems);
    
    if (newSavedItems.has(itemId)) {
      newSavedItems.delete(itemId);
    } else {
      newSavedItems.add(itemId);
    }
    
    setSavedItems(newSavedItems);
    localStorage.setItem('savedItems', JSON.stringify([...newSavedItems]));
  };

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Category not found</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Category Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
            <p className="text-gray-600 mt-1">{category.description}</p>
          </div>
        </div>

        <div className="flex gap-6 text-sm mt-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
            {items.length} items available
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {category.itemCount} total in category
          </span>
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            {savedItems.size} saved items
          </span>
        </div>
      </div>

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isSaved = savedItems.has(item._id);
            
            return (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 group">
                {/* Item Image with Save Button */}
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">📷</span>
                  )}
                  
                  {/* Save Item Button */}
                  <button
                    onClick={() => toggleSaveItem(item._id)}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200 ${
                      isSaved 
                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                        : 'bg-white text-amber-700 hover:bg-amber-50 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isSaved ? 'Remove from saved items' : 'Save item'}
                  >
                    <Heart 
                      className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} 
                      strokeWidth={isSaved ? 0 : 2}
                    />
                  </button>

                  {/* Saved indicator */}
                  {isSaved && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                      Saved
                    </div>
                  )}
                </div>
                
                {/* Item Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-green-600 font-bold text-lg mb-2">NPR {item.price?.toLocaleString()}</p>
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">{item.condition}</span>
                    <span>{item.city}</span>
                  </div>
                  {item.area && (
                    <p className="text-gray-500 text-sm">{item.area}</p>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => toggleSaveItem(item._id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        isSaved 
                          ? 'text-amber-700 hover:text-amber-800 font-medium' 
                          : 'text-gray-600 hover:text-amber-700'
                      }`}
                    >
                      <Heart 
                        className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} 
                        strokeWidth={isSaved ? 0 : 2}
                      />
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                    
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <span className="text-6xl mb-4 block">📦</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            No items found in this category yet. Be the first to list an item!
          </p>
          <a 
            href="/sell"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Sell Item
          </a>
        </div>
      )}
    </div>
  );
}