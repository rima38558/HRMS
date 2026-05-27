import React, { useState } from 'react'
import { GetServerSideProps } from 'next'
import prisma from '../../lib/prisma'
import { getUserFromRequest } from '../../lib/auth'

export default function OrderPage({ order, documents }: any){
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const upload = async () =>{
    if (!file) return alert('Select a file')
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async () =>{
      const data = reader.result as string
      const res = await fetch(`/api/orders/${order.id}/upload`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, data, serviceId: order.items && JSON.parse(order.items)[0]?.serviceId }) })
      const j = await res.json()
      if (!res.ok) alert(j.error || 'Upload failed')
      else location.reload()
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-xl font-semibold mb-4">Order {order.id}</h1>
      <p>Service(s): {order.items && JSON.parse(order.items).map((i:any)=>i.title).join(', ')}</p>
      <p className="mb-4">Amount: ₹{order.total}</p>

      <div className="mb-4">
        <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <button onClick={upload} disabled={loading} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded">Upload</button>
      </div>

      <div>
        <h2 className="font-semibold">Uploaded Documents</h2>
        <ul className="mt-2 list-disc ml-6">
          {documents.map((d:any)=> (
            <li key={d.id}><a href={d.s3Key || `/uploads/${order.id}/${d.filename}`} target="_blank" rel="noreferrer">{d.filename}</a> — uploaded {new Date(d.uploadedAt).toLocaleString()}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) =>{
  const { orderId } = context.query as { orderId: string }
  const decoded: any = getUserFromRequest(context.req as any)
  if (!decoded || !decoded.userId) return { redirect: { destination: '/auth/signup', permanent: false } }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.userId !== decoded.userId) return { notFound: true }
  const documents = await prisma.document.findMany({ where: { orderId }, orderBy: { uploadedAt: 'desc' } })
  return { props: { order: JSON.parse(JSON.stringify(order)), documents: JSON.parse(JSON.stringify(documents)) } }
}
