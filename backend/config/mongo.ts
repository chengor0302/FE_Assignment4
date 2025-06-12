import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' }); 

export const connectToMongo = async () => {
  try {
    const uri = process.env.MONGODB_CONNECTION_URL;
    if (!uri) throw new Error('MONGODB_CONNECTION_URL not defined in .env');

    await mongoose.connect(uri, {
      dbName: 'notesdb', 
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); 
  }
};
