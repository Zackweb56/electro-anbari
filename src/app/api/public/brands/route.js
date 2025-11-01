// src/app/api/public/brands/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Brand from '@/models/Brand';

export async function GET() {
  try {
    await dbConnect();

    const brands = await Brand.find({ isActive: true })
      .select('name logo isActive')
      .sort({ name: 1 });

    console.log('📊 Brands found:', brands.length);
    brands.forEach(brand => {
      console.log(`📝 Brand: ${brand.name}`, {
        hasLogo: !!brand.logo,
        logo: brand.logo,
        logoLength: brand.logo?.length,
        isActive: brand.isActive
      });
    });

    const response = brands.map(brand => ({
      _id: brand._id.toString(),
      name: brand.name,
      logo: brand.logo,
      isActive: brand.isActive
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des marques' },
      { status: 500 }
    );
  }
}