// app/api/dashboard/stats/route.ts - UPDATED WITH REAL MESSAGES
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { verifyToken } from '@/lib/jwt';
import Item from '@/lib/models/Item';

// User schema for consistent user IDs
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// **NEW: Message schema for counting unread messages**
const messageSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemTitle: String,
  sellerId: { type: String, required: true },
  sellerName: String,
  buyerId: { type: String, required: true },
  buyerName: String,
  buyerEmail: String,
  messages: [{
    senderId: String,
    senderName: String,
    text: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

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

    // Get real user ID
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

    // **NEW: REAL UNREAD MESSAGES COUNT** 🎉
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sellerId: realUserId },
            { buyerId: realUserId }
          ]
        }
      },
      {
        $unwind: "$messages"
      },
      {
        $match: {
          "messages.read": false,
          "messages.senderId": { $ne: realUserId } // Messages NOT from current user
        }
      },
      {
        $count: "unreadCount"
      }
    ]);

    const realUnreadCount = unreadMessages[0]?.unreadCount || 0;

    const stats = {
      activeListings,
      totalViews,
      totalListingsValue,
      unreadMessages: realUnreadCount, // ← REAL COUNT! 🎉
      totalSales,
      itemsSold
    };

    console.log('✅ Dashboard stats with REAL messages:', {
      activeListings,
      itemsSold,
      totalSales,
      totalViews,
      totalListingsValue,
      unreadMessages: realUnreadCount
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