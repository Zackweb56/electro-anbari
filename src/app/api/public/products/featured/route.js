import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import Stock from '@/models/Stock';

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({ 
      isActive: true,
      isFeatured: true 
    })
      .populate('category', 'name image isActive')
      .populate('brand', 'name logo isActive')
      .select('name slug description price comparePrice images mainImage category brand specifications features sku isActive isFeatured')
      .sort({ createdAt: -1 })
      .limit(8); // Limit to 8 featured products

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
          comparePrice: product.comparePrice,
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

    return NextResponse.json(productsWithStock);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits populaires' },
      { status: 500 }
    );
  }
}