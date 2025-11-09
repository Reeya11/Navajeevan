// app/api/test-db/route.ts - FIXED
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    // Use the centralized connection instead of direct mongoose.connect
    await connectDB();
    
    return Response.json({ 
      success: true, 
      message: 'Database connected successfully via centralized connection' 
    });
  } catch (error) {
    // Proper TypeScript error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return Response.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}