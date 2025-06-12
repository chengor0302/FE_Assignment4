import app from './expressApp';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './.env') });

const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGODB_CONNECTION_URL;

if (!MONGO_URL) {
  throw new Error('MONGODB_CONNECTION_URL is not defined in .env');
}

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(` Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' Failed to connect to MongoDB:', err);
  });
