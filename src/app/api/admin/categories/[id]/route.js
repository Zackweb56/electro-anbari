// src/app/api/admin/categories/[id]/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product'; // Ajouter cette importation

// PUT - Update category (garder exactement comme avant)
export async function PUT(request, { params }) {
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

    const category = await Category.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        image: image?.trim() || '',
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return Response.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Catégorie mise à jour avec succès',
      category 
    });

  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.code === 11000) {
      return Response.json({ error: 'Une catégorie avec ce nom existe déjà' }, { status: 400 });
    }
    
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Delete category (updated to check for products)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    // Check if any products are using this category
    const productsWithCategory = await Product.countDocuments({ category: params.id });
    
    if (productsWithCategory > 0) {
      return Response.json(
        { 
          error: `Impossible de supprimer cette catégorie. Elle est utilisée par ${productsWithCategory} produit(s). Veuillez d'abord supprimer ou modifier ces produits.` 
        }, 
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(params.id);

    if (!category) {
      return Response.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Catégorie supprimée avec succès' 
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}