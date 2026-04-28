import mongoose from 'mongoose';

const PromotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  banner: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['bonus_point', 'commission_boost'], required: true },
  value: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export const Promotion = mongoose.model('Promotion', PromotionSchema);
