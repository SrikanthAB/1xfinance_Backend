import { Response } from 'express';

interface IResponseData {
  data?: any;
  message?: string;
  pagination?: any;
}

// Generic function to handle all responses
const sendResponse = (res: Response, statusCode: number, { data, message, pagination }: IResponseData): void => {
  res.status(statusCode).json({
    status: statusCode < 400 ? 'success' : 'error',
    message: message || (statusCode >= 400 ? 'An error occurred' : ''),
    statusCode,
    data,
    pagination,
  });
};

export default sendResponse;
