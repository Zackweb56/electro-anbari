import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
await connectDB();

const generateSlug = (text) => {
  if (!text) return null;
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

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

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 });

    await connectDB();

    const product = await Product.findByIdAndDelete(params.id);
    if (!product) return Response.json({ error: 'Produit non trouvé' }, { status: 404 });

    return Response.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
