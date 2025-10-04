import { IUser } from '../../interfaces/user/user.interface';
import { IUserDocument } from '../../models/user/user.model';

/**
 * This is the single source of truth for extending the Express Request type.
 * All other extensions should be removed to avoid conflicts.
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * The authenticated user object. This should be set by the auth middleware.
       * For MongoDB documents, prefer using userDocument when you need document methods.
       */
      user?: IUser & { _id: string; id: string };
      
      /**
       * The full user document with Mongoose document methods.
       * This should be populated by the auth middleware when needed.
       */
      userDocument?: IUserDocument;
    }
  }
}
