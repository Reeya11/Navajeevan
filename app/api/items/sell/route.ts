// app/api/items/sell/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // DEBUG: Log all form data keys
    console.log('🔍 FormData keys:');
    for (const key of formData.keys()) {
      console.log(' -', key);
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
    const imageFiles = formData.getAll('images') as File[];

    console.log('📸 Image files found:', imageFiles.length);
    console.log('📏 First image size:', imageFiles[0]?.size, 'bytes');
    console.log('📏 First image type:', imageFiles[0]?.type);

    // Convert images to Base64
    const imageUrls: string[] = [];
    
    for (const imageFile of imageFiles) {
      if (imageFile && imageFile.size > 0) {
        try {
          console.log('🔄 Converting image:', imageFile.name);
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString('base64');
          const dataUrl = `data:${imageFile.type};base64,${base64}`;
          imageUrls.push(dataUrl);
          console.log('✅ Image converted, length:', dataUrl.length);
        } catch (error) {
          console.error('❌ Image conversion failed:', error);
        }
      }
    }

    console.log('📁 Final image URLs:', imageUrls.length);

    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create item in database
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
      sellerId: 'current-user-id',
      sellerName: 'Current User',
    });

    await newItem.save();

    console.log('💾 Item saved. Images in DB:', newItem.images.length);

    return NextResponse.json({ 
      id: newItem._id.toString(),
      imageCount: imageUrls.length, // Add this to response
      message: 'Item listed successfully!' 
    });

  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}