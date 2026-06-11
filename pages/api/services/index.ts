import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try{
    const services = await prisma.service.findMany({ where: { active: true } })
    res.status(200).json({ services })
  }catch(e:any){
    console.error('Failed to fetch services', e)
    res.status(500).json({ error: 'Failed to fetch services' })
  }
}
