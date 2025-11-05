// app/api/messages/[id]/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemTitle: String,
  sellerId: { type: String, required: true },
  sellerName: String,
  buyerId: { type: String, required: true },
  buyerName: String,
  buyerEmail: String,
  messages: [{
    senderId: String,
    senderName: String,
    text: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// GET: Fetch specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // AWAIT the params
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const conversation = await Message.findById(id); // Use the awaited id
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json(conversation);

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' }, 
      { status: 500 }
    );
  }
}

// POST: Add message to conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Add Promise wrapper here too
) {
  try {
    const { id } = await params; // AWAIT the params first
    const { senderId, senderName, text } = await request.json();

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const conversation = await Message.findById(id); // Use the awaited id
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    conversation.messages.push({
      senderId,
      senderName,
      text,
      timestamp: new Date()
    });
    conversation.updatedAt = new Date();

    await conversation.save();
    return NextResponse.json(conversation);

  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' }, 
      { status: 500 }
    );
  }
}