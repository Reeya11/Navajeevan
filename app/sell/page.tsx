// app/sell/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, DollarSign, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SellItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    // Process each file
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        
        const reader = new FileReader();
        
        // Define the onload event handler with proper typing
        reader.onload = (event: ProgressEvent<FileReader>) => {
          // Full proof null checking
          const target = event.target;
          if (!target || !target.result) return;
          
          const result = target.result;
          if (typeof result === 'string') {
            setImagePreviews(prev => [...prev, result]);
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading file');
        };
        
        reader.readAsDataURL(file);
      }
    });

    setImages(prev => [...prev, ...newImages]);
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Client-side validation
    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const condition = formData.get('condition') as string;
    const description = formData.get('description') as string;
    const city = formData.get('city') as string;
    const phone = formData.get('phone') as string;
    const contactMethod = formData.get('contactMethod') as string;

    // Check required fields
    if (!title || !price || !category || !condition || !description || !city || !phone || !contactMethod) {
      alert('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    // Check if at least one image is uploaded
    if (images.length === 0) {
      alert('Please upload at least one image of your item');
      setIsLoading(false);
      return;
    }

    // Check if price is valid
    if (parseFloat(price) <= 0) {
      alert('Please enter a valid price');
      setIsLoading(false);
      return;
    }

    // Add images to form data
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      const response = await fetch('/api/items/sell', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const item = await response.json();
        router.push(`/item/${item.id}`);
      } else {
        // Get error message from response if available
        let errorMessage = 'Failed to create listing';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      // Replace lines 132-136 with this code:
} catch (error) {
  console.error('Error creating listing:', error);
  
  // Handle the error safely
  let errorMessage = 'Failed to create listing. Please try again.';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  alert(errorMessage);
}
      
 finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sell Your Item</h1>
          <p className="text-muted-foreground">
            List your pre-loved items and give them a new life in our community marketplace
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-foreground">Listing Progress</div>
              <div className="text-sm text-muted-foreground">Step 1 of 3</div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Item Images */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Item Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Image upload previews */}
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {/* Upload button */}
                {images.length < 8 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center">
                      Add Photos ({images.length}/8)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Add up to 8 photos. Include different angles and any flaws.
              </p>
            </div>

            {/* Item Details */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Item Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-foreground">
                    Item Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    placeholder="e.g., Wooden Dining Table"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-medium text-foreground">
                    Price (NPR) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="1"
                      step="0.01"
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="2500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-foreground">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    <option value="">Select a category</option>
                    <option value="furniture">Furniture</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="books">Books</option>
                    <option value="sports">Sports Equipment</option>
                    <option value="home-decor">Home Decor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="condition" className="block text-sm font-medium text-foreground">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    required
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    <option value="">Select condition</option>
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-foreground">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    placeholder="Describe your item in detail. Include dimensions, brand, age, reason for selling, and any flaws."
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-medium text-foreground">
                    City *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Kathmandu"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="area" className="block text-sm font-medium text-foreground">
                    Area/Neighborhood
                  </label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    placeholder="Thamel"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    placeholder="98XXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactMethod" className="block text-sm font-medium text-foreground">
                    Preferred Contact Method *
                  </label>
                  <select
                    id="contactMethod"
                    name="contactMethod"
                    required
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    <option value="">Select method</option>
                    <option value="phone">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="message">In-app Message</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
              >
                {isLoading ? 'Publishing...' : 'Publish Listing'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}