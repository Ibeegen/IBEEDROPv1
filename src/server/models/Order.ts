import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  totalProfit: { type: Number, required: true },
  commission: { type: Number, required: true },
  point: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'shipping', 'completed', 'cancelled', 'returned'], 
    default: 'pending' 
  }
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);
