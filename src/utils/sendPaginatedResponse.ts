import { Response } from "express";

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: Record<string, any>,
  message: string = 'Request successful',
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    data,
    pagination,
    message,
  });
};
