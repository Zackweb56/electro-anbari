import { NextResponse } from 'next/server';

// SECURITY: This endpoint exposes database connection information and should be disabled in production
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

  // Disabled for security - this endpoint exposes sensitive database information
  return NextResponse.json({
    error: 'This endpoint is disabled for security reasons'
  }, { status: 403 });

  // Original code commented out for security:
  /*
  await connectDB();
  return NextResponse.json({
    connected: mongoose.connection.readyState === 1,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    uri: process.env.MONGODB_URI ? '✅ Exists' : '❌ Missing',
    stockCollection: Stock.collection.name,
  });
  */
}
