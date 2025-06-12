import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import noteRoutes from './routes/noteRoutes';
import userRoutes from './routes/userRoutes';
import loginRoutes from './routes/loginRoutes';

dotenv.config();

const app = express();

app.use(cors({ exposedHeaders: ['X-Total-Count'] }));
app.use(express.json());

app.use('/notes', noteRoutes);
app.use('/users', userRoutes);
app.use('/login', loginRoutes);

app.get('/health', (_req, res) => {
  res.send('OK');
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

export default app;
