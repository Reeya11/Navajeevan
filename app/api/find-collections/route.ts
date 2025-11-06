import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get ALL collections and their document counts
    const collections = await db.listCollections().toArray();
    
    const collectionData = await Promise.all(
      collections.map(async (collection) => {
        const count = await db.collection(collection.name).countDocuments();
        const sampleDoc = await db.collection(collection.name).findOne({});
        return {
          name: collection.name,
          count,
          sampleFields: sampleDoc ? Object.keys(sampleDoc) : []
        };
      })
    );

    return NextResponse.json({
      success: true,
      collections: collectionData
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}