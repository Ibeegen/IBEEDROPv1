import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';

let replSet: MongoMemoryReplSet;

export const connectDB = async () => {
  try {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();

    await mongoose.connect(uri);
    console.log(`MongoDB connected to memory replica set: ${uri}`);
    
    await seedDemoData();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedDemoData = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@demo.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin Demo',
        phone: '0123456789',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Created Admin Demo: admin@demo.com / admin123');
    }

    const agentExists = await User.findOne({ email: 'agent@demo.com' });
    if (!agentExists) {
      const hashedPassword = await bcrypt.hash('agent123', 10);
      await User.create({
        name: 'Agent Demo',
        phone: '0987654321',
        email: 'agent@demo.com',
        password: hashedPassword,
        role: 'agent'
      });
      console.log('Created Agent Demo: agent@demo.com / agent123');
    }

    // Seed products
    const { Product } = await import('./models/Product.js');
    const { Supplier } = await import('./models/Supplier.js');

    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      await Supplier.create({
        name: 'Ibee Supplier',
        contactPerson: 'Admin',
        status: 'active'
      });
      console.log('Created Default Supplier: Ibee Supplier');
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.create([
        { name: 'Sữa non Alpha Lipid', description: 'Sữa non nhập khẩu', images: [], retailPrice: 1320000, costPrice: 1000000, agentCommission: 200000 },
        { name: 'Omega 3', description: 'Dầu cá tự nhiên', images: [], retailPrice: 500000, costPrice: 350000, agentCommission: 100000 },
        { name: 'Vitamin C', description: 'Tăng đề kháng', images: [], retailPrice: 300000, costPrice: 200000, agentCommission: 50000 }
      ]);
      console.log('Created Demo Products');
    }

  } catch (err) {
    console.error('Error seeding demo accounts:', err);
  }
};
