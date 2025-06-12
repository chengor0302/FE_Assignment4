import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  const user = await UserModel.findOne({ username });
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!passwordCorrect) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }
  const userForToken = {
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
  };
  const token = jwt.sign(userForToken, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.status(200).json({ token, user: userForToken });
}; 