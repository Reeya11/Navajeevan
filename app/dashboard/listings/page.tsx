// app/dashboard/listings/page.tsx
'use client'; // ← ADD THIS LINE

import { useState, useEffect } from 'react'; // ← ADD THIS TOO
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Update to use client-side data fetching
export default function MyListingsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/items');
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/items/${itemId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove the item from state instead of reloading
          setItems(items.filter((item: any) => item._id !== itemId));
        } else {
          alert('Failed to delete item');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting item');
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} listed
          </p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/sell">
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <p className="text-muted-foreground text-lg mb-4">No listings yet</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/sell">
              List Your First Item
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item: any) => (
            <div key={item._id} className="border rounded-lg p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-green-600 font-bold">Rs. {item.price}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {item.condition} • {item.city}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/listings/edit/${item._id}`}>
                    Edit
                  </Link>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(item._id)} // ← NOW THIS WILL WORK
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