// app/api/user/activity/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data - replace with actual database queries
  return NextResponse.json([
    {
      id: "1",
      type: "message",
      title: "New message about \"Vintage Camera\"",
      timestamp: "2 hours ago",
      link: "/messages/1"
    },
    {
      id: "2", 
      type: "like",
      title: "Your listing \"Wooden Chair\" got a like",
      timestamp: "5 hours ago",
      link: "/listings/2"
    }
  ]);
}