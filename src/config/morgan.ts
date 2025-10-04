import morgan from 'morgan';
import { Request, Response } from 'express';
import config from './config';
import logger from './logger';

// Custom token to extract error messages from the response locals
morgan.token('message', (req: Request, res: Response) => res.locals.errorMessage || '');

// Helper function to format IP address logging based on environment
const getIpFormat = (): string => (config.env === 'production' ? ':remote-addr - ' : '');

// Define log formats
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

// Success handler: log successful requests
const successHandler = morgan(successResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode >= 400,
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
});

// Error handler: log failed requests
const errorHandler = morgan(errorResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode < 400,
  stream: {
    write: (message: string) => logger.error(message.trim()),
  },
});

// Export the handlers
export { successHandler, errorHandler };
