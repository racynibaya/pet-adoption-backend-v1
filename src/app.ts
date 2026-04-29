import express from 'express';
import { Request, Response, NextFunction } from 'express';

import userRoute from 'models/user/user.routes';
import authRoute from 'models/auth/auth.routes';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'hello',
  });
});

app.use('/users', userRoute);
app.use('/auth', authRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
