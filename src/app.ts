import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';

import helmet from 'helmet';
import pinoHttp from 'pino-http';

// Custom Middlewares
import { corsMiddleware, rateLimiter } from '@middlewares';
import { verifyTokenMiddleware } from '@models/auth/auth-middleware';
import logger from '@config/logger';

// Routes
import userRoute from '@models/user/user-routes';
import authRoute from '@models/auth/auth-routes';
import shelterRoute from '@models/shelter/shelter-routes';
import petsRoute from '@models/pet/pet-routes';
import adoptionRequestRoute from '@models/adoption-request/adoption-request-routes';

import AppError from '@utils/app-error';

const app = express();

const BASE_ROUTE = '/api/v1';

// Express middlewares\
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);

// HTTP request logging — replace morgan
app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },
  }),
);

if (process.env.NODE_ENV === 'production')
  app.use(rateLimiter(100, 15 * 60 * 1000)); // Limit to 100 requests per 15 minutes

app.use('/uploads', express.static('uploads'));

// Test Route: Entry POINT
app.get(BASE_ROUTE, verifyTokenMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'hello',
  });
});

app.use(`${BASE_ROUTE}/users`, userRoute);
app.use(`${BASE_ROUTE}/auth`, authRoute);
app.use(`${BASE_ROUTE}/shelters`, shelterRoute);
app.use(`${BASE_ROUTE}/pets`, petsRoute);

app.use(`${BASE_ROUTE}/adoption-requests`, adoptionRequestRoute);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

export default app;
