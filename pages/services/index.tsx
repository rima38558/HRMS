import Link from 'next/link'
import prisma from '../../lib/prisma'

export default function Services({ services }: any){
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Services Catalogue</h1>
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
