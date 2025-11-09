// lib/mongodb.ts - FIXED
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

// Mongoose connection options - REMOVED bufferMaxEntries
const options: mongoose.ConnectOptions = {
  bufferCommands: false,      // ← This is the important one
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

// Global cache for Mongoose connection with TypeScript
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global type
declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('🔌 Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Creating new MongoDB connection...');
    
    cached.promise = mongoose.connect(MONGODB_URI as string, options)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully via Mongoose');
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  // Store in global for hot reload in development
  if (process.env.NODE_ENV !== 'production') {
    global.mongoose = cached;
  }

  return cached.conn;
}

export default connectDB;