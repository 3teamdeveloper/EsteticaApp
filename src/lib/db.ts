// Re-export prisma from the main prisma file to maintain compatibility
import prismaClient from './prisma';

export const prisma = prismaClient;

console.log("Prisma");