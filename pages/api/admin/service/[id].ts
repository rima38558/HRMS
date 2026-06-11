import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getUserFromRequest } from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const user = getUserFromRequest(req)
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin required' })

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id required' })

  if (req.method === 'GET'){
    const svc = await prisma.service.findUnique({ where: { id: String(id) } })
    return res.status(200).json({ service: svc })
  }

  if (req.method === 'PUT'){
    try{
      const data = req.body
      const updated = await prisma.service.update({ where: { id: String(id) }, data })
      return res.status(200).json({ service: updated })
    }catch(e:any){
      console.error('Update failed', e)
      return res.status(500).json({ error: 'Update failed' })
    }
  }

  if (req.method === 'DELETE'){
    try{
      await prisma.service.delete({ where: { id: String(id) } })
      return res.status(204).end()
    }catch(e:any){
      console.error('Delete failed', e)
      return res.status(500).json({ error: 'Delete failed' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
