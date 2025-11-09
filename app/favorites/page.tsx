// app/favorites/page.tsx - FIXED WITH REAL DATA
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface SavedItem {
  _id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
  city: string;
  area: string;
  category: string;
  description: string;
  sellerName: string;
  createdAt: string;
  savedAt: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/saved-items');
      if (response.ok) {
        const data = await response.json();
        setSavedItems(data.savedItems || []);
      } else {
        console.error('Failed to fetch saved items');
        setSavedItems([]);
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
      setSavedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (itemId: string) => {
    try {
      const response = await fetch(`/api/saved-items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state immediately for better UX
        setSavedItems(prev => prev.filter(item => item._id !== itemId));
      } else {
        console.error('Failed to remove item');
        alert('Failed to remove item from favorites');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error removing item from favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Updated to match your app style */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">N</span>
              NavaJeevan
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hi, {user?.name || 'User'}</span>
              <Link href="/sell" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Sell Item
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-amber-50 rounded-lg shadow-sm p-8 mb-8 border border-amber-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-200 p-3 rounded-full">
              <svg className="w-8 h-8 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Saved Items</h1>
              <p className="text-gray-600 mt-1">
                {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Saved Items Grid */}
        {savedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                {/* Item Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">📦</span>
                  )}
                  
                  {/* Remove from Favorites Button */}
                  <button
                    onClick={() => removeFromFavorites(item._id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
                    title="Remove from saved items"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {/* Item Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-green-600 font-bold text-lg mb-2">Rs. {item.price?.toLocaleString()}</p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">{item.condition}</span>
                    <span>{item.city}</span>
                  </div>
                  {item.area && (
                    <p className="text-gray-500 text-sm">{item.area}</p>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      Saved {new Date(item.savedAt).toLocaleDateString()}
                    </span>
                    <Link 
                      href={`/item/${item._id}`}
                      className="text-amber-700 hover:text-amber-800 text-sm font-medium"
                    >
                      View Item →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No saved items yet</h3>
            <p className="text-gray-600 mb-6">Start browsing and save items you're interested in!</p>
            <Link 
              href="/browse"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Items
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}