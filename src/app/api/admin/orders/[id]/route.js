// src/app/api/admin/orders/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('items.product', 'name images');

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    );
  }
}

// In your DELETE route, also return stock when order is deleted
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Return stock before deleting the order
    for (const item of order.items) {
      const stock = await Stock.findOne({ product: item.product });
      
      if (stock) {
        stock.currentQuantity += item.quantity;
        stock.soldQuantity -= item.quantity;
        await stock.save();
      }
    }

    // Now delete the order
    await Order.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la commande' },
      { status: 500 }
    );
  }
}