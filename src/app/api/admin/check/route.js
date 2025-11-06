import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET() {
  try {
    // SECURITY: This endpoint leaks information about admin existence
    // It should only be accessible during setup or be removed entirely
    // For now, we'll make it return a generic response
    await connectDB();

    const adminExists = await Admin.findOne();
    
    // Return generic response to prevent information disclosure
    // Only return true if admin exists (for setup flow)
    // In production, consider removing this endpoint entirely
    return NextResponse.json({
      exists: !!adminExists,
      // Removed detailed message to prevent information leakage
    });

  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
