// src/app/api/admin/orders/return-stock/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Stock from '@/models/Stock';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    
    const { orderId } = await request.json();
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    // 🚫 Prevent returning stock for already cancelled orders
    if (order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Le stock a déjà été retourné pour cette commande annulée' },
        { status: 400 }
      );
    }

    // Return stock for each item
    for (const item of order.items) {
      const stock = await Stock.findOne({ product: item.product });
      if (stock) {
        stock.currentQuantity += item.quantity;
        stock.soldQuantity = Math.max(0, stock.soldQuantity - item.quantity);
        await stock.save();
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Stock retourné avec succès' 
    });
    
  } catch (error) {
    console.error('Error returning stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors du retour du stock' },
      { status: 500 }
    );
  }
}