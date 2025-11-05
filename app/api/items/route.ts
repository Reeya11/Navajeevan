// app/api/items/route.ts - UPDATED
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
    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const condition = searchParams.get('condition') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build filter object - NO STATUS FILTER since your schema doesn't have it
    const filter: any = {};

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter (case-insensitive)
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Condition filter
    if (condition) {
      filter.condition = condition;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    console.log('🔍 Search filters:', filter);

    // Build sort object
    let sort: any = { createdAt: -1 }; // Default: newest first
    
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
    }

    const items = await Item.find(filter)
      .sort(sort)
      .select('title price images condition city area description createdAt category')
      .limit(50);

    console.log(`✅ Found ${items.length} items`);
    
    return NextResponse.json({
      success: true,
      items: items,
      count: items.length
    });

  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' }, 
      { status: 500 }
    );
  }
}