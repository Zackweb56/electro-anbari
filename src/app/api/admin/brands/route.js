// src/app/api/admin/brands/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';
import Product from '@/models/Product'; // Add this import

// GET - Get all brands with product counts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const brands = await Brand.find().sort({ createdAt: -1 }).lean();
    
    // Add product count to each brand
    const brandsWithProductCounts = await Promise.all(
      brands.map(async (brand) => {
        const productCount = await Product.countDocuments({ 
          brand: brand._id 
        });
        return {
          ...brand,
          productCount
        };
      })
    );

    return Response.json(brandsWithProductCounts);

  } catch (error) {
    console.error('Error fetching brands:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create new brand (keep this exactly as is)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { name, logo, isActive } = await request.json();

    if (!name) {
      return Response.json({ error: 'Le nom de la marque est requis' }, { status: 400 });
    }

    await connectDB();

    const brand = await Brand.create({
      name: name.trim(),
      logo: logo?.trim() || '',
      isActive: isActive !== undefined ? isActive : true
    });

    return Response.json({ 
      message: 'Marque créée avec succès',
      brand 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating brand:', error);
    
    if (error.code === 11000) {
      return Response.json({ error: 'Une marque avec ce nom existe déjà' }, { status: 400 });
    }
    
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}