import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers["authorization"] || "";
      const token = Array.isArray(auth) ? auth[0] : auth;
      const parts = token.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
      }
      const payload = jwt.verify(parts[1], process.env.JWT_SECRET as string) as { sub: string };
      (req as any).userId = payload.sub;
      return next();
    } catch (err: any) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  }