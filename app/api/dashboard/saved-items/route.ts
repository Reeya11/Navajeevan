// app/api/dashboard/saved-items/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

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
  price: Number,
  images: [String]
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export async function GET() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // TODO: Replace with actual user ID
    const userId = 'current-user-id';

    const savedItems = await SavedItem.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          _id: '$itemDetails._id',
          title: '$itemDetails.title',
          price: '$itemDetails.price',
          images: '$itemDetails.images',
          savedAt: 1
        }
      }
    ]);

    return NextResponse.json({ savedItems });

  } catch (error) {
    console.error('Error fetching saved items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}