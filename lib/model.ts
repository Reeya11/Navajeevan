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
  createdAt: { type: Date, default: Date.now }
});

// Export models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);