// lib/models/Item.ts
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
  sellerEmail: String,
  status: { type: String, default: 'active' },
  soldAt: Date,
  soldTo: String,
  soldToName: String,
  transactionId: String,
  paymentProvider: String,
  paymentAmount: Number,
  createdAt: { type: Date, default: Date.now }
});

// Export the model
export default mongoose.models.Item || mongoose.model('Item', itemSchema);