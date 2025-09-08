// lib/auth.ts - FIXED
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  name: string;
}

export function createAuthToken(user: User): string {
  console.log('🛠️ Creating token for user:', user.email); // DEBUG
  
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is missing!'); // DEBUG
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      name: user.name // ✅ ADD THIS - CRITICAL!
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  console.log('✅ Token created successfully'); // DEBUG
  return token;
}

export function verifyAuthToken(token: string): any {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function decodeAuthToken(token: string): any {
  return jwt.decode(token);
}