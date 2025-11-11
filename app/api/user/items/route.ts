// app/api/user/items/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
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
  sellerEmail: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

// Simple JWT verification function
function verifyToken(token: string): any {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies - USE auth-token
    const cookieHeader = request.headers.get('cookie');
    const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('auth-token='));
    const token = tokenCookie?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No auth token found' }, { status: 401 });
    }

    // Verify token and get user data
    let user;
    try {
      user = verifyToken(token);
      console.log('📋 Fetching items for user:', user.email);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get ONLY current user's items
    const userItems = await Item.find({ sellerId: user.userId })
      .sort({ createdAt: -1 });

    console.log('✅ Found', userItems.length, 'items for user:', user.email);

    return NextResponse.json(userItems);

  } catch (error) {
    console.error('❌ Error fetching user items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' }, 
      { status: 500 }
    );
  }
}