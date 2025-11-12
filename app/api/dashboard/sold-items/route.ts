// app/api/dashboard/sold-items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { verifyToken } from '@/lib/jwt';
import Item from '@/lib/models/Item';


export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('auth-token='));
    const token = tokenCookie?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    const userId = decodedToken.userId;

    await connectDB();

    // Find items where the current user is the seller AND status is sold
    const soldItems = await Item.find({
      sellerId: userId,
      status: 'sold'
    }).sort({ soldAt: -1 }); // Sort by most recently sold first

    console.log(`🔍 Found ${soldItems.length} sold items for user ${userId}`);

    return NextResponse.json({
      success: true,
      soldItems: soldItems
    });

  } catch (error) {
    console.error('Error fetching sold items:', error);
    return NextResponse.json({ 
      error: 'Internal server error'
    }, { status: 500 });
  }
}