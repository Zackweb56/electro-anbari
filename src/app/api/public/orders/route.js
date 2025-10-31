// src/app/api/public/orders/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Stock from '@/models/Stock';

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    console.log('Received order data:', body);

    const { customer, items, notes, whatsappConfirmed, shippingNotes, customerWhatsappConfirmed } = body;

    // Validate required fields
    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.city) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis: nom, téléphone, adresse et ville' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'La commande doit contenir au moins un article' },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    const orderItems = [];

    // Process each item and calculate total
    for (const item of items) {
      try {
        const product = await Product.findById(item.productId).select('name price images');
        
        if (!product) {
          return NextResponse.json(
            { error: `Produit non trouvé: ${item.productId}` },
            { status: 404 }
          );
        }

        // Check stock availability
        let stock = await Stock.findOne({ product: item.productId });
        
        if (!stock) {
          return NextResponse.json(
            { error: `Stock non configuré pour le produit: ${product.name}` },
            { status: 400 }
          );
        }

        console.log(`Stock for ${product.name}:`, stock.currentQuantity, 'Requested:', item.quantity);

        if (stock.currentQuantity < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuffisant pour le produit: ${product.name}. Stock disponible: ${stock.currentQuantity}` },
            { status: 400 }
          );
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product: item.productId,
          quantity: item.quantity,
          price: product.price,
          productName: product.name,
          productImage: product.images?.[0] || null
        });

      } catch (itemError) {
        console.error('Error processing item:', itemError);
        return NextResponse.json(
          { error: `Erreur lors du traitement du produit: ${itemError.message}` },
          { status: 400 }
        );
      }
    }

    // Now update stock for all items after successful validation
    for (const item of items) {
      const stock = await Stock.findOne({ product: item.productId });
      if (stock) {
        const oldQuantity = stock.currentQuantity;
        stock.currentQuantity -= item.quantity;
        stock.soldQuantity += item.quantity;
        
        await stock.save();
        
        console.log(`Updated stock for ${item.productId}: ${oldQuantity} -> ${stock.currentQuantity}`);
      }
    }

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${(orderCount + 1).toString().padStart(4, '0')}`;

    // Create order - FIXED: Proper WhatsApp fields handling
    const orderData = {
      orderNumber,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || '',
        address: customer.address.trim(),
        city: customer.city.trim(),
      },
      items: orderItems,
      totalAmount,
      notes: notes?.trim() || '',
      shippingNotes: shippingNotes?.trim() || '',
      // Customer confirms their WhatsApp availability
      customerWhatsappConfirmed: !!customerWhatsappConfirmed,
      // Admin will set this to true later when they confirm via WhatsApp
      whatsappConfirmed: false, // Always false initially
    };

    const order = new Order(orderData);
    await order.save();

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images')
      .lean();

    return NextResponse.json(
      { 
        success: true, 
        order: populatedOrder,
        message: 'Commande créée avec succès' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Order creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}