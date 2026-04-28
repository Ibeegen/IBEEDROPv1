import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import mongoose from 'mongoose';

export const getAgentQuickStats = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const stats = await Order.aggregate([
      { $match: { agentId: new mongoose.Types.ObjectId(agentId) } },
      {
        $facet: {
          commissions: [
            {
              $group: {
                _id: null,
                totalEarned: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'completed'] }, '$commission', 0]
                  }
                },
                totalPending: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', ['pending', 'approved', 'shipping']] },
                      '$commission',
                      0
                    ]
                  }
                },
                totalPoints: {
                   $sum: {
                    $cond: [{ $eq: ['$status', 'completed'] }, '$point', 0]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    // Calculate Estimated Growth Fund for the current month
    // 1. Total System Profit/Growth Fund for month
    const totalGrowthFundResult = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: '$totalProfit' }
        }
      }
    ]);
    const totalGrowthFund = (totalGrowthFundResult[0]?.totalProfit || 0) * 0.2;

    // 2. Total System Points for month
    const systemPointsResult = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$point' }
        }
      }
    ]);
    const totalSystemPoints = systemPointsResult[0]?.totalPoints || 0;

    // 3. Agent's Effective Points for month (Personal + 50% Collaborators)
    const personalPointsResult = await Order.aggregate([
      { 
        $match: { 
          agentId: new mongoose.Types.ObjectId(agentId),
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$point' }
        }
      }
    ]);
    const personalPoints = personalPointsResult[0]?.totalPoints || 0;

    const collaborators = await User.find({ referrerId: agentId }, '_id');
    const collaboratorIds = collaborators.map(c => c._id);
    const collaboratorPointsResult = await Order.aggregate([
      { 
        $match: { 
          agentId: { $in: collaboratorIds },
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$point' }
        }
      }
    ]);
    const collaboratorPoints = collaboratorPointsResult[0]?.totalPoints || 0;
    const agentEffectivePoints = personalPoints + (collaboratorPoints * 0.5);

    const estimatedFund = totalSystemPoints > 0 ? (agentEffectivePoints / totalSystemPoints) * totalGrowthFund : 0;

    const result = {
      totalEarned: stats[0].commissions[0]?.totalEarned || 0,
      totalPending: stats[0].commissions[0]?.totalPending || 0,
      totalPoints: stats[0].commissions[0]?.totalPoints || 0,
      estimatedFund
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({ message: 'Error fetching agent stats' });
  }
};

export const getAgentCustomers = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.id;

    const customers = await Order.aggregate([
      { $match: { agentId: new mongoose.Types.ObjectId(agentId) } },
      {
        $group: {
          _id: '$phone',
          name: { $first: '$customerName' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json(customers);
  } catch (error) {
    console.error('Error fetching agent customers:', error);
    res.status(500).json({ message: 'Error fetching agent customers' });
  }
};

import { PointHistory } from '../models/PointHistory.js';
import { User } from '../models/User.js';

export const getPointHistory = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.id;
    const history = await PointHistory.find({ userId: agentId })
      .populate('orderId', 'totalAmount createdAt')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching point history:', error);
    res.status(500).json({ message: 'Error fetching point history' });
  }
};

export const getGrowthFundStats = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Get total growth fund for current month
    const totalGrowthFundResult = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$_id',
          revenue: { $first: '$totalAmount' },
          commission: { $first: '$commission' },
          cost: { $sum: { $multiply: ['$items.quantity', '$productInfo.costPrice'] } }
        }
      },
      {
        $project: {
          profit: { $subtract: [{ $subtract: ['$revenue', '$cost'] }, '$commission'] }
        }
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: '$profit' }
        }
      }
    ]);

    const totalGrowthFund = (totalGrowthFundResult[0]?.totalProfit || 0) * 0.2;

    // 2. Get total system points for current month (all agents points combined)
    const systemPointsResult = await Order.aggregate([
       { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$point' }
        }
      }
    ]);
    const totalSystemPoints = systemPointsResult[0]?.totalPoints || 0;

    // 3. Get agent's personal points for current month
    const personalPointsResult = await Order.aggregate([
       { 
        $match: { 
          agentId: new mongoose.Types.ObjectId(agentId),
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$point' }
        }
      }
    ]);
    const personalPoints = personalPointsResult[0]?.totalPoints || 0;

    // 4. Get points from direct collaborators for current month
    const collaborators = await User.find({ referrerId: agentId }, '_id');
    const collaboratorIds = collaborators.map(c => c._id);

    const collaboratorPointsResult = await Order.aggregate([
       { 
        $match: { 
          agentId: { $in: collaboratorIds },
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$point' }
        }
      }
    ]);
    const collaboratorPoints = collaboratorPointsResult[0]?.totalPoints || 0;

    // 5. Number of direct collaborators with at least one completed order this month
    const collaboratorsWithOrders = await Order.distinct('agentId', {
      agentId: { $in: collaboratorIds },
      status: 'completed',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const activeCollaboratorsCount = collaboratorsWithOrders.length;

    // Calculations
    const agentEffectivePoints = personalPoints + (collaboratorPoints * 0.5);
    const estimatedFund = totalSystemPoints > 0 ? (agentEffectivePoints / totalSystemPoints) * totalGrowthFund : 0;

    // Eligibility check
    const isEligible = personalPoints >= 200 && activeCollaboratorsCount >= 3;

    res.json({
      personalPoints,
      collaboratorPoints,
      totalEffectivePoints: agentEffectivePoints,
      estimatedFund,
      totalSystemPoints,
      totalGrowthFund,
      activeCollaboratorsCount,
      isEligible,
      requirements: {
        personalPoints: 200,
        activeCollaborators: 3
      }
    });

  } catch (error) {
    console.error('Error fetching growth fund stats:', error);
    res.status(500).json({ message: 'Error fetching growth fund stats' });
  }
};

export const getSystemPointStats = async (req: Request, res: Response) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: 'agent' } },
      {
        $group: {
          _id: null,
          totalSystemPoints: { $sum: '$totalPoint' }
        }
      }
    ]);
    res.json({ totalSystemPoints: stats[0]?.totalSystemPoints || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system point stats' });
  }
};

export const getFinanceStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage: any = { status: 'completed' };
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      // Join with products to get costPrice and current profit info
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$_id',
          orderDate: { $first: '$createdAt' },
          orderRevenue: { $first: '$totalAmount' },
          orderCommission: { $first: '$commission' },
          // Calculate cost based on product.costPrice
          orderCost: { $sum: { $multiply: ['$items.quantity', '$productInfo.costPrice'] } }
        }
      },
      {
        $project: {
          orderDate: 1,
          orderRevenue: 1,
          orderCommission: 1,
          orderCost: 1,
          orderProfit: { $subtract: [{ $subtract: ['$orderRevenue', '$orderCost'] }, '$orderCommission'] }
        }
      },
      {
        $project: {
          orderDate: 1,
          orderRevenue: 1,
          orderCommission: 1,
          orderCost: 1,
          orderProfit: 1,
          orderGrowthFund: { $multiply: ['$orderProfit', 0.2] }
        }
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$orderRevenue' },
                totalProfit: { $sum: '$orderProfit' },
                totalGrowthFund: { $sum: '$orderGrowthFund' },
                totalOrdersCompleted: { $sum: 1 }
              }
            }
          ],
          daily: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
                profit: { $sum: '$orderProfit' },
                growthFund: { $sum: '$orderGrowthFund' }
              }
            },
            { $sort: { _id: 1 } }
          ],
          recentOrders: [
            { $sort: { orderDate: -1 } },
            { $limit: 20 }
          ]
        }
      }
    ]);

    if (!stats || stats.length === 0 || !stats[0].totals) {
      return res.json({
        totalRevenue: 0,
        totalProfit: 0,
        totalGrowthFund: 0,
        totalOrdersCompleted: 0,
        profitByDay: [],
        growthFundByDay: [],
        recentOrders: []
      });
    }

    const result = {
      totalRevenue: stats[0].totals[0]?.totalRevenue || 0,
      totalProfit: stats[0].totals[0]?.totalProfit || 0,
      totalGrowthFund: stats[0].totals[0]?.totalGrowthFund || 0,
      totalOrdersCompleted: stats[0].totals[0]?.totalOrdersCompleted || 0,
      profitByDay: stats[0].daily,
      growthFundByDay: stats[0].daily,
      recentOrders: stats[0].recentOrders
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching finance stats:', error);
    res.status(500).json({ message: 'Error fetching finance stats' });
  }
};

export const getGrowthFundDailyHistory = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.id;
    const days = parseInt(req.query.days as string) || 7;
    
    // Get range
    const now = new Date();
    // Use local end of day for today
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const startDate = new Date();
    startDate.setDate(tomorrow.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1. Get daily stats (System-wide)
    const systemDailyStats = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startDate, $lt: tomorrow }
        } 
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$_id',
          date: { $first: '$createdAt' },
          revenue: { $first: '$totalAmount' },
          commission: { $first: '$commission' },
          points: { $first: '$point' },
          cost: { $sum: { $multiply: ['$items.quantity', '$productInfo.costPrice'] } }
        }
      },
      {
        $project: {
          date: 1,
          points: 1,
          profit: { $subtract: [{ $subtract: ['$revenue', '$cost'] }, '$commission'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalProfit: { $sum: '$profit' },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    // 2. Get agent's personal daily points
    const agentDailyPoints = await Order.aggregate([
      { 
        $match: { 
          agentId: new mongoose.Types.ObjectId(agentId),
          status: 'completed',
          createdAt: { $gte: startDate, $lt: tomorrow }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          personalPoints: { $sum: '$point' }
        }
      }
    ]);

    // 3. Get points from direct collaborators
    const collaborators = await User.find({ referrerId: agentId }, '_id');
    const collaboratorIds = collaborators.map(c => c._id);
    const collaboratorsDailyPoints = await Order.aggregate([
      { 
        $match: { 
          agentId: { $in: collaboratorIds },
          status: 'completed',
          createdAt: { $gte: startDate, $lt: tomorrow }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          collaboratorPoints: { $sum: '$point' }
        }
      }
    ]);

    // Combine data
    const historyMap = new Map<string, any>();
    
    // Initialize dates
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        historyMap.set(dateStr, {
            date: dateStr,
            totalProfit: 0,
            totalPoints: 0,
            personalPoints: 0,
            collaboratorPoints: 0
        });
    }

    systemDailyStats.forEach(stat => {
        if (historyMap.has(stat._id)) {
            const entry = historyMap.get(stat._id);
            entry.totalProfit = stat.totalProfit;
            entry.totalPoints = stat.totalPoints;
        }
    });

    agentDailyPoints.forEach(stat => {
        if (historyMap.has(stat._id)) {
            const entry = historyMap.get(stat._id);
            entry.personalPoints = stat.personalPoints;
        }
    });

    collaboratorsDailyPoints.forEach(stat => {
        if (historyMap.has(stat._id)) {
            const entry = historyMap.get(stat._id);
            entry.collaboratorPoints = stat.collaboratorPoints;
        }
    });

    const history = Array.from(historyMap.values()).map(item => {
        const dailyGrowthFund = item.totalProfit * 0.2;
        const agentEffectivePoints = item.personalPoints + (item.collaboratorPoints * 0.5);
        const estimatedFundDaily = item.totalPoints > 0 ? (agentEffectivePoints / item.totalPoints) * dailyGrowthFund : 0;
        
        return {
            date: item.date,
            estimatedFundDaily: Math.round(estimatedFundDaily)
        };
    }).sort((a, b) => b.date.localeCompare(a.date));

    const totalEstimatedFund = history.reduce((sum, item) => sum + item.estimatedFundDaily, 0);

    res.json({
      totalEstimatedFund,
      history
    });

  } catch (error) {
    console.error('Error fetching growth fund daily history:', error);
    res.status(500).json({ message: 'Error fetching growth fund daily history' });
  }
};
