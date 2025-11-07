// src/app/api/admin/orders/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Stock from '@/models/Stock';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // 🚫 PREVENT changing status if order is already cancelled
    if (body.status && order.status === 'cancelled' && body.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Impossible de modifier le statut d\'une commande annulée' },
        { status: 400 }
      );
    }

    // Handle status change TO cancelled (return stock)
    if (body.status === 'cancelled' && order.status !== 'cancelled') {
      // Return stock for each item
      for (const item of order.items) {
        const stock = await Stock.findOne({ product: item.product });
        if (stock) {
          stock.currentQuantity += item.quantity;
          stock.soldQuantity = Math.max(0, stock.soldQuantity - item.quantity);
          await stock.save();
        }
      }
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('items.product', 'name images');

    return NextResponse.json(updatedOrder);
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

    // Return stock only if order was NOT cancelled
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        const stock = await Stock.findOne({ product: item.product });
        if (stock) {
          stock.currentQuantity += item.quantity;
          stock.soldQuantity = Math.max(0, stock.soldQuantity - item.quantity);
          await stock.save();
        }
      }
    }

    // Delete the order
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