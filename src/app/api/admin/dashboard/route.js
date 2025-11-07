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

    // Get date ranges
    const now = new Date();
    
    // Current month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Previous month
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 🟢 CURRENT MONTH REVENUE
    const currentMonthRevenueData = await Stock.aggregate([
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
          updatedAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
          soldQuantity: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { 
            $sum: { 
              $multiply: ['$soldQuantity', '$productInfo.price'] 
            } 
          }
        }
      }
    ]);

    // 🟢 PREVIOUS MONTH REVENUE
    const previousMonthRevenueData = await Stock.aggregate([
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
          updatedAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
          soldQuantity: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { 
            $sum: { 
              $multiply: ['$soldQuantity', '$productInfo.price'] 
            } 
          }
        }
      }
    ]);

    const currentMonthRevenue = currentMonthRevenueData[0]?.totalRevenue || 0;
    const previousMonthRevenue = previousMonthRevenueData[0]?.totalRevenue || 0;

    // 🟢 CALCULATE REVENUE TREND
    const revenueTrend = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : currentMonthRevenue > 0 ? 100 : 0;

    // 🟢 CURRENT MONTH ORDERS
    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
      status: { $ne: 'cancelled' }
    });

    // 🟢 PREVIOUS MONTH ORDERS
    const previousMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      status: { $ne: 'cancelled' }
    });

    // 🟢 CALCULATE ORDERS TREND
    const ordersTrend = previousMonthOrders > 0 
      ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
      : currentMonthOrders > 0 ? 100 : 0;

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
      monthlyOrders: currentMonthOrders,
      monthlyRevenue: currentMonthRevenue,
      revenueTrend: Math.round(revenueTrend), // 🟢 Added trend percentage
      ordersTrend: Math.round(ordersTrend),   // 🟢 Added trend percentage
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