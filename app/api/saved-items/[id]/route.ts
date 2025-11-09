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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    const userId = decodedToken.userId;

    await connectDB();

    // Remove the saved item
    const result = await SavedItem.findOneAndDelete({
      userId: userId,
      itemId: params.id
    });

    if (!result) {
      return NextResponse.json({ error: 'Saved item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item removed from favorites' });

  } catch (error) {
    console.error('Error removing saved item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}