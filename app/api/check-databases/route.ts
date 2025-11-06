import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    
    const client = await MongoClient.connect(MONGODB_URI);
    
    // List all databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    const dbInfo = await Promise.all(
      databases.databases.map(async (db) => {
        const database = client.db(db.name);
        const collections = await database.listCollections().toArray();
        return {
          name: db.name,
          size: db.sizeOnDisk,
          collections: collections.map(c => ({
            name: c.name,
            type: c.type
          }))
        };
      })
    );

    await client.close();

    return NextResponse.json({
      success: true,
      connectionString: MONGODB_URI,
      databases: dbInfo
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}