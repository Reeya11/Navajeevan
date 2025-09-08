// app/api/user/stats/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data - replace with actual database queries
  return NextResponse.json({
    totalListings: 12,
    activeListings: 8,
    totalMessages: 24,
    soldItems: 4
  });
}