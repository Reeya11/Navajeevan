// app/api/dashboard/saved-items/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// You'll need to create a saved items schema
const savedItemSchema = new mongoose.Schema({
  userId: String,
  itemId: String,
  savedAt: { type: Date, default: Date.now }
});

const SavedItem = mongoose.models.SavedItem || mongoose.model('SavedItem', savedItemSchema);

// Populate with item details
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
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('auth-token='));
    const token = tokenCookie?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const realUserId = await getRealUserId(token);

    console.log('💾 Fetching saved items for user:', realUserId);

    // FIXED AGGREGATION PIPELINE - Convert itemId to ObjectId for matching
    const savedItems = await SavedItem.aggregate([
      { $match: { userId: realUserId } },
      {
        $lookup: {
          from: 'items',
          let: { itemIdString: '$itemId' }, // Store the string itemId
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$_id',
                    { $toObjectId: '$$itemIdString' } // Convert string to ObjectId for comparison
                  ]
                }
              }
            }
          ],
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          _id: '$itemDetails._id',
          title: '$itemDetails.title',
          description: '$itemDetails.description',
          price: '$itemDetails.price',
          category: '$itemDetails.category',
          condition: '$itemDetails.condition',
          city: '$itemDetails.city',
          area: '$itemDetails.area', // ← ADDED THIS
          images: '$itemDetails.images',
          sellerName: '$itemDetails.sellerName',
          createdAt: '$itemDetails.createdAt',
          savedAt: 1
        }
      }
    ]);

    console.log(`✅ Found ${savedItems.length} saved items for user: ${realUserId}`);
    console.log('📦 Saved items data:', savedItems); // Debug log

    return NextResponse.json({ savedItems });

  } catch (error) {
    console.error('Error fetching saved items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}