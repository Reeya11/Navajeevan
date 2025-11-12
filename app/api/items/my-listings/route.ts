// app/api/items/my-listings/route.ts - SELF-CONTAINED
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { verifyToken } from '@/lib/jwt';
import Item from '@/lib/models/Item';

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