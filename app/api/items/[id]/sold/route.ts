// app/api/items/[id]/sold/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { verifyToken } from '@/lib/jwt';
import Item from '@/lib/models/Item';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params first
    const resolvedParams = await params;
    const itemId = resolvedParams.id;

    console.log(`🔄 Starting mark as sold process for item: ${itemId}`);

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    const userId = decodedToken.userId;
    const userName = decodedToken.name;

    const { transactionId, provider, amount } = await request.json();

    await connectDB();

    // Find the item first
    const item = await Item.findById(itemId);
    
    if (!item) {
      console.log('❌ Item not found in database');
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // NEW: OWNERSHIP CHECK - Critical security layer
    if (item.sellerId === userId) {
      console.error('🚫 OWNERSHIP VIOLATION - User tried to buy their own item:', {
        userId,
        sellerId: item.sellerId,
        itemId: itemId,
        itemTitle: item.title
      });
      return NextResponse.json({ 
        success: false,
        error: 'You cannot buy your own item' 
      }, { status: 400 });
    }

    console.log('✅ Ownership check passed - marking item as sold');

    // Mark the item as sold
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      {
        status: 'sold',
        soldAt: new Date(),
        soldTo: userId,
        soldToName: userName,
        transactionId: transactionId,
        paymentProvider: provider,
        paymentAmount: amount
      },
      { new: true }
    );

    console.log(`✅ Item ${itemId} marked as sold by user ${userId}`);
    console.log('📊 Sale details:', {
      itemTitle: updatedItem?.title,
      price: updatedItem?.price,
      buyer: userName,
      transactionId: transactionId
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Item marked as sold successfully',
      item: updatedItem
    });

  } catch (error) {
    console.error('Error marking item as sold:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}