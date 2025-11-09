// app/api/saved-items/route.ts - CREATE THIS FILE
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const savedItemSchema = new mongoose.Schema({
  userId: String,
  itemId: String,
  savedAt: { type: Date, default: Date.now }
});

const SavedItem = mongoose.models.SavedItem || mongoose.model('SavedItem', savedItemSchema);

function verifyToken(token: string): any {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    const userId = decodedToken.userId;
    const { itemId } = await request.json();
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await connectDB();

    // Check if already saved
    const existingSave = await SavedItem.findOne({
      userId: userId,
      itemId: itemId
    });

    if (existingSave) {
      return NextResponse.json({ 
        success: true, 
        message: 'Item already saved',
        action: 'already_saved'
      });
    }

    // Save the item
    const savedItem = new SavedItem({
      userId: userId,
      itemId: itemId
    });

    await savedItem.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Item saved successfully',
      action: 'saved'
    });

  } catch (error) {
    console.error('Error saving item:', error);
    return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
  }
}