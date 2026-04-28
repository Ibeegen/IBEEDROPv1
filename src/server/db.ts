import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let replSet: MongoMemoryReplSet | null = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI?.trim();
    const useMemoryDatabase = !mongoUri;

    if (useMemoryDatabase) {
      replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
      const memoryUri = replSet.getUri();
      await mongoose.connect(memoryUri);
      console.log('MongoDB connected to memory replica set');
    } else {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected using configured URI');
    }

    const shouldSeedDemoData = process.env.SEED_DEMO_DATA === 'true' || useMemoryDatabase;
    if (shouldSeedDemoData) {
      await seedDemoData();
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedDemoData = async () => {
  try {
    const { Product } = await import('./models/Product.js');
    const { Supplier } = await import('./models/Supplier.js');

    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      await Supplier.create({
        name: 'Ibee Supplier',
        contactPerson: 'Admin',
        status: 'active'
      });
      console.log('Created default supplier');
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.create([
        { name: 'Starter Product A', description: 'Sample product', images: [], retailPrice: 1320000, costPrice: 1000000, agentCommission: 200000 },
        { name: 'Starter Product B', description: 'Sample product', images: [], retailPrice: 500000, costPrice: 350000, agentCommission: 100000 },
        { name: 'Starter Product C', description: 'Sample product', images: [], retailPrice: 300000, costPrice: 200000, agentCommission: 50000 }
      ]);
      console.log('Created starter products');
    }
  } catch (err) {
    console.error('Error seeding demo data:', err);
  }
};
