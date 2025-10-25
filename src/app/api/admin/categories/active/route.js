import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
await connectDB();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const categories = await Category.find({ isActive: true })
      .select('name image')
      .sort({ name: 1 });
    
    return Response.json(categories);

  } catch (error) {
    console.error('Error fetching active categories:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}