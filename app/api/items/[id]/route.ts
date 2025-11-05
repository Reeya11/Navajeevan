// app/api/items/[id]/route.ts - FIXED
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

// PUT - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Add Promise wrapper
) {
  try {
    const { id } = await params; // AWAIT the params first
    console.log('✏️ Updating item:', id);
    
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const formData = await request.formData();
    
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

    const updatedItem = await Item.findByIdAndUpdate(
      id, // Use the awaited id
      {
        title,
        description,
        price,
        category,
        condition,
        city,
        area: area || '',
        phone,
        contactMethod,
      },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Item not found' }, 
        { status: 404 }
      );
    }

    console.log('✅ Item updated successfully');
    return NextResponse.json({ 
      message: 'Item updated successfully',
      item: updatedItem 
    });

  } catch (error) {
    console.error('❌ Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' }, 
      { status: 500 }
    );
  }
}

// GET - Fetch specific item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params; // AWAIT the params first
    
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const item = await Item.findById(id); // Use the awaited id
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(item);

  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' }, 
      { status: 500 }
    );
  }
}

// DELETE - Remove item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Add Promise wrapper
) {
  try {
    const { id } = await params; // AWAIT the params first
    console.log('🗑️ Deleting item:', id);
    
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const result = await Item.findByIdAndDelete(id); // Use the awaited id
    
    if (!result) {
      return NextResponse.json(
        { error: 'Item not found' }, 
        { status: 404 }
      );
    }

    console.log('✅ Item deleted successfully');
    return NextResponse.json({ message: 'Item deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' }, 
      { status: 500 }
    );
  }
}