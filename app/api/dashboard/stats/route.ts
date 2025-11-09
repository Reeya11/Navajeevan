// app/api/dashboard/stats/route.ts - UPDATED WITH SOLD ITEMS DATA
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Connect to your existing item schema (include sold fields)
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
  status: String,
  views: Number,
  soldAt: Date,
  soldTo: String,
  soldToName: String,
  transactionId: String,
  paymentProvider: String,
  paymentAmount: Number,
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
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('auth-token='));
    const token = tokenCookie?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to DB
    await connectDB();

    // CRITICAL FIX: Get real user ID instead of hardcoded value
    const realUserId = await getRealUserId(token);

    console.log('📊 Fetching stats for user:', realUserId);

    // Get all user's items
    const userItems = await Item.find({ sellerId: realUserId });
    
    // Calculate stats
    const activeListings = userItems.filter(item => 
      item.status !== 'sold' && item.status !== 'inactive'
    ).length;

    const soldItems = userItems.filter(item => item.status === 'sold');
    const itemsSold = soldItems.length;
    const totalSales = soldItems.reduce((sum, item) => sum + (item.price || 0), 0);

    const totalViews = userItems.reduce((sum, item) => sum + (item.views || 0), 0);
    
    const totalListingsValue = userItems
      .filter(item => item.status !== 'sold')
      .reduce((sum, item) => sum + (item.price || 0), 0);

    // For messages, you'll need to implement this based on your messages schema
    const unreadMessages = 0; // Placeholder

    const stats = {
      activeListings,
      totalViews,
      totalListingsValue,
      unreadMessages,
      totalSales,
      itemsSold
    };

    console.log('✅ Dashboard stats:', {
      activeListings,
      itemsSold,
      totalSales,
      totalViews,
      totalListingsValue,
      unreadMessages
    });

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}