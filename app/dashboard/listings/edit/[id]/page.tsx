// app/dashboard/listings/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, ArrowLeft } from "lucide-react";
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
  phone: string;
  contactMethod: string;
  images: string[];
}

export default function EditItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    condition: '',
    description: '',
    city: '',
    area: '',
    phone: '',
    contactMethod: ''
  });

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/items/${params.id}`);
        if (response.ok) {
          const itemData = await response.json();
          setItem(itemData);
          setFormData({
            title: itemData.title,
            price: itemData.price.toString(),
            category: itemData.category,
            condition: itemData.condition,
            description: itemData.description,
            city: itemData.city,
            area: itemData.area || '',
            phone: itemData.phone,
            contactMethod: itemData.contactMethod
          });
        }
      } catch (error) {
        console.error('Failed to fetch item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('description', formData.description);
      submitData.append('city', formData.city);
      submitData.append('area', formData.area);
      submitData.append('phone', formData.phone);
      submitData.append('contactMethod', formData.contactMethod);

      const response = await fetch(`/api/items/${params.id}`, {
        method: 'PUT',
        body: submitData,
      });

      if (response.ok) {
        alert('Item updated successfully!');
        router.push('/dashboard/listings');
      } else {
        alert('Failed to update item');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!item) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Item Not Found</h1>
        <Button asChild>
          <Link href="/dashboard/listings">
            Back to Listings
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/listings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Item</h1>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Item Title</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price (NPR)</label>
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select category</option>
              <option value="furniture">Furniture</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="sports">Sports Equipment</option>
              <option value="home-decor">Home Decor</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Condition</label>
            <select 
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Area (Optional)</label>
            <Input
              name="area"
              value={formData.area}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact Method</label>
            <select 
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select method</option>
              <option value="phone">Phone Call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="message">In-app Message</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isUpdating ? 'Updating...' : 'Update Item'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            asChild
          >
            <Link href="/dashboard/listings">
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}