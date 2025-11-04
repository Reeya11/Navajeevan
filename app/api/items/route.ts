// app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

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

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const items = await Item.find().sort({ createdAt: -1 });
    
    return NextResponse.json(items);

  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}