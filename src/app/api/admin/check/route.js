import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Admin from '../../models/Admin';

export async function GET() {
  try {
    await connectDB();

    const adminExists = await Admin.findOne();
    
    return NextResponse.json({
      exists: !!adminExists,
      message: adminExists ? 'Admin account exists' : 'No admin account found'
    });

  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
