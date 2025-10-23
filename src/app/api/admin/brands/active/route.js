import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const brands = await Brand.find({ isActive: true })
      .select('name logo')
      .sort({ name: 1 });
    
    return Response.json(brands);

  } catch (error) {
    console.error('Error fetching active brands:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}