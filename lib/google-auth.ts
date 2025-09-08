// lib/google-auth.ts
export async function exchangeCodeForTokens(code: string) {
  console.log('🔄 Starting token exchange...');
  console.log('🔑 Client ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
  console.log('🔒 Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
  console.log('🌐 Redirect URI:', `${process.env.NEXTAUTH_URL}/api/auth/callback/google`);
  console.log('📋 Code:', code);

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    console.log('📊 Google API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google API error details:', errorText);
      throw new Error(`Google API error: ${response.status} - ${errorText}`);
    }

    const tokens = await response.json();
    console.log('✅ Token exchange successful');
    console.log('🔐 Access token:', tokens.access_token ? 'RECEIVED' : 'MISSING');
    console.log('🔄 Refresh token:', tokens.refresh_token ? 'RECEIVED' : 'MISSING');
    
    return tokens;
    
  } catch (error) {
    console.error('💥 Token exchange failed:', error);
    throw error;
  }
}

export async function getGoogleUserInfo(accessToken: string) {
  console.log('👤 Fetching user info with access token...');
  
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('📊 User info response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ User info error:', errorText);
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    const userInfo = await response.json();
    console.log('✅ User info received:', userInfo.email);
    
    return userInfo;
    
  } catch (error) {
    console.error('💥 User info fetch failed:', error);
    throw error;
  }
}