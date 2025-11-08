// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ Please define MONGODB_URI in your .env file');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'electro_anbari_db', 
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        // ✅ Force register all models once globally
        import('@/models/Admin');
        import('@/models/Brand');
        import('@/models/Category');
        import('@/models/Config');
        import('@/models/Product');
        import('@/models/Stock');

        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
