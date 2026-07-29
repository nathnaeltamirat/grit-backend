import { Pool } from 'pg';
import env from './config.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client/extension';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});
export default prisma;
