import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { PointHistory } from '../models/PointHistory.js';

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const filter = req.user?.role === 'agent' ? { agentId: req.user.id } : {};
    const orders = await Order.find(filter)
      .populate('agentId', 'name email')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error instanceof Error ? error.message : String(error) });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { customerName, phone, address, items } = req.body;
    let totalAmount = 0;
    let totalCost = 0;
    let totalCommission = 0;
    let totalPoint = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });

      totalAmount += product.retailPrice * item.quantity;
      totalCost += product.costPrice * item.quantity;
      totalCommission += (product.agentCommission || 0) * item.quantity;
    }

    const totalProfit = totalAmount - totalCost - totalCommission;
    // 10.000đ lợi nhuận = 2 IbeePoint
    totalPoint = (totalProfit / 10000) * 2;

    const order = new Order({
      agentId: req.user?.id,
      customerName, phone, address, items,
      totalAmount, totalCost, totalProfit,
      commission: totalCommission, point: totalPoint
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { status: newStatus } = req.body;
    const order = await Order.findById(req.params.id).session(session);
    
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;

    if (oldStatus === newStatus) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order is already in this status' });
    }

    order.status = newStatus;
    await order.save({ session });

    // Handle IbeePoint calculation based on status transition
    if (newStatus === 'completed' && oldStatus !== 'completed') {
      // Add points
      const agent = await User.findById(order.agentId).session(session);
      if (agent) {
        agent.totalRevenue += order.commission;
        agent.totalPoint += order.point;
        await agent.save({ session });

        // Create point history
        const history = new PointHistory({
          userId: agent._id,
          orderId: order._id,
          amount: order.point,
          type: 'credit',
          description: `Cộng điểm IbeePoint từ đơn hàng ${order._id.toString().slice(-6)}`,
          balanceAfter: agent.totalPoint
        });
        await history.save({ session });
      }
    } else if (oldStatus === 'completed' && newStatus !== 'completed') {
      // Subtract points (if status was changed from completed back to something else, like returned or cancelled)
      const agent = await User.findById(order.agentId).session(session);
      if (agent) {
        agent.totalRevenue -= order.commission;
        agent.totalPoint -= order.point;
        await agent.save({ session });

        // Create point history
        const history = new PointHistory({
          userId: agent._id,
          orderId: order._id,
          amount: order.point,
          type: 'debit',
          description: `Trừ điểm IbeePoint do đơn hàng ${order._id.toString().slice(-6)} bị ${newStatus === 'returned' ? 'hoàn trả' : 'hủy'}`,
          balanceAfter: agent.totalPoint
        });
        await history.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    
    res.json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Transaction error', error: error instanceof Error ? error.message : String(error) });
  }
};
