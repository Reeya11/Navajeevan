// lib/models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: String, // if you have password authentication
  createdAt: { type: Date, default: Date.now }
});

// Export the model
export default mongoose.models.User || mongoose.model('User', userSchema);