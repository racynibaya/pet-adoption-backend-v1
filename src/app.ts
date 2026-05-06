import express from 'express';
import { Request, Response, NextFunction } from 'express';

import cookieParser from 'cookie-parser';

import userRoute from 'models/user/user-routes';
import authRoute from 'models/auth/auth-routes';
import AppError from '@utils/app-errror';

import { corsMiddleware } from '@config/corsConfigurations';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);

app.get('/api/v1/', (req: Request, res: Response) => {
  res.json({
    message: 'hello',
  });
});

app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

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
