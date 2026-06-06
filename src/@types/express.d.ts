import { SanitizedUser } from '@models/auth/auth-types';

declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser;
    }
  }
}
