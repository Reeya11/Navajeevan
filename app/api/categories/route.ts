// app/api/categories/route.ts - UPDATED
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { baseCategories } from '@/lib/categories';

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
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export async function GET() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get all category counts - NO STATUS FILTER
    const categoryCounts = await Item.aggregate([
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 Raw category counts from DB:', categoryCounts);

    // Map the counts to our base categories
    const categoriesWithCounts = baseCategories.map(baseCategory => {
      // Find matching category from database (case-insensitive)
      const matchedCategory = categoryCounts.find(dbCategory => {
        if (!dbCategory._id || !baseCategory.id) return false;
        
        // Try exact match first
        if (dbCategory._id.toLowerCase() === baseCategory.id.toLowerCase()) {
          return true;
        }
        
        // Try partial match
        if (dbCategory._id.toLowerCase().includes(baseCategory.id.toLowerCase()) ||
            baseCategory.id.toLowerCase().includes(dbCategory._id.toLowerCase())) {
          return true;
        }
        
        return false;
      });

      const count = matchedCategory?.count || 0;
      
      console.log(`📦 Category ${baseCategory.id}: ${count} items (matched with: ${matchedCategory?._id || 'none'})`);

      return {
        ...baseCategory,
        itemCount: count
      };
    });

    const totalItems = await Item.countDocuments();

    console.log(`🎯 Total items in database: ${totalItems}`);

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts,
      totalItems
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}