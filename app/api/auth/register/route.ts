import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    // 1. Connect to the database
    await connect();

    // 2. Get the user data from the request body
    const { name, email, password } = await request.json();

    // 3. Validate input (basic validation)
    if (!name || !email || !password) {
      return new NextResponse(
        JSON.stringify({ message: 'All fields are required' }),
        { status: 400 }
      );
    }

    // 4. Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return new NextResponse(
        JSON.stringify({ message: 'User already exists' }),
        { status: 409 } // 409 Conflict
      );
    }

    // 5. Create the new user (the pre-save middleware will hash the password)
    const user = await User.create({
      name,
      email,
      password, // This will be hashed automatically by the schema's pre-save hook
    });

    // 6. Return success response (omit the password from the response)
    return new NextResponse(
      JSON.stringify({
        message: 'User created successfully',
        user: { id: user._id, name: user.name, email: user.email },
      }),
      { status: 201 } // 201 Created
    );
  } catch (error: any) {
    // 7. Handle any errors
    return new NextResponse(
      JSON.stringify({ message: error.message || 'An error occurred' }),
      { status: 500 }
    );
  }
}