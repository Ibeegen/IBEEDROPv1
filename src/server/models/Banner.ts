import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export const Banner = mongoose.model('Banner', BannerSchema);
