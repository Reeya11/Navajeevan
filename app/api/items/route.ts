// app/api/items/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

// Define item schema
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
  sellerEmail: String,
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

// User schema for consistent user IDs
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// JWT verification function
function verifyToken(token: string): any {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Get real user ID (converts temporary IDs to real MongoDB IDs)
async function getRealUserId(token: string): Promise<string> {
  const decodedToken = verifyToken(token);
  let realUserId = decodedToken.userId;

  // If it's a temporary ID, find or create real user in database
  if (realUserId.startsWith('temp-user-id-')) {
    console.log('🔄 Temporary ID detected, finding real user...');
    
    let realUser = await User.findOne({ email: decodedToken.email });
    
    if (!realUser) {
      console.log('👤 Creating new user in database...');
      realUser = await User.create({
        email: decodedToken.email,
        name: decodedToken.name
      });
    }
    
    realUserId = realUser._id.toString();
    console.log('✅ Using real user ID:', realUserId);
  }

  return realUserId;
}

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

    // Build filter object
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
      .select('title price images condition city area description createdAt category sellerId sellerName sellerEmail')
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

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('auth-token='));
    const token = tokenCookie?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB
    await connectDB();
    // Get real user ID
    const realUserId = await getRealUserId(token);
    const decodedToken = verifyToken(token);

    const formData = await request.json();
    
    const newItem = new Item({
      ...formData,
      sellerId: realUserId,
      sellerEmail: decodedToken.email,
      sellerName: decodedToken.name
    });

    await newItem.save();
    
    console.log('✅ Item created with real user ID:', realUserId);

    return NextResponse.json({ success: true, item: newItem });

  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}