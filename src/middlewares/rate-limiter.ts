import { rateLimit } from 'express-rate-limit';

export const rateLimiter = function (
  request: number,
  time: number = 15 * 60 * 1000,
) {
  return rateLimit({
    limit: request,
    windowMs: time,
    message: 'Too many requests, please try again later.',
    standardHeaders: 'draft-8',
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56,
  });
};
