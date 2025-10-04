import { UserDocument } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      // Add any other custom properties you need on the request object
      [key: string]: any;
    }
  }
}
