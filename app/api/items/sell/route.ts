// app/api/items/sell/route.ts - SIMPLIFIED WITHOUT SHARP
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Define item schema
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
  sellerEmail: String,
  status: { type: String, default: 'active' },
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
    

    console.log('📝 Form data:', { 
      title, 
      price, 
      category, 
      condition,
      imagesCount: imageFiles.length 
    });

    // Validate required fields
    if (!title || !price || !category || !condition || !description || !city || !phone || !contactMethod) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    // Convert images to Base64 (SIMPLE APPROACH)
    const imageUrls: string[] = [];
    
    console.log('🖼️ Processing images:', imageFiles.length);
    
    for (const imageFile of imageFiles) {
      if (imageFile.size > 0 && imageFile.size < 10 * 1024 * 1024) { // 10MB limit
        try {
          console.log(`📸 Processing: ${imageFile.name} (${imageFile.size} bytes)`);
          
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString('base64');
          const dataUrl = `data:${imageFile.type};base64,${base64}`;
          
          imageUrls.push(dataUrl);
          console.log(`✅ Image processed: ${imageFile.name}`);
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
      status: 'active'
    });

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