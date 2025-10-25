import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Stock from "@/models/Stock";
import Product from "@/models/Product";
await connectDB();

// 🟠 PUT - Update stock entry
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return Response.json({ error: "Non autorisé" }, { status: 401 });

    const { product, initialQuantity, currentQuantity, lowStockAlert, isActive } =
      await request.json();

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

    stock.product = product ?? stock.product;
    stock.initialQuantity = initialQuantity ?? stock.initialQuantity;
    stock.currentQuantity = currentQuantity ?? stock.currentQuantity;
    stock.lowStockAlert = lowStockAlert ?? stock.lowStockAlert;
    stock.isActive = isActive ?? stock.isActive;

    stock.updateStatus();
    await stock.save();

    return Response.json({
      message: "Stock mis à jour avec succès",
      stock,
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
