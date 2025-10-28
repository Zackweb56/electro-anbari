import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find({ isActive: true })
      .select('name image isActive')
      .sort({ name: 1 });

    return NextResponse.json({ 
      success: true, 
      categories: categories.map(cat => ({
        _id: cat._id,
        name: cat.name,
        image: cat.image,
        isActive: cat.isActive
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}