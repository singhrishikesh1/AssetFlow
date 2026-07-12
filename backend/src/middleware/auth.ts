import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'assetflow_fallback_jwt_secret_key_2026_secure_string_987';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'Employee' | 'Asset Manager' | 'Department Head' | 'Admin';
    name: string;
    department: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No Token Provided' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as any;
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Access Denied: Invalid or Expired Token' });
  }
};

export const requireRole = (allowedRoles: ('Employee' | 'Asset Manager' | 'Department Head' | 'Admin')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access Denied: User details not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: This action requires role of [${allowedRoles.join(', ')}]` });
    }

    next();
  };
};
