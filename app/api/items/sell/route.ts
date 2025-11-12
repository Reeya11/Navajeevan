// app/api/items/sell/route.ts - SIMPLIFIED WITHOUT SHARP
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';
import { GridFSBucket, MongoClient } from 'mongodb';

// Define item schema
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  condition: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  phone: { type: String, required: true },
  contactMethod: { type: String, required: true },
  images: { type: [String], required: true },
  sellerId: { type: String, required: true },
  sellerName: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

// Simple JWT verification function
function verifyToken(token: string): any {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Sell API endpoint called');

    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    console.log('🍪 Cookie header present:', !!cookieHeader);

    const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('auth-token='));
    const token = tokenCookie?.split('=')[1];

    console.log('🔐 Token found:', !!token);

    if (!token) {
      console.log('❌ No token found - returning 401');
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 });
    }

    let user;
    try {
      user = verifyToken(token);
      console.log('✅ Token verified - User:', user.email);
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    console.log('📦 FormData received');

    // 🖼️ DEBUG: Check all FormData keys
    console.log('📋 All FormData keys:');
    for (const key of formData.keys()) {
      const value = formData.get(key);
      if (value instanceof File) {
        console.log(` - ${key}: File (${value.name}, ${value.size} bytes)`);
      } else {
        console.log(` - ${key}:`, value);
      }
    }

    // Extract form data
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const condition = formData.get('condition') as string;
    const description = formData.get('description') as string;
    const city = formData.get('city') as string;
    const area = formData.get('area') as string;
    const phone = formData.get('phone') as string;
    const contactMethod = formData.get('contactMethod') as string;
    const imageFiles = formData.getAll('images').filter((item): item is File => item instanceof File);

    // Validate required fields
    if (!title || !price || !category || !condition || !description || !city || !phone || !contactMethod) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    //Handilng image processing and uploading
    const imageUrls: string[] = [];
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });


    console.log('🖼️ Processing images:', imageFiles.length);

    for (const imageFile of imageFiles) {
      if (imageFile.size > 0 && imageFile.size < 10 * 1024 * 1024) { // 10MB limit
        try {
          console.log(`📸 Processing: ${imageFile.name} (${imageFile.size} bytes)`);

          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const uploadStream = bucket.openUploadStream(imageFile.name, {
            metadata: { contentType: imageFile.type }
          });

          uploadStream.end(buffer);

          await new Promise((resolve, reject) => {
            uploadStream.on('finish', resolve);
            uploadStream.on('error', reject);
          });

          // Store the file ID as the image URL (you can create a download endpoint)
          imageUrls.push(`/api/images/${uploadStream.id}`);
        } catch (error) {
          console.error(`❌ Failed to process ${imageFile.name}:`, error);
        }
      } else {
        console.log(`⚠️ Skipping ${imageFile.name} - invalid size: ${imageFile.size} bytes`);
      }
    }

    console.log('🎯 Final images to save:', imageUrls.length);

    // TEMPORARY FIX: If no images, add a placeholder
    if (imageUrls.length === 0) {
      console.log('🔄 No valid images found, adding placeholder');
      imageUrls.push('https://via.placeholder.com/400x300?text=No+Image+Available');
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      console.log('📡 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log('✅ MongoDB connected');
    }
    console.log("Category: ", category);
    console.log("Condition: ", condition);
    console.log("City: ", city);
    // Create item
    const newItem = new Item({
      title,
      description,
      price,
      category,
      condition,
      city,
      area: area || '',
      phone,
      contactMethod,
      images: imageUrls,
      sellerId: user.userId || user.id || user.sub,
      sellerName: user.name || 'Unknown User',
      sellerEmail: user.email || 'unknown@example.com',
    });

    console.log('Title:', newItem.title);
    console.log('Description:', newItem.description);
    console.log('Price:', newItem.price);
    console.log('Category:', newItem.category);
    console.log('Condition:', newItem.condition);
    console.log('City:', newItem.city);
    console.log('Area:', newItem.area);
    console.log('Phone:', newItem.phone);
    console.log('Contact Method:', newItem.contactMethod);
    console.log('Images:', newItem.images);
    console.log('Seller ID:', newItem.sellerId);
    console.log('Seller Name:', newItem.sellerName);
    console.log('Seller Email:', newItem.sellerEmail);

    // Log as JSON (removes Mongoose methods, shows  plain object)
    console.log('newItem as JSON:', newItem.toJSON());


    await newItem.save();
    console.log('✅ Item created successfully with ID:', newItem._id);

    return NextResponse.json({
      success: true,
      id: newItem._id.toString(),
      message: 'Item listed successfully!',
      imagesCount: imageUrls.length
    });

  } catch (error) {
    console.error('❌ Error in sell API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Test endpoint
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Sell endpoint is working',
    timestamp: new Date().toISOString()
  });
}