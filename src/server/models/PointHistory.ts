import mongoose from 'mongoose';

const PointHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  description: { type: String },
  balanceAfter: { type: Number }
}, { timestamps: true });

export const PointHistory = mongoose.model('PointHistory', PointHistorySchema);
