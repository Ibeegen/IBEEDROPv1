import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, password, referrerId } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      phone, 
      email, 
      password: hashedPassword, 
      role: 'agent',
      referrerId: referrerId || undefined
    });
    await user.save();

    res.status(201).json({ message: 'Registered successfully', user: { id: user._id, email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, portal } = req.body;
    
    if (!portal || (portal !== 'admin' && portal !== 'agent')) {
      return res.status(400).json({ message: 'Portal field is required (admin or agent)' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.status !== 'active') return res.status(403).json({ message: 'Account is not active' });

    if (portal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    
    if (portal === 'agent' && user.role !== 'agent') {
      return res.status(403).json({ message: 'Forbidden. Agent access required.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getAgentInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, 'name phone');
    if (!user) return res.status(404).json({ message: 'Agent not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, phone, gender, dob, idNumber, bankInfo } = req.body;
    const userId = (req as any).user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.idNumber = idNumber || user.idNumber;
    user.bankInfo = bankInfo || user.bankInfo;

    await user.save();
    res.json({ message: 'Cập nhật thông tin thành công', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCollaborators = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.id;
    const collaborators = await User.find({ referrerId: agentId }, 'name email phone status createdAt');
    res.json(collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ message: 'Error fetching collaborators' });
  }
};
