import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Stock from "@/models/Stock";
import Product from "@/models/Product";
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
      soldQuantity, // ADD THIS
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
    stock.soldQuantity = soldQuantity ?? stock.soldQuantity; // ADD THIS
    stock.lowStockAlert = lowStockAlert ?? stock.lowStockAlert;
    stock.isActive = isActive ?? stock.isActive;

    // Validate that soldQuantity doesn't exceed initialQuantity
    if (stock.soldQuantity > stock.initialQuantity) {
      return Response.json(
        { error: "La quantité vendue ne peut pas dépasser la quantité initiale" },
        { status: 400 }
      );
    }

    // Auto-calculate currentQuantity if not provided
    if (currentQuantity === undefined && soldQuantity !== undefined) {
      stock.currentQuantity = stock.initialQuantity - stock.soldQuantity;
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

    const stock = await Stock.findByIdAndDelete(params.id);
    if (!stock)
      return Response.json({ error: "Stock non trouvé" }, { status: 404 });

    return Response.json({ message: "Stock supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
