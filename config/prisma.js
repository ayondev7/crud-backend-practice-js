/**
 * PRISMA DATABASE CONNECTION
 * 
 * This file manages the connection to PostgreSQL via Prisma Client
 */

import { PrismaClient } from '@prisma/client';

// Create Prisma Client instance
// In development, we prevent hot reloading from creating new instances
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Store in global to prevent multiple instances during development
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

/**
 * Connect to PostgreSQL database
 */
async function connectPrisma() {
  try {
    await prisma.$connect();
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Prisma connection error:', error.message);
    throw error;
  }
}

/**
 * Disconnect from PostgreSQL database
 */
async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('Prisma disconnection error:', error.message);
    throw error;
  }
}

export { prisma, connectPrisma, disconnectPrisma };
