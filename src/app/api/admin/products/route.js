// src/app/api/admin/products/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Stock from '@/models/Stock';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 });

    await connectDB();

    const products = await Product.find()
      .populate('brand', 'name logo isActive')
      .populate('category', 'name image isActive')
      .sort({ createdAt: -1 })
      .lean();

    const productsWithStockCounts = await Promise.all(
      products.map(async (product) => {
        const stockCount = await Stock.countDocuments({ product: product._id });
        return {
          ...product,
          stockCount
        };
      })
    );

    return Response.json(productsWithStockCounts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    console.log('Received product data:', body);

    const { name, description, price, comparePrice, images, mainImage, brand, category, specifications, features, sku, isActive, isFeatured } = body;

    if (!name || !price || !brand || !category) {
      return Response.json({ 
        error: 'Tous les champs obligatoires doivent être remplis',
        details: { name: !name, price: !price, brand: !brand, category: !category }
      }, { status: 400 });
    }

    await connectDB();

    // Improved SKU generation
    const generateSKU = (productName, customSKU = null) => {
      if (customSKU && customSKU.trim() !== '') {
        return customSKU.trim();
      }
      
      // Clean product name for SKU
      const cleanName = productName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '') // Remove special characters
        .substring(0, 4); // Take first 4 characters
      
      const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
      const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random chars
      
      return `PROD-${cleanName || 'ITEM'}-${timestamp}${random}`.substring(0, 20); // Max 20 chars
    };

    const finalSku = generateSKU(name, sku);
    const finalMainImage = mainImage || (images && images.length > 0 ? images[0] : '');

    const productData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      images: images || [],
      mainImage: finalMainImage,
      brand,
      category,
      specifications: specifications || {},
      features: features || [],
      sku: finalSku,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
    };

    console.log('Product data to create:', productData);

    const product = await Product.create(productData);

    const populated = await Product.findById(product._id)
      .populate('brand', 'name logo')
      .populate('category', 'name image');

    return Response.json({ message: 'Produit créé avec succès', product: populated }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle duplicate SKU error specifically
    if (error.code === 11000 && error.keyPattern?.sku) {
      return Response.json({ 
        error: 'Erreur: Ce SKU existe déjà. Veuillez en choisir un autre.',
        details: 'SKU must be unique'
      }, { status: 400 });
    }
    
    return Response.json({ 
      error: 'Erreur serveur',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}