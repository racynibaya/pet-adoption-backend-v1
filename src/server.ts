import http from 'http';

import app from './app';
import prisma from '@config/prisma';
import logger from '@config/logger';

import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

async function start() {
  await prisma.$connect();
  await prisma.pet.count();
  server.listen(PORT, () => {
    logger.info(`HTTP Server listening on http://localhost:${PORT}/`);
  });
}

start();
