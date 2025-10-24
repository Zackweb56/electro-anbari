import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Stock from "@/models/Stock";
import Product from "@/models/Product";

// 🟢 GET - Fetch all stock items
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return Response.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const stockItems = await Stock.find()
      .populate("product", "name price")
      .sort({ createdAt: -1 });

    return Response.json(stockItems);
  } catch (error) {
    console.error("Error fetching stock:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// 🟡 POST - Create a new stock record
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return Response.json({ error: "Non autorisé" }, { status: 401 });

    const { product, initialQuantity, currentQuantity, lowStockAlert, isActive } =
      await request.json();

    if (!product)
      return Response.json(
        { error: "Le produit est requis" },
        { status: 400 }
      );

    await connectDB();

    const existingProduct = await Product.findById(product);
    if (!existingProduct)
      return Response.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );

    const stock = await Stock.create({
      product,
      initialQuantity,
      currentQuantity,
      soldQuantity: 0,
      lowStockAlert: lowStockAlert ?? 5,
      isActive: isActive ?? true,
    });

    return Response.json(
      { message: "Stock créé avec succès", stock },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating stock:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
