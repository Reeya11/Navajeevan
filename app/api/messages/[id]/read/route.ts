// app/api/messages/[id]/read/route.ts - FIXED WITH TYPES
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Define proper TypeScript interfaces
interface MessageType {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface ConversationType {
  itemId: mongoose.Types.ObjectId;
  itemTitle: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  messages: MessageType[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<ConversationType>({
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

const Message = mongoose.models.Message || mongoose.model<ConversationType>('Message', messageSchema);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { readerId } = await request.json();

    console.log(`📖 Marking messages as read for conversation: ${id}, reader: ${readerId}`);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const conversation = await Message.findById(id);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    let markedCount = 0;
    
    // Mark all messages as read where sender is NOT the reader
    conversation.messages.forEach((message: MessageType) => { // ← ADDED TYPE HERE
      if (!message.read && message.senderId !== readerId) {
        message.read = true;
        markedCount++;
      }
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    console.log(`✅ Marked ${markedCount} messages as read`);

    return NextResponse.json(conversation);

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' }, 
      { status: 500 }
    );
  }
}