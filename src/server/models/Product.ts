import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String },
  retailPrice: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  agentCommission: { type: Number, required: true },
  featured: { type: Boolean, default: false },
  companyProfit: { type: Number },
  point: { type: Number },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }
}, { timestamps: true });

// Auto-calculate profit and point
ProductSchema.pre('save', function () {
  this.companyProfit = this.retailPrice - this.costPrice - this.agentCommission;
  // 10.000đ lợi nhuận = 2 IbeePoint
  this.point = (this.companyProfit / 10000) * 2;
});

export const Product = mongoose.model('Product', ProductSchema);
