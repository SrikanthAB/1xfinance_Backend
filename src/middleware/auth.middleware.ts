import type { Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import jwtToken from '../services/user/jwtToken.service';
import { tokenTypes } from '../config/tokens';
import logger from '../config/logger';
import type { DecodedToken } from '../interfaces/token';
import Admin from '../models/admin.model';
import User from '../models/user/user.model';
// Import the extended Express types
import { Request } from 'express';
// Utility function for token extraction and verification
const extractAndVerifyToken = async (
  req: Request,
  tokenType: string
): Promise<DecodedToken | undefined> => {
  const authHeader = req?.headers?.authorization;

  let accessToken: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.split(' ')[1];
  }

  // If token not provided, return undefined (optional)
  if (!accessToken) {
    return undefined;
  }

  // If token exists, verify and return
  return jwtToken.verify({ token: accessToken, tokenType });
};


const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = await extractAndVerifyToken(req, tokenTypes.ACCESS); // Token is optional here

    if (!decoded || !decoded._id) {
      req.user = undefined; // Not authenticated, but not throwing error
      return next();    // Proceed without user
    }

    const user = await User.findById(decoded._id).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    logger.error("User token verification failed: ", error);
    return next(
      new ApiError({
        statusCode: httpStatus.UNAUTHORIZED,
        message: "Unauthorized: Invalid or expired token",
      })
    );
  }
};


const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = await extractAndVerifyToken(req, tokenTypes.ADMIN_ACCESS);
    if (!decoded || !decoded._id) {
      logger.error('Admin token verification failed: Invalid token payload or insufficient permissions');
      throw new ApiError({
        statusCode: httpStatus.FORBIDDEN,
        message: 'Forbidden: Insufficient permissions',
      });
    }

    // Fetch admin details from database
    const admin = await Admin.findById(decoded._id).select('-password -__v').lean();
    
    if (!admin) {
      // logger.error(Admin not found with id: ${decoded._id});
      throw new ApiError({
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'Unauthorized: Admin not found',
      });
    }

    // Attach admin data to request object
    req.admin = admin;
    return next();
  } catch (err) {
    logger.error('Admin authentication failed:', err);
    
    // Handle specific error cases
    if (err instanceof ApiError) {
      return next(err);
    }
    
    return next(
      new ApiError({
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'Unauthorized: Invalid or expired admin token',
      })
    );
  }
};

export default authenticateUser;
export { authenticateUser, authenticateAdmin };
