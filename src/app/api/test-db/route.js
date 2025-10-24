import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Stock from '@/models/Stock';

export async function GET() {
  await connectDB();

  return NextResponse.json({
    connected: mongoose.connection.readyState === 1,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    uri: process.env.MONGODB_URI ? '✅ Exists' : '❌ Missing',
    stockCollection: Stock.collection.name,
  });
}
