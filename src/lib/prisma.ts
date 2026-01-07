import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Your generated PrismaClient requires an options argument, but its options type
// doesn't align cleanly with Prisma.PrismaClientOptions. Provide the minimal
// config and cast at the callsite to keep TypeScript + builds happy.
const prismaClientOptions =
  process.env.NODE_ENV === 'development'
    ? {
        log: ['query', 'error', 'warn'],
        accelerateUrl: undefined,
      }
    : {
        accelerateUrl: undefined,
      };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaClientOptions as unknown as ConstructorParameters<typeof PrismaClient>[0]);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
