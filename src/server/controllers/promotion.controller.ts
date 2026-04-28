import { Request, Response } from 'express';
import { Promotion } from '../models/Promotion.js';

export const getPromotions = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching promotions', error });
  }
};

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ message: 'Error creating promotion', error });
  }
};
