import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Check all collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections in database:', collections.map(c => c.name));
    
    // Check products collection specifically
    const productsCount = await db.collection('products').countDocuments();
    const products = await db.collection('products').find({}).limit(5).toArray();
    
    return NextResponse.json({
      success: true,
      database: 'navajeevan',
      collections: collections.map(c => c.name),
      productsCount,
      sampleProducts: products.map(p => ({
        id: p._id?.toString(),
        title: p.title,
        category: p.category,
        price: p.price
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}