import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Admin from '@/models/Admin.js';

export async function POST(request) {
  try {
    // SECURITY: Only allow setup in development or if no admin exists
    // In production, you should use a secret token or environment variable
    const setupToken = request.headers.get('x-setup-token');
    const allowedToken = process.env.SETUP_TOKEN;
    
    // If SETUP_TOKEN is set, require it
    if (allowedToken && setupToken !== allowedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 400 }
      );
    }

    // Create the admin
    const admin = new Admin({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'superadmin'
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
