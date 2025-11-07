import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

await connectDB();

// PUT - Update admin password
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Le mot de passe actuel et le nouveau mot de passe sont requis" },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find admin
    const admin = await Admin.findById(session.user.id);
    if (!admin) {
      return NextResponse.json({ error: "Admin non trouvé" }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Le mot de passe actuel est incorrect" },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    const isSamePassword = await admin.comparePassword(newPassword);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l'actuel" },
        { status: 400 }
      );
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    return NextResponse.json({
      message: "Mot de passe mis à jour avec succès"
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
