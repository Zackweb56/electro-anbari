import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import Stock from '@/models/Stock';

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({ isActive: true })
      .populate('category', 'name image isActive')
      .populate('brand', 'name logo isActive')
      .select('name slug description price comparePrice images mainImage category brand specifications features sku isActive isFeatured') // ← AJOUTEZ comparePrice ICI
      .sort({ createdAt: -1 });

    // Récupérer les stocks pour chaque produit
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const stock = await Stock.findOne({ 
          product: product._id, 
          isActive: true 
        });
        
        return {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice, // ← ASSUREZ-VOUS QU'IL EST BIEN INCLUS
          images: product.images,
          mainImage: product.mainImage,
          category: product.category,
          brand: product.brand,
          specifications: product.specifications,
          features: product.features,
          sku: product.sku,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          stock: stock ? {
            currentQuantity: stock.currentQuantity,
            soldQuantity: stock.soldQuantity,
            status: stock.status,
            lowStockAlert: stock.lowStockAlert
          } : {
            currentQuantity: 0,
            soldQuantity: 0,
            status: 'out_of_stock',
            lowStockAlert: 5
          }
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      products: productsWithStock
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}