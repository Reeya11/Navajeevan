// models/Message.ts
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

// Export the model
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);