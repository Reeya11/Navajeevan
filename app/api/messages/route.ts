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
  // GET: Fetch ONLY current user's conversations
export async function GET(request: NextRequest) {
  try {
    // Get current user from auth token
    const cookieHeader = request.headers.get('cookie');
    const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('auth-token='));
    const token = tokenCookie?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user ID
    const jwt = require('jsonwebtoken');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    const currentUserId = decodedToken.userId;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // CRITICAL: Only return conversations where current user is either buyer OR seller
    const conversations = await Message.find({
      $or: [
        { buyerId: currentUserId },   // User is the buyer
        { sellerId: currentUserId }   // User is the seller
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(20);

    console.log(`🔍 Found ${conversations.length} conversations for user ${currentUserId}`);

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