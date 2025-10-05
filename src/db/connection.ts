import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { MONGODB_URI } from "../utils/secret";
let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;
  console.log("MONGODB_URI", MONGODB_URI);
  mongoose.connection.on("connected", () => {
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    // eslint-disable-next-line no-console
    console.log("MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB error:", err);
  });

  await mongoose.connect(MONGODB_URI);
}

export function isDbConnected(): boolean {
  return isConnected;
}

export function requireDbReady(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      message: "Database not connected",
    });
  }
  return next();
}

