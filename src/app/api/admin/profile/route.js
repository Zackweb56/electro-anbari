import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return Response.json({ error: 'Nom et email sont requis' }, { status: 400 });
    }

    await connectDB();

    // Update admin profile
    const updatedAdmin = await Admin.findByIdAndUpdate(
      session.user.id,
      { 
        name, 
        email 
      },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return Response.json({ error: 'Administrateur non trouvé' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error.code === 11000) {
      return Response.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }
    
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}