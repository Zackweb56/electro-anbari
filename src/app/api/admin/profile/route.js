import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

await connectDB();

// GET - Fetch current admin profile
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const admin = await Admin.findById(session.user.id).select('-password');
    if (!admin) {
      return NextResponse.json({ error: "Admin non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Update admin profile (name and email)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, email } = await request.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: "Le nom et l'email sont requis" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email is already taken by another admin
    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
      _id: { $ne: session.user.id }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Update admin profile
    const admin = await Admin.findByIdAndUpdate(
      session.user.id,
      {
        name: name.trim(),
        email: email.toLowerCase().trim()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return NextResponse.json({ error: "Admin non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
