// app/api/dashboard/listings/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

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
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // TODO: Replace with actual user ID
    const userId = 'current-user-id';

    const listings = await Item.find({ sellerId: userId })
      .sort({ createdAt: -1 })
      .select('title price images status views createdAt');

    return NextResponse.json({ listings });

  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}