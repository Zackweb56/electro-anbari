import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

// PUT - Update category
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { name, image, isActive } = await request.json(); // Add isActive here

    if (!name) {
      return Response.json({ error: 'Le nom de la catégorie est requis' }, { status: 400 });
    }

    await connectDB();

    const category = await Category.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        image: image?.trim() || '',
        isActive: isActive !== undefined ? isActive : true // Handle isActive
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

// DELETE - Delete category (unchanged)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

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