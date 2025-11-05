// app/api/items/sell/route.ts - UPDATED WITH IMAGE COMPRESSION
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import sharp from 'sharp';

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

// Image compression function
async function compressAndConvertImage(imageFile: File): Promise<string> {
  console.log(`🔧 Processing image: ${imageFile.name} (${imageFile.size} bytes)`);
  
  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use sharp to compress and resize the image
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 800, { // Maximum dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 80, // Good quality with compression
        progressive: true 
      })
      .toBuffer();
    
    console.log(`✅ Image compressed: ${buffer.length} → ${compressedBuffer.length} bytes`);
    
    const base64 = compressedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    
    return dataUrl;
  } catch (error) {
    console.error(`❌ Compression failed for ${imageFile.name}:`, error);
    
    // Fallback: convert without compression
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${imageFile.type};base64,${base64}`;
    
    console.log(`🔄 Using fallback conversion for ${imageFile.name}`);
    return dataUrl;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    console.log('🍪 Full cookie header:', cookieHeader);
    
    const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('auth-token='));
    const token = tokenCookie?.split('=')[1];

    console.log('🔐 Token found:', !!token);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 });
    }

    let user;
    try {
      user = verifyToken(token);
      console.log('✅ Token verified successfully');
      console.log('👤 User from token:', user);
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // 🖼️ DEBUG: Check all FormData keys and images
    console.log('📋 All FormData keys:');
    const allKeys = [];
    for (const key of formData.keys()) {
      allKeys.push(key);
      const value = formData.get(key);
      const valueType = value instanceof File ? 'object' : 'string';
      console.log(` - ${key} (value type: ${valueType} )`);
    }
    console.log('🔍 Total keys found:', allKeys.length);

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

    // 🎯 DEBUG: Detailed image info
    console.log('🖼️ Image files received:', imageFiles.length);
    if (imageFiles.length > 0) {
      console.log('📁 Image files details:');
      imageFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} | Size: ${file.size} bytes | Type: ${file.type}`);
      });
    } else {
      console.log('❌ NO IMAGES FOUND in FormData!');
    }

    // Validate required fields
    if (!title || !price || !category || !condition || !description || !city || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      );
    }

    // Convert images to Base64 with compression
    const imageUrls: string[] = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
    
    for (const imageFile of imageFiles) {
      console.log('🔄 Processing image:', imageFile.name, 'Size:', imageFile.size);
      
      // Skip if file is too large (safety check)
      if (imageFile.size > 20 * 1024 * 1024) {
        console.log('❌ Image too large, skipping:', imageFile.name);
        continue;
      }
      
      if (imageFile.size > 0) {
        try {
          // Use compression for images larger than 1MB, or process all with compression
          if (imageFile.size > 1 * 1024 * 1024) {
            console.log('🔧 Compressing large image...');
            const dataUrl = await compressAndConvertImage(imageFile);
            imageUrls.push(dataUrl);
          } else {
            console.log('📸 Processing small image directly...');
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${imageFile.type};base64,${base64}`;
            imageUrls.push(dataUrl);
          }
          console.log('✅ Image processed successfully');
        } catch (error) {
          console.error('❌ Image processing failed:', error);
          // Continue with other images even if one fails
        }
      } else {
        console.log('❌ Image skipped - empty file:', imageFile.name);
      }
    }

    console.log('🎯 Final image URLs to save:', imageUrls.length);
    if (imageUrls.length > 0) {
      console.log('📸 First image preview (first 100 chars):', imageUrls[0].substring(0, 100) + '...');
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log('📡 Connected to MongoDB');
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
      contactMethod: contactMethod || 'phone',
      images: imageUrls,
      sellerId: user.userId || user.id || user.sub,
      sellerName: user.name || user.username || 'Unknown User',
      sellerEmail: user.email || 'unknown@example.com',
    });

    await newItem.save();

    console.log('✅ Item created successfully!');
    console.log('📦 Item details:', {
      id: newItem._id.toString(),
      title: newItem.title,
      price: newItem.price,
      imagesCount: newItem.images.length,
      seller: newItem.sellerName
    });

    return NextResponse.json({ 
      success: true,
      id: newItem._id.toString(),
      message: 'Item listed successfully!',
      imagesCount: imageUrls.length
    });

  } catch (error) {
    console.error('❌ Error creating item:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Sell endpoint is working',
    timestamp: new Date().toISOString()
  });
}