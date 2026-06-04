import { PrismaClient } from '@prisma/client'

declare global {
	// allow attaching Prisma client to the globalThis for hot-reload safety
	// (prevents creating new clients during dev fast-refresh)
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
