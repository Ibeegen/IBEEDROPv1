import { Request, Response } from 'express';
import { Banner } from '../models/Banner.js';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: 'Error creating banner', error });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error });
  }
};
