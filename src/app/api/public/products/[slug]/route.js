import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Stock from '@/models/Stock';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const product = await Product.findOne({ 
      slug: params.slug,
      isActive: true 
    })
    .populate('category', 'name slug isActive')
    .populate('brand', 'name logo isActive');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer le stock
    const stock = await Stock.findOne({ 
      product: product._id, 
      isActive: true 
    });

    const productWithStock = {
      ...product.toObject(),
      stock: stock ? {
        currentQuantity: stock.currentQuantity,
        soldQuantity: stock.soldQuantity,
        status: stock.status,
        lowStockAlert: stock.lowStockAlert
      } : null
    };

    return NextResponse.json({ 
      success: true, 
      product: productWithStock 
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du produit' },
      { status: 500 }
    );
  }
}