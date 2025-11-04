// app/api/items/[id]/route.ts
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
// ADD TO YOUR EXISTING app/api/items/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('✏️ Updating item:', params.id);
    
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const formData = await request.formData();
    
    // Extract form data (same as sell route)
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const condition = formData.get('condition') as string;
    const description = formData.get('description') as string;
    const city = formData.get('city') as string;
    const area = formData.get('area') as string;
    const phone = formData.get('phone') as string;
    const contactMethod = formData.get('contactMethod') as string;

    // For now, we'll keep existing images
    // Later you can add image update functionality

    const updatedItem = await Item.findByIdAndUpdate(
      params.id,
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
        // images: existing images are preserved
      },
      { new: true } // Return updated document
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

// ADD TO YOUR EXISTING app/api/items/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const item = await Item.findById(params.id);
    
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ Deleting item:', params.id);
    
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const result = await Item.findByIdAndDelete(params.id);
    
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