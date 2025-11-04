// app/item/[id]/page.tsx
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';

// Define the item schema
const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  condition: String,
  city: String,
  area: String,
  phone: String,
  contactMethod: String,
  images: [String],
  sellerId: String,
  sellerName: String,
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

async function getItem(id: string) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const item = await Item.findById(id);
    return item;
  } catch (error) {
    console.error('Error fetching item:', error);
    return null;
  }
}

// NEXT.JS 15 FIX: Use async function and await params
export default async function ItemPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // AWAIT the params (Next.js 15 change)
  const { id } = await params;
  
  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8">
          <a href="/browse" className="text-muted-foreground hover:text-foreground">
            Browse
          </a>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-muted-foreground">No images yet</span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {item.title}
              </h1>
              <p className="text-2xl font-semibold text-green-600 mb-4">
                NPR {item.price}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>Condition: <strong className="text-foreground capitalize">{item.condition}</strong></span>
                <span>Category: <strong className="text-foreground capitalize">{item.category}</strong></span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-foreground leading-relaxed">
                {item.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <p className="text-foreground">
                {item.city}{item.area ? `, ${item.area}` : ''}
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Contact Seller</h2>
              <div className="space-y-3">
                <p><strong>Phone:</strong> {item.phone}</p>
                <p><strong>Preferred Contact:</strong> {item.contactMethod}</p>
                
                <div className="flex gap-3 pt-4">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    Contact via {item.contactMethod}
                  </button>
                  <button className="border border-border px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors">
                    Save Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}