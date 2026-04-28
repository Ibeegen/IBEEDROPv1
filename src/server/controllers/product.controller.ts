import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { featured, supplierId } = req.query;
    const filter: any = {};
    if (featured === 'true') filter.featured = true;
    if (supplierId) filter.supplierId = supplierId;
    
    const products = await Product.find(filter).populate('supplierId').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error instanceof Error ? error.message : String(error) });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (!data.supplierId) {
      delete data.supplierId;
    }
    const product = new Product(data);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating product', stack: error instanceof Error ? error.stack : '' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const data = { ...req.body };
    if (!data.supplierId) {
      delete data.supplierId;
    }
    Object.assign(product, data);
    await product.save(); 
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    const productIds = topProducts.map(tp => tp._id);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Sort products based on topProducts order
    const sortedProducts = productIds.map(id => products.find(p => p._id.toString() === id.toString())).filter(Boolean);
    
    res.json(sortedProducts);
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    res.status(500).json({ message: 'Error fetching top selling products' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplierId');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};
