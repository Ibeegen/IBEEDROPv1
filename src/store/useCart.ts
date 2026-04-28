import { create } from 'zustand';
import { api } from '../services/api';

interface CartItem {
  productId: any;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/cart');
      set({ items: res.data.items });
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    try {
      const res = await api.post('/cart/add', { productId, quantity });
      set({ items: res.data.items });
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    try {
      const res = await api.put('/cart/update', { productId, quantity });
      set({ items: res.data.items });
    } catch (err) {
      console.error('Error updating cart:', err);
    }
  },

  removeItem: async (productId: string) => {
    try {
      const res = await api.delete(`/cart/remove/${productId}`);
      set({ items: res.data.items });
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ items: [] });
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  }
}));
