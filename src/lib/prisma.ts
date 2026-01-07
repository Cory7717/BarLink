import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    // During build, if no DATABASE_URL, return a basic client
    console.warn('DATABASE_URL is not set - creating basic Prisma client');
    return new PrismaClient({
      log: ['error'],
    } as unknown as ConstructorParameters<typeof PrismaClient>[0]);
  }

  // Try with adapter first, fall back to basic client
  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    } as unknown as ConstructorParameters<typeof PrismaClient>[0]);
  } catch (error) {
    console.error('Failed to create Prisma client with adapter, using basic client:', error);
    // Fallback to basic client without adapter
    return new PrismaClient({
      log: ['error'],
    } as unknown as ConstructorParameters<typeof PrismaClient>[0]);
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
