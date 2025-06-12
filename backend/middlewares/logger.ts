import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync('backend/log.txt', log);
  next();
}