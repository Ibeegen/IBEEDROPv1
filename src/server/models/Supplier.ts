import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  contactPerson: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  note: { type: String },
  status: { type: String, enum: ['active', 'locked'], default: 'active' },
}, { timestamps: true });

export const Supplier = mongoose.model('Supplier', supplierSchema);
