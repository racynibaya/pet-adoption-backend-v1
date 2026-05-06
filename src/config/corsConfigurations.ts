import AppError from '@utils/app-errror';
import cors, { CorsOptions, CorsOptionsDelegate } from 'cors';
import { Request } from 'express';

// Move outside (not recreated every request)
const allowedOrigins = ['http://localhost:3001', 'http://yourcustomdomain.com'];

// Properly typed delegate function
const corsOptionsDelegate: CorsOptionsDelegate<Request> = (req, callback) => {
  const origin = req.header('Origin');

  console.log(origin);

  if (!origin || allowedOrigins.includes(origin)) {
    const options: CorsOptions = {
      origin: true,
      credentials: true,
    };
    callback(null, options);
  } else {
    callback(new AppError('Not allowed by CORS', 403));
  }
};

// Export middleware directly (no wrapper function)
export const corsMiddleware = cors(corsOptionsDelegate);
