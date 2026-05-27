import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const decoded: any = getUserFromRequest(req)
  if (!decoded || !decoded.userId) return res.status(200).json({ user: null })
  const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, name: true, email: true } })
  res.status(200).json({ user })
}
