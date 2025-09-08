// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Google OAuth configuration
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  const params = {
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  };

  Object.entries(params).forEach(([key, value]) => {
    googleAuthUrl.searchParams.append(key, value);
  });

  return NextResponse.redirect(googleAuthUrl.toString());
}