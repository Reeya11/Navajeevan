import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const mongoUri = process.env.MONGODB_URI!;
  const client = await MongoClient.connect(mongoUri);
  const db = client.db();
  const bucket = new GridFSBucket(db, { bucketName: 'images' });

  const id = params.id;
  const downloadStream = bucket.openDownloadStream(new ObjectId(id));

  const chunks: Buffer[] = [];
  await new Promise((resolve, reject) => {
    downloadStream.on('data', (chunk) => chunks.push(chunk));
    downloadStream.on('end', resolve);
    downloadStream.on('error', reject);
  });

  await client.close();

  return new NextResponse(Buffer.concat(chunks), {
    headers: { 'Content-Type': 'image/jpeg' }, // You may want to set this dynamically
  });
}