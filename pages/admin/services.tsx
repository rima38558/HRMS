import React, { useState } from 'react'
import prisma from '../../lib/prisma'
import { GetServerSideProps } from 'next'
import { getUserFromRequest } from '../../lib/auth'

export default function AdminServices({ services }: any){
  const [form, setForm] = useState({ title: '', description: '', price: '', gstRate: '18' })

  const create = async (e:any) =>{
    e.preventDefault()
    const res = await fetch('/api/admin/service/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const j = await res.json()
    if (!res.ok) alert(j.error || 'Failed')
    else location.reload()
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Admin — Services</h1>
      <form onSubmit={create} className="mb-6 space-y-2">
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="p-2 border rounded w-full" />
        <input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="p-2 border rounded w-full" />
        <div className="flex gap-2">
          <input placeholder="Price" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="p-2 border rounded" />
          <input placeholder="GST%" value={form.gstRate} onChange={e=>setForm({...form, gstRate: e.target.value})} className="p-2 border rounded w-24" />
        </div>
        <button className="px-3 py-1 bg-green-600 text-white rounded">Create</button>
      </form>

      <h2 className="font-semibold mb-2">Existing Services</h2>
      <ul className="list-disc ml-6">
        {services.map((s:any)=>(<li key={s.id}>{s.title} — ₹{s.price} (GST {s.gstRate}%)</li>))}
      </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) =>{
  const decoded: any = getUserFromRequest(context.req as any)
  if (!decoded || !decoded.userId) return { redirect: { destination: '/auth/signup', permanent: false } }
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map((s: string) => s.trim()) : []
  if (!user || (user.role !== 'admin' && !adminEmails.includes(user.email))) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const services = await prisma.service.findMany({ orderBy: { title: 'asc' } })
  return { props: { services: JSON.parse(JSON.stringify(services)) } }
}
