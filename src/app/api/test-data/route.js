import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import Stock from '@/models/Stock';

export async function GET() {
  try {
    await dbConnect();

    // Compter les documents
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const brandCount = await Brand.countDocuments();
    const stockCount = await Stock.countDocuments();

    // Récupérer quelques échantillons
    const sampleProducts = await Product.find().limit(3).populate('category').populate('brand');
    const sampleCategories = await Category.find().limit(3);
    const sampleBrands = await Brand.find().limit(3);
    const sampleStocks = await Stock.find().limit(3).populate('product');

    return NextResponse.json({
      success: true,
      counts: {
        products: productCount,
        categories: categoryCount,
        brands: brandCount,
        stocks: stockCount
      },
      samples: {
        products: sampleProducts,
        categories: sampleCategories,
        brands: sampleBrands,
        stocks: sampleStocks
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}