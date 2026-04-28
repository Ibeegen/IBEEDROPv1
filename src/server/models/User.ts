import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'agent'], default: 'agent' },
  totalRevenue: { type: Number, default: 0 },
  totalPoint: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dob: { type: Date },
  idNumber: { type: String },
  bankInfo: {
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolder: { type: String }
  }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
