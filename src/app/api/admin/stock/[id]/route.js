import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Stock from "@/models/Stock";
import Product from "@/models/Product";
import Order from "@/models/Order";
await connectDB();

// � GET - Fetch single stock item
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return Response.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const stock = await Stock.findById(params.id)
      .populate("product", "name price mainImage images model");
    if (!stock)
      return Response.json({ error: "Stock non trouvé" }, { status: 404 });

    return Response.json(stock);
  } catch (error) {
    console.error("Error fetching stock:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// 🟠 PUT - Update stock entry
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return Response.json({ error: "Non autorisé" }, { status: 401 });

    const { 
      product, 
      initialQuantity, 
      currentQuantity, 
      soldQuantity,
      lowStockAlert, 
      isActive 
    } = await request.json();

    await connectDB();

    if (product) {
      const existingProduct = await Product.findById(product);
      if (!existingProduct)
        return Response.json(
          { error: "Produit non trouvé" },
          { status: 404 }
        );
    }

    const stock = await Stock.findById(params.id);
    if (!stock)
      return Response.json({ error: "Stock non trouvé" }, { status: 404 });

    // Update fields
    stock.product = product ?? stock.product;
    stock.initialQuantity = initialQuantity ?? stock.initialQuantity;
    stock.currentQuantity = currentQuantity ?? stock.currentQuantity;
    stock.lowStockAlert = lowStockAlert ?? stock.lowStockAlert;
    stock.isActive = isActive ?? stock.isActive;

    // Handle soldQuantity logic
    if (soldQuantity !== undefined) {
      stock.soldQuantity = soldQuantity;
      // Recalculate currentQuantity to maintain consistency
      stock.currentQuantity = stock.initialQuantity - stock.soldQuantity;
    } else if (currentQuantity !== undefined) {
      // If currentQuantity is updated, recalculate soldQuantity
      stock.soldQuantity = stock.initialQuantity - stock.currentQuantity;
    }

    // Validate that soldQuantity doesn't exceed initialQuantity
    if (stock.soldQuantity > stock.initialQuantity) {
      return Response.json(
        { error: "La quantité vendue ne peut pas dépasser la quantité initiale" },
        { status: 400 }
      );
    }

    stock.updateStatus();
    await stock.save();

    const updatedStock = await Stock.findById(stock._id)
      .populate("product", "name price mainImage images model");

    return Response.json({
      message: "Stock mis à jour avec succès",
      stock: updatedStock,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// 🔴 DELETE - Delete stock record
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return Response.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    // Check if there are any active orders (not cancelled) that reference this stock
    const activeOrdersCount = await Order.countDocuments({
      'items.product': params.id,
      status: { $ne: 'cancelled' }
    });

    if (activeOrdersCount > 0) {
      return Response.json({
        error: `Impossible de supprimer ce stock car il y a ${activeOrdersCount} commande(s) active(s) qui le référencent. Annulez d'abord les commandes concernées.`
      }, { status: 400 });
    }

    const stock = await Stock.findByIdAndDelete(params.id);
    if (!stock)
      return Response.json({ error: "Stock non trouvé" }, { status: 404 });

    return Response.json({ message: "Stock supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
