const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is required to run the seed script.");
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['agent', 'admin'], default: 'agent' },
  status: { type: String, enum: ['active', 'inactive', 'pending_approval'], default: 'active' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const admins = [
  { email: 'admin@ibeedrop.com', name: 'Admin 1', phone: '0123456789', role: 'admin' },
  { email: 'admin2@ibeedrop.com', name: 'Admin 2', phone: '0123456780', role: 'admin' },
  { email: 'admin3@ibeedrop.com', name: 'Admin 3', phone: '0123456781', role: 'admin' },
];

const agents = [
  { email: 'agent1@ibeedrop.com', name: 'Agent 1', phone: '0987654321', role: 'agent' },
  { email: 'agent2@ibeedrop.com', name: 'Agent 2', phone: '0987654322', role: 'agent' },
  { email: 'agent3@ibeedrop.com', name: 'Agent 3', phone: '0987654323', role: 'agent' }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const data of admins) {
      const exists = await User.findOne({ email: data.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({ ...data, password: hashedPassword, status: 'active' });
        console.log(`Created Admin: ${data.email} / admin123`);
      } else {
        console.log(`Admin ${data.email} already exists.`);
      }
    }

    for (const data of agents) {
      const exists = await User.findOne({ email: data.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash('agent123', 10);
        await User.create({ ...data, password: hashedPassword, status: 'active' });
        console.log(`Created Agent: ${data.email} / agent123`);
      } else {
        console.log(`Agent ${data.email} already exists.`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seed();
