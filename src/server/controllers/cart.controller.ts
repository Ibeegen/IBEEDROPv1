import { Request, Response } from 'express';
import { Cart } from '../models/cart.model.js';

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId, quantity } = req.body;

    if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      const populatedCart = await Cart.findById(cart._id).populate('items.productId');
      return res.json(populatedCart);
    }

    res.status(404).json({ message: 'Item not found in cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId) as any;
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart' });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await Cart.findOneAndUpdate({ userId }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart' });
  }
};
