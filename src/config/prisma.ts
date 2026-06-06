import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';

// Load base vars from .env, then overlay the environment-specific file.
// e.g. NODE_ENV=development → also loads .env.development (DATABASE_URL for local Docker)
//      NODE_ENV=production  → dotenv silently skips the missing file;
//                             DATABASE_URL comes from the platform's dashboard instead.
// Load env-specific file first, then base .env.
// Neither call uses override — so shell/platform vars always win.
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
