import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';

// PUT - Update brand
export async function PUT(request, { params }) {
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

    const brand = await Brand.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        logo: logo?.trim() || '',
        isActive: isActive !== undefined ? isActive : true // Handle isActive
      },
      { new: true, runValidators: true }
    );

    if (!brand) {
      return Response.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Marque mise à jour avec succès',
      brand 
    });

  } catch (error) {
    console.error('Error updating brand:', error);
    
    if (error.code === 11000) {
      return Response.json({ error: 'Une marque avec ce nom existe déjà' }, { status: 400 });
    }
    
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Delete brand (unchanged)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const brand = await Brand.findByIdAndDelete(params.id);

    if (!brand) {
      return Response.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Marque supprimée avec succès' 
    });

  } catch (error) {
    console.error('Error deleting brand:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}