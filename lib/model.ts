// lib/models.ts
import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  profilePicture: String,
  authProvider: String,
  emailVerified: Boolean,
  createdAt: { type: Date, default: Date.now }
});

// Item Schema  
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
  // ADD THESE NEW FIELDS FOR SOLD TRACKING:
  status: { 
    type: String, 
    default: 'active', // active, sold
    enum: ['active', 'sold'] // Only allow these values
  },
  soldAt: { 
    type: Date 
  },
  soldTo: { 
    type: String // buyer's user ID
  },
  soldToName: { 
    type: String // buyer's name
  },
  transactionId: { 
    type: String // payment transaction ID
  },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.models.Item || mongoose.model('Item', itemSchema);