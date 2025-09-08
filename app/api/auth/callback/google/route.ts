// app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getGoogleUserInfo } from '@/lib/google-auth';
import { createAuthToken } from '@/lib/auth';
import User from '@/models/User';
import connect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 Google callback triggered');
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Connect to database
    await connect();
    console.log('✅ Connected to database');

    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
    const tokens = await exchangeCodeForTokens(code);
    
    // Get user info from Google
    console.log('👤 Getting user info from Google...');
    const userInfo = await getGoogleUserInfo(tokens.access_token);
    console.log('📧 Google user email:', userInfo.email);
    
    // Check if user exists in your DB, create if not
    console.log('💾 Finding/creating user in DB...');
    const user = await findOrCreateUser(userInfo);
    console.log('✅ User processed:', user.email);
    
    // Create JWT token
    console.log('🔐 Creating auth token...');
    const token = createAuthToken(user);
    console.log('✅ Auth token created');
    
    // Create redirect response
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Set the cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax'
    });

    console.log('🍪 Cookie set successfully');
    console.log('🚀 Redirecting to dashboard...');
    
    return response;

  } catch (error) {
    console.error('❌ Google auth error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}

// SIMPLIFIED Helper function - works without the static method
async function findOrCreateUser(googleUser: any) {
  try {
    console.log('🔍 Looking for user in database with email:', googleUser.email);
    
    // Try to find existing user by email
    const existingUser = await User.findOne({ email: googleUser.email });
    
    if (existingUser) {
      console.log('✅ Found existing user:', existingUser.email);
      
      // Update user to Google auth if needed
      if (existingUser.authProvider === 'email') {
        existingUser.authProvider = 'google';
        existingUser.emailVerified = true;
        if (googleUser.picture) existingUser.profilePicture = googleUser.picture;
        await existingUser.save();
        console.log('🔄 Updated user to Google auth');
      }
      
      return {
        id: existingUser._id.toString(),
        email: existingUser.email,
        name: existingUser.name
      };
    }
    
    // Create new user if doesn't exist
    console.log('👤 Creating new user for:', googleUser.email);
    const newUser = new User({
      name: googleUser.name,
      email: googleUser.email,
      profilePicture: googleUser.picture || '',
      authProvider: 'google',
      emailVerified: true
      // password field is optional - will be omitted automatically
    });
    
    const savedUser = await newUser.save();
    console.log('✅ New user created with ID:', savedUser._id.toString());
    
    return {
      id: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name
    };
    
  } catch (error) {
    console.error('❌ Database error, using fallback user:', error);
    
    // Fallback: return basic user data without database
    return {
      id: 'temp-user-id-' + Date.now(),
      email: googleUser.email,
      name: googleUser.name
    };
  }
}