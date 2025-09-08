// app/api/auth/me/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import connect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

// Token verification function
const verifyToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, secret as jwt.Secret);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('🔐 Auth check - Cookie found:', !!token);
    
    if (!token) {
      console.log('❌ No auth token found in cookies');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || typeof decoded !== 'object') {
      console.log('❌ Invalid token format:', decoded);
      const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
      return response;
    }

    console.log('✅ Token decoded successfully:', decoded);
    
    // FIX: Check if this is a temporary Google user or database user
    if (decoded.userId && decoded.userId.startsWith('temp-user-id-')) {
      // This is a Google user - return the info from the token itself
      console.log('🔑 Returning Google user from token');
      return NextResponse.json({
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name
      });
    }
    
    // FIX: Also check for 'id' field as fallback (some tokens might use different field names)
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      console.log('❌ No user ID found in token:', decoded);
      return NextResponse.json({ error: 'Invalid token: no user ID' }, { status: 401 });
    }

    console.log('🔍 Looking for user in database with ID:', userId);
    
    // Find user in database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found in database for ID:', userId);
      // For now, return the user info from the token itself
      return NextResponse.json({
        id: userId,
        email: decoded.email || 'unknown',
        name: decoded.name || 'User'
      });
    }

    console.log('✅ Database user found:', user.email);
    
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email
    });
    
  } catch (error) {
    console.error('❌ Auth me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}