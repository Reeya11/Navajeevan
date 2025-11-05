// app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

// Connect to your existing item schema
const itemSchema = new mongoose.Schema({
  title: String,
  price: Number,
  images: [String],
  status: String,
  views: Number,
  sellerId: String,
  createdAt: Date
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export async function GET() {
  try {
    // Get user session (you'll need to implement this based on your auth)
    // const session = await getServerSession();
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Connect to DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // TODO: Replace with actual user ID from session
    const userId = 'current-user-id'; 

    // Get stats from database
    const activeListings = await Item.countDocuments({ 
      sellerId: userId, 
      status: 'active' 
    });

    const totalViews = await Item.aggregate([
      { $match: { sellerId: userId } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const totalEarnings = await Item.aggregate([
      { $match: { sellerId: userId, status: 'sold' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    // For messages, you'll need to implement this based on your messages schema
    const unreadMessages = 0; // Placeholder

    return NextResponse.json({
      activeListings,
      totalViews: totalViews[0]?.total || 0,
      totalEarnings: totalEarnings[0]?.total || 0,
      unreadMessages
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}