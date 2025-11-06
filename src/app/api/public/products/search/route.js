import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import Stock from '@/models/Stock';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json([]);
    }

    // Create case-insensitive regex for search
    const searchRegex = new RegExp(query, 'i');

    // Enhanced search query - search across multiple fields with better performance
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { 'specifications.processor': searchRegex },
        { 'specifications.ram': searchRegex },
        { 'specifications.storage': searchRegex },
        { 'specifications.display': searchRegex },
        { 'features': { $in: [searchRegex] } }
      ]
    })
    .populate('category', 'name')
    .populate('brand', 'name')
    .select('name slug price comparePrice mainImage category brand specifications features')
    .limit(10)
    .lean(); // Use lean() for better performance

    // Get all product IDs for stock lookup
    const productIds = products.map(p => p._id);

    // Single query to get all stock information
    const stocks = await Stock.find({
      product: { $in: productIds },
      isActive: true
    }).select('product currentQuantity status').lean();

    // Create stock map for quick lookup
    const stockMap = new Map();
    stocks.forEach(stock => {
      stockMap.set(stock.product.toString(), stock);
    });

    // Filter and enhance products with stock info
    const availableProducts = products
      .map(product => {
        const stock = stockMap.get(product._id.toString());
        const isInStock = stock && stock.currentQuantity > 0 && stock.status !== 'out_of_stock';
        
        if (isInStock) {
          return {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            comparePrice: product.comparePrice,
            mainImage: product.mainImage,
            category: product.category,
            brand: product.brand,
            specifications: product.specifications,
            features: product.features,
            inStock: true,
            currentQuantity: stock?.currentQuantity || 0
          };
        }
        return null;
      })
      .filter(product => product !== null);

    return NextResponse.json(availableProducts);
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de produits' },
      { status: 500 }
    );
  }
}