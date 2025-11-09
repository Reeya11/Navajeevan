import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connect from '@/lib/mongodb';
import User from '@/models/User';

// Helper function to create a JWT token
const signToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  // Fix: Cast the secret to jwt.Secret and use a more specific approach
  return jwt.sign(
    { id }, 
    secret as jwt.Secret, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions // Add this type assertion
  );
};

export async function POST(request: NextRequest) {
  try {
    await connect();

    const { email, password } = await request.json();

    // 1. Check if email and password exist
    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ message: 'Please provide email and password' }),
        { status: 400 }
      );
    }

    // 2. Find the user and select the password field
    const user = await User.findOne({ email }).select('+password');

    // 3. Check if user exists and password is correct
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'Incorrect email or password' }),
        { status: 401 }
      );
    }

    const isPasswordValid = await (user as any).comparePassword(password);
    
    if (!isPasswordValid) {
      return new NextResponse(
        JSON.stringify({ message: 'Incorrect email or password' }),
        { status: 401 }
      );
    }

    // 4. Generate JWT token
    const token = jwt.sign(
  {
    userId: user._id.toString(),
    email: user.email,
    name: user.name
  },
  process.env.JWT_SECRET as jwt.Secret,
  {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions
);

    // 5. Create the response with HTTP-only cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email 
        },
      },
      { status: 200 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'An internal server error occurred' }),
      { status: 500 }
    );
  }
}