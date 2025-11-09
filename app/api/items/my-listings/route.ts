// app/api/items/my-listings/route.ts - SELF-CONTAINED
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Define item schema directly in this file
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

// Get or create Item model
const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

// JWT verification function
function verifyToken(token: string): any {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 MY-LISTINGS API CALLED');
    
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decodedToken = verifyToken(token);
    console.log('👤 Decoded token user ID:', decodedToken.userId);

    // Connect to MongoDB
    await connectDB();

    const userId = decodedToken.userId;
    console.log('🔍 Fetching listings for user:', userId);

    // Get user's listings
    const userItems = await Item.find({ 
      sellerId: userId 
    }).sort({ createdAt: -1 });

    console.log(`✅ Found ${userItems.length} listings for user: ${userId}`);

    return NextResponse.json(userItems);

  } catch (error) {
    console.error('❌ Error fetching user listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' }, 
      { status: 500 }
    );
  }
}