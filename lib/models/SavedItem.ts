import mongoose from 'mongoose';

const savedItemSchema = new mongoose.Schema({
  userId: String,
  itemId: String,
  savedAt: { type: Date, default: Date.now }
});

export default mongoose.models.SavedItem || mongoose.model('SavedItem', savedItemSchema);