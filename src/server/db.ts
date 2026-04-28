import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';

let replSet: MongoMemoryReplSet;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('No MONGODB_URI found, using memory server...');
      replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
      uri = replSet.getUri();
    }

    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${uri.includes('mongodb-memory-server') || !process.env.MONGODB_URI ? 'MemoryServer' : 'Remote'}`);
    
    await seedDemoData();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedDemoData = async () => {
  try {
    const adminsToCreate = [
      { email: 'admin@ibeedrop.com', name: 'Admin 1', phone: '0123456789', role: 'admin' },
      { email: 'admin2@ibeedrop.com', name: 'Admin 2', phone: '0123456780', role: 'admin' },
      { email: 'admin3@ibeedrop.com', name: 'Admin 3', phone: '0123456781', role: 'admin' },
    ];

    for (const adminData of adminsToCreate) {
      const adminExists = await User.findOne({ email: adminData.email });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
          name: adminData.name,
          phone: adminData.phone,
          email: adminData.email,
          password: hashedPassword,
          role: adminData.role
        });
        console.log(`Created Admin: ${adminData.email} / admin123`);
      }
    }

    const agentsToCreate = [
      { email: 'agent1@ibeedrop.com', name: 'Agent 1', phone: '0987654321', role: 'agent' },
      { email: 'agent2@ibeedrop.com', name: 'Agent 2', phone: '0987654322', role: 'agent' },
      { email: 'agent3@ibeedrop.com', name: 'Agent 3', phone: '0987654323', role: 'agent' },
    ];

    for (const agentData of agentsToCreate) {
      const agentExists = await User.findOne({ email: agentData.email });
      if (!agentExists) {
        const hashedPassword = await bcrypt.hash('agent123', 10);
        await User.create({
          name: agentData.name,
          phone: agentData.phone,
          email: agentData.email,
          password: hashedPassword,
          role: agentData.role
        });
        console.log(`Created Agent: ${agentData.email} / agent123`);
      }
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
