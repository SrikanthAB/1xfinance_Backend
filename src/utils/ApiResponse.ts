import { Response } from 'express';

class SuccessResponse<T> {
  public statusCode: number;
  public message: string;
  public data: T;
  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
  send(res: Response): void {
    res.json({
      status: true,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    });
  }
}

export default SuccessResponse;
