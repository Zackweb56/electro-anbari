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
    console.error('❌ MongoDB connection failed:');
    
    process.exit(1);
  }
}

testConnection();