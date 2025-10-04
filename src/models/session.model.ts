import mongoose, { Schema, Document } from 'mongoose';
import config from '../config/config';

export interface ISession extends Document {
  sessionId: string;
  userId: string;
  refreshToken: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    refreshToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: parseInt(config.jwt.refreshTokenExpiresIn) }
  }
);

// Index for automatic expiration of sessions
// The session will expire after the refresh token expiration time
SessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: parseInt(config.jwt.refreshTokenExpiresIn) });


const Session =  mongoose.model<ISession>('Session', SessionSchema);
export default Session;