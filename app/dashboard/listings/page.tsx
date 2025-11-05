// app/dashboard/listings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Item {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  createdAt: string;
}

export default function MyListingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyListings();
    }
  }, [user]);

  const fetchMyListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/items/my-listings');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        console.error('Expected array but got:', data);
        setItems([]);
        setError('Invalid data format received from server');
      }
      
    } catch (error) {
      console.error('Error fetching listings:', error);
      setItems([]);
      setError('Failed to load your listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteListing = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the item from the local state
        setItems(prev => prev.filter(item => item._id !== itemId));
      } else {
        alert('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Error deleting listing');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to view your listings</h2>
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/sell">Sell New Item</Link>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
          <p>{error}</p>
          <Button 
            onClick={fetchMyListings} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="text-muted-foreground">Loading your listings...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">You haven't listed any items yet</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/sell">List Your First Item</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item._id} className="border rounded-lg p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                {item.images?.[0] ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">No image</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-green-600 font-bold">Rs. {item.price}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {item.category} • {item.condition}
                </p>
                <p className="text-xs text-muted-foreground">
                  Listed on {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/item/${item._id}`}>View</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/listings/edit/${item._id}`}>Edit</Link>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteListing(item._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}