// app/api/items/route.ts - FINAL FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Item from '@/lib/models/Item';
import User from '@/lib/models/User';

// JWT verification function
function verifyToken(token: string): any {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Get real user ID (converts temporary IDs to real MongoDB IDs)
async function getRealUserId(token: string): Promise<string> {
  const decodedToken = verifyToken(token);
  let realUserId = decodedToken.userId;

  // If it's a temporary ID, find or create real user in database
  if (realUserId.startsWith('temp-user-id-')) {
    console.log('🔄 Temporary ID detected, finding real user...');
    
    let realUser = await User.findOne({ email: decodedToken.email });
    
    if (!realUser) {
      console.log('👤 Creating new user in database...');
      realUser = await User.create({
        email: decodedToken.email,
        name: decodedToken.name
      });
    }
    
    realUserId = realUser._id.toString();
    console.log('✅ Using real user ID:', realUserId);
  }

  return realUserId;
}

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const condition = searchParams.get('condition') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest';

    await connectDB();

    // Build filter object - INCLUDE ITEMS WITH STATUS OR WITHOUT
    const filter: any = {
      $or: [
        { status: 'active' },
        { status: { $exists: false } } // Include items without status field
      ]
    };

    // Search in title and description
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Category filter (case-insensitive)
    if (category) {
      filter.$and = filter.$and || [];
      filter.$and.push({ category: { $regex: category, $options: 'i' } });
    }

    // Condition filter
    if (condition) {
      filter.$and = filter.$and || [];
      filter.$and.push({ condition: condition });
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.$and = filter.$and || [];
      const priceFilter: any = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter.$and.push({ price: priceFilter });
    }

    console.log('🔍 Search filters:', filter);

    // Build sort object
    let sort: any = { createdAt: -1 }; // Default: newest first
    
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
    }

    const items = await Item.find(filter)
      .sort(sort)
      .select('title price images condition city area description createdAt category sellerId sellerName sellerEmail status')
      .limit(50);

    console.log(`✅ Found ${items.length} items`);
    
    return NextResponse.json({
      success: true,
      items: items,
      count: items.length
    });

  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting item creation process...');
    
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    console.log('🍪 Raw cookie header:', cookieHeader);
    
    const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('auth-token='));
    const token = tokenCookie?.split('=')[1];

    console.log('🔐 Auth check:', {
      hasCookieHeader: !!cookieHeader,
      tokenFound: !!token,
      tokenLength: token?.length
    });

    if (!token) {
      console.log('❌ No auth token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    // Get real user ID
    console.log('👤 Verifying user...');
    const realUserId = await getRealUserId(token);
    const decodedToken = verifyToken(token);

    console.log('✅ User authenticated:', {
      userId: realUserId,
      userName: decodedToken.name,
      userEmail: decodedToken.email
    });

    // Handle FormData
    console.log('📦 Processing form data...');
    const formData = await request.formData();
    
    // Log all form fields for debugging
    const formFields: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      formFields[key] = value;
    }
    console.log('📋 Form fields received:', formFields);

    // Extract and validate required fields
    const title = formData.get('title') as string;
    const priceStr = formData.get('price') as string;
    const category = formData.get('category') as string;
    const condition = formData.get('condition') as string;
    const city = formData.get('city') as string;
    const phone = formData.get('phone') as string;
    const contactMethod = formData.get('contactMethod') as string;
    const imagesData = formData.get('images') as string;

    console.log('🔍 Validating required fields...');
    
    // Validate required fields
    if (!title || !priceStr || !category || !condition || !city || !phone || !contactMethod) {
      console.error('❌ Missing required fields:', {
        title: !!title, 
        price: !!priceStr, 
        category: !!category, 
        condition: !!condition, 
        city: !!city, 
        phone: !!phone, 
        contactMethod: !!contactMethod
      });
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Parse price
    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      console.error('❌ Invalid price:', priceStr);
      return NextResponse.json({ 
        error: 'Invalid price format' 
      }, { status: 400 });
    }

    // Handle images - safely parse JSON or use empty array
    let images: string[] = [];
    if (imagesData) {
      try {
        images = JSON.parse(imagesData);
        if (!Array.isArray(images)) {
          images = [];
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse images, using empty array');
        images = [];
      }
    }

    console.log('💾 Creating item document...');
    
    // Create new item - STATUS WILL BE SET AUTOMATICALLY BY THE MODEL SCHEMA
    const newItem = new Item({
      title: title.trim(),
      description: (formData.get('description') as string || '').trim(),
      price: price,
      category: category.trim(),
      condition: condition.trim(),
      city: city.trim(),
      area: (formData.get('area') as string || '').trim(),
      phone: phone.trim(),
      contactMethod: contactMethod.trim(),
      images: images,
      sellerId: realUserId,
      sellerEmail: decodedToken.email,
      sellerName: decodedToken.name
      // status: 'active' is automatically set by the schema default
    });

    console.log('📄 Item document before save:', {
      title: newItem.title,
      status: newItem.status, // Check if status exists
      hasStatus: 'status' in newItem
    });

    console.log('💿 Saving to database...');
    await newItem.save();
    
    console.log('✅ Item created successfully:', {
      id: newItem._id,
      title: newItem.title,
      seller: newItem.sellerName,
      price: newItem.price,
      status: newItem.status // Check final status
    });

    return NextResponse.json({ 
      success: true, 
      item: {
        _id: newItem._id,
        title: newItem.title,
        price: newItem.price,
        category: newItem.category,
        sellerName: newItem.sellerName,
        status: newItem.status
      }
    });

  } catch (error) {
    console.error('❌ Error creating item:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}