// app/api/debug/categories/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  condition: String,
  city: String,
  area: String,
  images: [String],
  sellerId: String,
  status: String,
  createdAt: Date
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export async function GET() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get all distinct categories from the database
    const distinctCategories = await Item.distinct('category');
    
    // Get count of items in each category
    const categoryCounts = await Promise.all(
      distinctCategories.map(async (category) => {
        const count = await Item.countDocuments({ 
          category: category,
          status: 'active'
        });
        return { category, count };
      })
    );

    // Get total items count
    const totalItems = await Item.countDocuments({ status: 'active' });

    return NextResponse.json({
      success: true,
      distinctCategories,
      categoryCounts,
      totalItems,
      message: `Found ${totalItems} total items across ${distinctCategories.length} categories`
    });

  } catch (error) {
    console.error('Error debugging categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}