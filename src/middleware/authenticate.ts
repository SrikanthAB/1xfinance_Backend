import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user/user.model';
import { IUser } from '../interfaces/user/user.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { id: string };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { id: string };
    
    console.log('Decoded token ID:', decoded.id);
    
    // Get user from the token
    const user = await User.findById(decoded.id).select('-password');
    
    console.log('Found user:', user ? user._id : 'Not found');
    console.log('User document:', JSON.stringify(user, null, 2));

    if (!user) {
      console.error('User not found in database for ID:', decoded.id);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found',
        decodedToken: decoded
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !('role' in req.user) || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Not authorized as admin' 
    });
  }
  next();
};
