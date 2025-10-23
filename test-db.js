import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

// Now import mongodb after loading env variables
const { default: connectDB } = await import('./src/lib/mongodb.js');

async function testConnection() {
  try {
    await connectDB();
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // More detailed error information
    if (error.message.includes('whitelist')) {
      console.log('\n💡 Solution: Add your IP to MongoDB Atlas whitelist:');
      console.log('1. Go to MongoDB Atlas → Network Access');
      console.log('2. Click "Add IP Address"');
      console.log('3. Click "Add Current IP Address"');
      console.log('4. Wait 2-5 minutes for changes to apply\n');
    }
    
    process.exit(1);
  }
}

testConnection();