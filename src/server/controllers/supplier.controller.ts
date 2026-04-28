import { Request, Response } from 'express';
import { Supplier } from '../models/Supplier.js';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error: error instanceof Error ? error.message : String(error) });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Error creating supplier', error: error instanceof Error ? error.message : String(error) });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Error updating supplier', error: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplier', error: error instanceof Error ? error.message : String(error) });
  }
};
