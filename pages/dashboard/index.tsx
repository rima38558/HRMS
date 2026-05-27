import React from 'react'
import { GetServerSideProps } from 'next'
import { getUserFromRequest } from '../../lib/auth'
import prisma from '../../lib/prisma'

export default function Dashboard({ user }: any){
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, {user?.name} — your dashboard will appear here.</p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const req = context.req
  const decoded: any = getUserFromRequest(req)
  if (!decoded || !decoded.userId){
    return { redirect: { destination: '/auth/signup', permanent: false } }
  }
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
  if (!user) return { redirect: { destination: '/auth/signup', permanent: false } }
  return { props: { user: { id: user.id, name: user.name, email: user.email } } }
}
