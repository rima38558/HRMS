/// <reference types="node" />
import { PrismaClient } from '@prisma/client'

export {}

declare global {
  // Store Prisma client on the globalThis during development to avoid
  // creating multiple instances when hot-reloading.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

declare module 'next' {
  interface NextApiRequest {
    method?: string
  }
}
