// src/app/api/admin/products/[id]/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Stock from '@/models/Stock';

const generateSlug = (text) => {
  if (!text) return null;
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// GET un produit spécifique
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 });

    await connectDB();

    const product = await Product.findById(params.id)
      .populate('brand', 'name logo')
      .populate('category', 'name image');

    if (!product) return Response.json({ error: 'Produit non trouvé' }, { status: 404 });

    return Response.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un produit
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const { name, description, price, comparePrice, images, mainImage, brand, category, specifications, features, sku, isActive, isFeatured } = body;

    if (!name || !description || !price || !brand || !category) {
      return Response.json({ error: 'Tous les champs obligatoires doivent être remplis' }, { status: 400 });
    }

    await connectDB();

    const newSlug = generateSlug(name) || `product-${Date.now()}-${Math.random().toString(36).substring(2,6)}`;
    const finalMainImage = mainImage || (images && images.length > 0 ? images[0] : '');

    const updated = await Product.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: images || [],
        mainImage: finalMainImage,
        brand,
        category,
        specifications: specifications || {},
        features: features || [],
        sku,
        slug: newSlug,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
      },
      { new: true, runValidators: true }
    ).populate('brand', 'name logo')
     .populate('category', 'name image');

    if (!updated) return Response.json({ error: 'Produit non trouvé' }, { status: 404 });

    return Response.json({ message: 'Produit mis à jour avec succès', product: updated });

  } catch (error) {
    console.error('Error updating product:', error);
    return Response.json({ error: 'Erreur serveur: ' + error.message }, { status: 500 });
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 });

    await connectDB();

    // Vérifier si le produit a du stock associé
    const stockWithProduct = await Stock.countDocuments({ product: params.id });
    
    if (stockWithProduct > 0) {
      return Response.json(
        { 
          error: `Impossible de supprimer ce produit. Il est associé à ${stockWithProduct} entrée(s) de stock. Veuillez d'abord supprimer le stock associé.` 
        }, 
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(params.id);
    if (!product) return Response.json({ error: 'Produit non trouvé' }, { status: 404 });

    return Response.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}