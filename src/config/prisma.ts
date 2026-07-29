import { Pool } from 'pg';
import envConfig from './config.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';


const pool = new Pool({
  connectionString: envConfig.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});
export default prisma;
