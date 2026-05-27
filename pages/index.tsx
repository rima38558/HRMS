import Head from 'next/head'
import Link from 'next/link'

export default function Home(){
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Head>
        <title>Legal Compliances & Payroll Services</title>
      </Head>
      <main className="max-w-3xl p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-2">Legal Compliances & Payroll Services</h1>
        <p className="mb-4">Professional consultancy and payroll services — labour law, registrations, payroll outsourcing, and more.</p>
        <div className="flex gap-2">
          <Link href="/services" className="px-4 py-2 bg-blue-600 text-white rounded">View Services</Link>
          <Link href="/auth/signup" className="px-4 py-2 border rounded">Sign Up</Link>
        </div>
      </main>
    </div>
  )
}
