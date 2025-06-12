import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/userModel';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  console.log('Register endpoint hit', req.body);
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, username, passwordHash });
    await user.save();
    console.log('User saved:', user);
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Failed to save user' });
  }
}; 