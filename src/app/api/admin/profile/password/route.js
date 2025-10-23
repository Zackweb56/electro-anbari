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

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return Response.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
    }

    await connectDB();

    // Get current admin with password
    const admin = await Admin.findById(session.user.id).select('+password');
    
    if (!admin) {
      return Response.json({ error: 'Administrateur non trouvé' }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isCurrentPasswordValid) {
      return Response.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    admin.password = hashedNewPassword;
    await admin.save();

    return Response.json({ message: 'Mot de passe mis à jour avec succès' });

  } catch (error) {
    console.error('Error updating password:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}