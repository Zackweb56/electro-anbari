// src/app/api/admin/brands/[id]/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';
import Product from '@/models/Product'; // Add this import

// PUT - Update brand (keep this exactly as is)
export async function PUT(request, { params }) {
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

    const brand = await Brand.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        logo: logo?.trim() || '',
        isActive: isActive !== undefined ? isActive : true
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

// DELETE - Delete brand (updated to check for products)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    // Check if any products are using this brand
    const productsWithBrand = await Product.countDocuments({ brand: params.id });
    
    if (productsWithBrand > 0) {
      return Response.json(
        { 
          error: `Impossible de supprimer cette marque. Elle est utilisée par ${productsWithBrand} produit(s). Veuillez d'abord supprimer ou modifier ces produits.` 
        }, 
        { status: 400 }
      );
    }

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