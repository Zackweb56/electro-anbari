import { NextResponse } from 'next/server';

// SECURITY: This endpoint exposes database information and should be disabled in production
// Consider removing this endpoint entirely or restricting it to development only
export async function GET(request) {
  // SECURITY: Disable in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  // Only allow in development with a secret token
  const testToken = request?.headers?.get('x-test-token');
  const allowedToken = process.env.TEST_TOKEN;
  
  if (allowedToken && testToken !== allowedToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Disabled for security - uncomment only for development
    /*
    await dbConnect();

    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const brandCount = await Brand.countDocuments();
    const stockCount = await Stock.countDocuments();

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
    */
    
    return NextResponse.json({
      error: 'This endpoint is disabled for security reasons'
    }, { status: 403 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}