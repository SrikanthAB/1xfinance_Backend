import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError"; // import your ApiError class properly!

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // console.log('Global Error Handler:', err);

  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    // ✅ It's a known operational error
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    // ✅ Mongoose validation error
    statusCode = 400;
    console.log("error", err.errors);
    if (err.errors && typeof err.errors === "object") {
      message = Object.values(err.errors)
        .map((val: any) => val.message)
        .join(", ");
    } else {
      message = err.message;
    }
  } else if (err.name === "MongoError" && err.code === 11000) {
    // ✅ Mongoose duplicate key error
    statusCode = 409;
    message = "Duplicate key error";
  } else if (err.name === "TokenExpiredError") {
    // JWT Token has expired
    statusCode = 401;
    message = "Token has expired";
  } else if (err.name === "JsonWebTokenError") {
    // Invalid JWT
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  } else if (err instanceof SyntaxError && err.message.includes("JSON")) {
    statusCode = 400;
    message = "Malformed JWT payload";
  } else if (err instanceof Error) {
    message = err.message || message;
    if ("statusCode" in err && typeof err.statusCode === "number") {
      statusCode = err.statusCode;
    }
  }

  return res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

export default globalErrorHandler;
