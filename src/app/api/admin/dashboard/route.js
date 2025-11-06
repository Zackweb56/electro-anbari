import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Stock from '@/models/Stock';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Monthly orders and revenue (excluding cancelled orders)
    const monthlyOrdersData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const monthlyData = monthlyOrdersData[0] || { totalOrders: 0, totalRevenue: 0 };

    // Total active products
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Pending orders count
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Stock alerts
    const stockAlerts = await Stock.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $unwind: '$productInfo'
      },
      {
        $match: {
          'productInfo.isActive': true
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    let lowStockItems = 0;
    let outOfStockItems = 0;

    stockAlerts.forEach(alert => {
      if (alert._id === 'low_stock') lowStockItems = alert.count;
      if (alert._id === 'out_of_stock') outOfStockItems = alert.count;
    });

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product', 'name images')
      .lean();

    // Order status counts
    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert order status counts to object
    const statusCounts = {};
    orderStatusCounts.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    return NextResponse.json({
      monthlyOrders: monthlyData.totalOrders,
      monthlyRevenue: monthlyData.totalRevenue || 0,
      totalProducts,
      pendingOrders,
      lowStockItems,
      outOfStockItems,
      recentOrders: recentOrders.map(order => ({
        ...order,
        _id: order._id.toString(),
        createdAt: order.createdAt.toISOString(),
        items: order.items.map(item => ({
          ...item,
          product: item.product ? {
            _id: item.product._id.toString(),
            name: item.product.name,
            images: item.product.images
          } : null
        }))
      })),
      orderStatusCounts: statusCounts
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}