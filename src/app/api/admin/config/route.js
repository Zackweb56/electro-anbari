import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Config from '@/models/Config';

// GET - Get store configuration
export async function GET() {
  try {
    console.log('GET /api/admin/config - Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session) {
      console.log('No session found - Unauthorized');
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    console.log('Database connected');

    // Get or create config (there should be only one config document)
    let config = await Config.findOne();
    console.log('Found config:', config);
    
    if (!config) {
      console.log('No config found, creating default...');
      // Create default config if doesn't exist
      config = await Config.create({});
      console.log('Default config created:', config);
    }

    return Response.json(config);

  } catch (error) {
    console.error('Error in GET /api/admin/config:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return Response.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Update store configuration
export async function PUT(request) {
  try {
    console.log('PUT /api/admin/config - Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session) {
      console.log('No session found - Unauthorized');
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const updates = await request.json();
    console.log('Received updates:', updates);

    await connectDB();
    console.log('Database connected');

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

    console.log('Config saved successfully:', config);

    return Response.json({ 
      message: 'Configuration sauvegardée avec succès',
      config 
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/config:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return Response.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 });
  }
}