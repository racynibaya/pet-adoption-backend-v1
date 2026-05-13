import AppError from '@utils/app-error';
import cors, { CorsOptions, CorsOptionsDelegate } from 'cors';
import { Request } from 'express';

// Move outside (not recreated every request)
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:5173',
  'https://koda-nest.vercel.app',
];

// Properly typed delegate function
const corsOptionsDelegate: CorsOptionsDelegate<Request> = (req, callback) => {
  const origin = req.header('Origin');

  const options: CorsOptions = {
    origin: false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: [
      'Content-Range',
      'Accept-Ranges',
      'Content-Encoding',
      'Content-Length',
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600, // Cache preflight response for 10 minutes
  };

  if (!origin || allowedOrigins.includes(origin)) {
    options.origin = true;
    callback(null, options);
  } else {
    callback(new AppError('Not allowed by CORS', 403));
  }
};

// Export middleware directly (no wrapper function)
export const corsMiddleware = cors(corsOptionsDelegate);
