// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Message schema (same as before)
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

// GET: Fetch user's conversations
export async function GET(request: NextRequest) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // For now, return mock data - we'll make it user-specific later
    const conversations = await Message.find()
      .sort({ updatedAt: -1 })
      .limit(10);

    return NextResponse.json(conversations);

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' }, 
      { status: 500 }
    );
  }
}

// POST: Start a new conversation
export async function POST(request: NextRequest) {
  try {
    const { itemId, itemTitle, sellerId, sellerName, buyerId, buyerName, buyerEmail, initialMessage } = await request.json();

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Check if conversation already exists
    const existingConversation = await Message.findOne({
      itemId,
      buyerId,
      sellerId
    });

    if (existingConversation) {
      // Add message to existing conversation
      existingConversation.messages.push({
        senderId: buyerId,
        senderName: buyerName,
        text: initialMessage,
        timestamp: new Date()
      });
      existingConversation.updatedAt = new Date();
      await existingConversation.save();
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const newConversation = new Message({
      itemId,
      itemTitle,
      sellerId,
      sellerName,
      buyerId,
      buyerName,
      buyerEmail,
      messages: [{
        senderId: buyerId,
        senderName: buyerName,
        text: initialMessage,
        timestamp: new Date()
      }]
    });

    await newConversation.save();
    return NextResponse.json(newConversation);

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' }, 
      { status: 500 }
    );
  }
}