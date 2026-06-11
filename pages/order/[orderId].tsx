import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function OrderPage(){
  const router = useRouter()
  const { orderId } = router.query
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!orderId) return
    fetch(`/api/orders/${orderId}`).then(r=>r.json()).then(d=>{ setOrder(d.order); setLoading(false) }).catch(()=>setLoading(false))
  },[orderId])

  if (loading) return <div className="p-6">Loading…</div>
  if (!order) return <div className="p-6">Order not found.</div>

  const items = (()=>{
    try{ return JSON.parse(order.items || '[]') }catch(e){ return [] }
  })()

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Head><title>Order {order.id}</title></Head>
      <h1 className="text-2xl font-bold mb-4">Order Confirmation</h1>
      <div className="border p-4 rounded">
        <div className="mb-2">Order ID: <strong>{order.id}</strong></div>
        <div className="mb-2">Status: <strong>{order.paymentStatus}</strong></div>
        <div className="mb-2">Total: <strong>₹{order.total}</strong></div>
        <h3 className="mt-4 font-semibold">Items</h3>
        <ul>
          {items.map((it:any, idx:number)=> (
            <li key={idx} className="py-1">{it.title} × {it.quantity} — ₹{it.lineTotal}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
