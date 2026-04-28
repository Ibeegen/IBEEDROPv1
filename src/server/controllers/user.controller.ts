import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { User } from '../models/User.js';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: 'agent' }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('totalRevenue totalPoint name role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const topAgents = await User.find({ role: 'agent' })
      .select('name totalRevenue')
      .sort({ totalRevenue: -1 })
      .limit(10);
    res.json(topAgents);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};
