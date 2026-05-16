import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'taskorbit-super-secret-key';

export const auth = (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    
    if (!token) {
      if (req.headers.authorization?.startsWith('Bearer ')) {
        const headerToken = req.headers.authorization.split(' ')[1];
        const decodedData: any = jwt.verify(headerToken, JWT_SECRET);
        req.userId = decodedData.userId;
        req.userRole = decodedData.role;
        return next();
      }
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decodedData: any = jwt.verify(token, JWT_SECRET);
    req.userId = decodedData.userId;
    req.userRole = decodedData.role;
    next();
  } catch (error: any) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const adminOnly = (req: any, res: Response, next: NextFunction) => {
  const role = String(req.userRole).toUpperCase();
  if (role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};
