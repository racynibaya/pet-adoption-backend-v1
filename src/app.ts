import express, { Request, Response, NextFunction } from 'express';

// 3rd Party Middlewares
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Custom Middlewares and Routes
import userRoute from '@models/user/user-routes';
import authRoute from '@models/auth/auth-routes';
import shelterRoute from '@models/shelter/shelter-routes';
import AppError from '@utils/app-errror';
import { corsMiddleware, rateLimiter } from '@middlewares';

const app = express();

// Express middlewares
app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);
app.use(morgan('dev'));

app.use(rateLimiter(100, 15 * 60 * 1000)); // Limit to 100 requests per 15 minutes

// Test Route: Entry POINT
app.get('/api/v1/', (req: Request, res: Response) => {
  res.json({
    message: 'hello',
  });
});

app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/shelters', shelterRoute);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

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
