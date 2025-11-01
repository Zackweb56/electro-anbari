import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Brand from '@/models/Brand';

export async function GET() {
  try {
    await dbConnect();

    const brands = await Brand.find({ isActive: true })
      .select('name logo isActive')
      .sort({ name: 1 });

    return NextResponse.json({ 
      success: true, 
      brands: brands.map(brand => ({
        _id: brand._id,
        name: brand.name,
        logo: brand.logo,
        isActive: brand.isActive
      }))
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des marques' },
      { status: 500 }
    );
  }
}