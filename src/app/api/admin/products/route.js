import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Brand from '@/models/Brand';
import Category from '@/models/Category';

// GET - Get all products with populated brand and category
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const products = await Product.find()
      .populate('brand', 'name logo isActive')
      .populate('category', 'name image isActive')
      .sort({ createdAt: -1 });
    
    return Response.json(products);

  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request) {
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

    // Validation
    if (!name || !description || !price || !brand || !category) {
      return Response.json({ 
        error: 'Tous les champs obligatoires doivent être remplis' 
      }, { status: 400 });
    }

    await connectDB();

    // Generate SKU if not provided
    const finalSku = sku || `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Set mainImage: use provided mainImage or first image from images array
    const finalMainImage = mainImage || (images && images.length > 0 ? images[0] : '');

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      images: images || [],
      mainImage: finalMainImage, // Add mainImage
      brand,
      category,
      specifications: specifications || {},
      features: features || [],
      sku: finalSku,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false
    });

    // Populate the created product
    const populatedProduct = await Product.findById(product._id)
      .populate('brand', 'name logo')
      .populate('category', 'name image');

    return Response.json({ 
      message: 'Produit créé avec succès',
      product: populatedProduct
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.code === 11000) {
      return Response.json({ error: 'Un produit avec ce SKU existe déjà' }, { status: 400 });
    }
    
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}