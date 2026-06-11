import React, { useEffect, useState } from 'react'
import Head from 'next/head'

type Service = { id: string, title: string, description?: string, price: number }

export default function ServicesPage(){
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch('/api/services')
      .then(r=>r.json())
      .then(d=>{ setServices(d.services || []); setLoading(false) })
      .catch(()=>setLoading(false))
  },[])

  async function addToCart(id:string){
    await fetch('/api/cart/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: id, quantity: 1 }) })
    alert('Added to cart')
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Head>
        <title>Services</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Services</h1>
      {loading && <p>Loading…</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(s=> (
          <div key={s.id} className="p-4 border rounded">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-sm text-gray-600">{s.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-lg">₹{s.price}</div>
              <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={()=>addToCart(s.id)}>Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
import Link from 'next/link'
import prisma from '../../lib/prisma'

export default function Services({ services }: any){
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Our Services</h1>
      {services.length === 0 ? (
        <p className="text-gray-600">No services available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s: any) => (
            <div key={s.id} className="p-4 bg-white rounded shadow">
              <h2 className="font-bold">{s.title}</h2>
              <p className="text-sm">{s.description}</p>
              <p className="mt-2 font-medium">Price: ₹{s.price}</p>
              <Link href={`/services/${s.id}`} className="mt-2 inline-block px-3 py-1 bg-blue-600 text-white rounded">View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps(){
  // Server-side render with Prisma — requires DB to be set up
  try {
    const services = await prisma.service.findMany({ where: { active: true } })
    return { props: { services } }
  } catch (err: any) {
    // If Prisma client fails to initialize (missing/invalid DB), return empty list
    console.error('Prisma error in getServerSideProps /services:', err && err.message ? err.message : err)
    return { props: { services: [] } }
  }
}
