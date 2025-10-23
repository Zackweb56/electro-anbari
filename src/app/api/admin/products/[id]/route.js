import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET - Get single product
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const product = await Product.findById(params.id)
      .populate('brand', 'name logo')
      .populate('category', 'name image');

    if (!product) {
      return Response.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return Response.json(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const {
      name,
      description,
      price,
      comparePrice,
      images,
      mainImage, // Add mainImage
      brand,
      category,
      specifications,
      features,
      sku,
      isActive,
      isFeatured
    } = await request.json();

    if (!name || !description || !price || !brand || !category) {
      return Response.json({ 
        error: 'Tous les champs obligatoires doivent être remplis' 
      }, { status: 400 });
    }

    await connectDB();

    // Set mainImage: use provided mainImage or first image from images array if mainImage is empty
    const finalMainImage = mainImage || (images && images.length > 0 ? images[0] : '');

    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: images || [],
        mainImage: finalMainImage, // Add mainImage
        brand,
        category,
        specifications: specifications || {},
        features: features || [],
        sku,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false
      },
      { new: true, runValidators: true }
    ).populate('brand', 'name logo')
     .populate('category', 'name image');

    if (!product) {
      return Response.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Produit mis à jour avec succès',
      product 
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.code === 11000) {
      return Response.json({ error: 'Un produit avec ce SKU existe déjà' }, { status: 400 });
    }
    
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return Response.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Produit supprimé avec succès' 
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}