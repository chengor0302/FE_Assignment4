import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
}

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

export const UserModel = mongoose.model<User>('User', userSchema); 