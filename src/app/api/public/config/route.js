import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Config from '@/models/Config';

export async function GET() {
  try {
    await dbConnect();

    // Récupérer ou créer la configuration par défaut
    let config = await Config.findOne();
    
    if (!config) {
      config = await Config.create({});
    }

    return NextResponse.json({ 
      success: true, 
      config: {
        storeName: config.storeName,
        storeDescription: config.storeDescription,
        contactEmail: config.contactEmail,
        contactPhone: config.contactPhone,
        whatsappNumber1: config.whatsappNumber1,
        whatsappNumber2: config.whatsappNumber2,
        address: config.address,
        latitude: config.latitude,      // ← BIEN INCLURE
        longitude: config.longitude,    // ← BIEN INCLURE
        openingHours: config.openingHours,
        youtubeVideo: config.youtubeVideo,
        socialMedia: config.socialMedia,
        shippingPolicy: config.shippingPolicy,
        returnPolicy: config.returnPolicy
      }
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}