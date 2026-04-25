import express from 'express';
import { Request, Response } from 'express';

import { registerUser } from './controllers/authController.js';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'hello',
  });
});

app.post('/auth', registerUser);

export default app;
