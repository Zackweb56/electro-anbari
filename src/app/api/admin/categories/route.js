// src/app/api/admin/categories/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product'; // Ajouter cette importation

// GET - Get all categories with product counts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    
    // Add product count to each category
    const categoriesWithProductCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category._id 
        });
        return {
          ...category,
          productCount
        };
      })
    );

    return Response.json(categoriesWithProductCounts);

  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create new category (garder exactement comme avant)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { name, image, isActive } = await request.json();

    if (!name) {
      return Response.json({ error: 'Le nom de la catégorie est requis' }, { status: 400 });
    }

    await connectDB();

    const category = await Category.create({
      name: name.trim(),
      image: image?.trim() || '',
      isActive: isActive !== undefined ? isActive : true
    });

    return Response.json({ 
      message: 'Catégorie créée avec succès',
      category 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return Response.json({ error: 'Une catégorie avec ce nom existe déjà' }, { status: 400 });
    }
    
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}