import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';

// GET - Get all brands
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const brands = await Brand.find().sort({ createdAt: -1 });
    
    return Response.json(brands);

  } catch (error) {
    console.error('Error fetching brands:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create new brand
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { name, logo, isActive } = await request.json(); // Add isActive

    if (!name) {
      return Response.json({ error: 'Le nom de la marque est requis' }, { status: 400 });
    }

    await connectDB();

    const brand = await Brand.create({
      name: name.trim(),
      logo: logo?.trim() || '',
      isActive: isActive !== undefined ? isActive : true // Handle isActive
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