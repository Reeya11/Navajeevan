// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🚪 Logout requested');
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      path: '/',
    });

    console.log('✅ Cookie cleared');
    return response;
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}