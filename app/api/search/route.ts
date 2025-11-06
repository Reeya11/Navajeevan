import { NextRequest, NextResponse } from 'next/server';
import { getSearchInstance } from '@/app/utils/hybridSearch';
import mongoose from 'mongoose';

// Add the same Mongoose model definition as your categories API
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

async function getProductsFromDatabase(filters: any = {}) {
  try {
    // Use Mongoose instead of raw MongoDB (same as categories API)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    console.log('🔍 Building Mongoose query with filters:', filters);

    // Build Mongoose query
    let query = Item.find();

    if (filters.category) {
      query = query.where('category').equals(filters.category);
    }
    if (filters.minPrice || filters.maxPrice) {
      const priceFilter: any = {};
      if (filters.minPrice) priceFilter.$gte = parseInt(filters.minPrice);
      if (filters.maxPrice) priceFilter.$lte = parseInt(filters.maxPrice);
      query = query.where('price', priceFilter);
    }
    if (filters.location) {
      query = query.where('city').regex(new RegExp(filters.location, 'i'));
    }
    if (filters.condition) {
      query = query.where('condition').equals(filters.condition);
    }

    const products = await query.exec();
    
    console.log('📦 Products from Mongoose:', products.length);
    console.log('🏷️ Mongoose product titles:', products.map(p => p.title));
    
    // Convert to Product format
    const convertedProducts = products.map((product: any) => ({
      id: product._id.toString(),
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      condition: product.condition,
      location: product.city, // Map 'city' to 'location'
      sellerId: product.sellerId,
      images: product.images || [],
      createdAt: product.createdAt || new Date()
    }));

    console.log('🔄 Converted products:', convertedProducts.map(p => p.title));
    return convertedProducts;
    
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const maxPrice = searchParams.get('maxPrice');
    const minPrice = searchParams.get('minPrice');
    const location = searchParams.get('location');
    const condition = searchParams.get('condition');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('🎯 API CALLED with query:', query);
    console.log('🎯 API filters:', { category, maxPrice, minPrice, location, condition });

    const searchInstance = getSearchInstance();
    
    // Build filters for database query
    const dbFilters = {
      ...(category && { category }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(location && { location }),
      ...(condition && { condition })
    };

    console.log('🔍 Database filters:', dbFilters);

    // Get real products from MongoDB using Mongoose
    const products = await getProductsFromDatabase(dbFilters);
    
    console.log('📦 Products loaded:', products.length);
    console.log('🏷️ Product titles:', products.map(p => p.title));

    if (products.length === 0) {
      console.log('❌ NO PRODUCTS FOUND IN DATABASE');
      return NextResponse.json({
        success: true,
        data: {
          query: query || '',
          filters: dbFilters,
          results: [],
          total: 0
        }
      });
    }

    // Set products in search instance
    searchInstance.setProducts(products);

    // Perform hybrid search
    const searchFilters = {
      ...(category && { category }),
      ...(minPrice && { minPrice: parseInt(minPrice) }),
      ...(maxPrice && { maxPrice: parseInt(maxPrice) }),
      ...(location && { location }),
      ...(condition && { condition: condition as any })
    };

    console.log('🎯 Starting hybrid search...');
    const results = searchInstance.hybridSearch(query || '', searchFilters, limit);
    console.log('🎯 Hybrid search completed. Results:', results.length);

    return NextResponse.json({
      success: true,
      data: {
        query: query || '',
        filters: searchFilters,
        results: results.map(r => ({
          id: r.product.id,
          title: r.product.title,
          description: r.product.description,
          category: r.product.category,
          price: r.product.price,
          condition: r.product.condition,
          location: r.product.location,
          images: r.product.images,
          score: Math.round(r.score * 100) / 100,
          matchType: r.matchType,
          createdAt: r.product.createdAt
        })),
        total: results.length
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during search' },
      { status: 500 }
    );
  }
}