import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Config from '@/models/Config';

// GET - Get store configuration
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    // Get or create config (there should be only one config document)
    let config = await Config.findOne();
    
    if (!config) {
      // Create default config if doesn't exist
      config = await Config.create({});
    }

    return Response.json(config);

  } catch (error) {
    console.error('Error in GET /api/admin/config:', error);
    // SECURITY: Don't expose error details in production
    return Response.json({ 
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

// PUT - Update store configuration
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const updates = await request.json();

    await connectDB();

    // Find and update config (upsert: true to create if doesn't exist)
    let config = await Config.findOneAndUpdate(
      {},
      { 
        ...updates,
        // Ensure socialMedia object is properly structured
        socialMedia: {
          facebook: updates.facebook || '',
          instagram: updates.instagram || '',
          twitter: updates.twitter || '',
          youtube: updates.youtube || '',
        }
      },
      { 
        new: true, 
        upsert: true, 
        runValidators: true 
      }
    );

    return Response.json({ 
      message: 'Configuration sauvegardée avec succès',
      config 
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/config:', error);
    // SECURITY: Don't expose error details in production
    return Response.json({ 
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}