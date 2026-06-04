import Head from 'next/head'
import Link from 'next/link'

export default function Home(){
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Legal Compliance & Payroll Services</title>
      </Head>
      <main className="max-w-4xl mx-auto p-8">
        <section className="bg-white rounded shadow p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">LC</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Legal Compliance & Payroll Services</h1>
              <p className="text-gray-600 mt-2">Trusted partner for labour law compliance, registrations, and payroll outsourcing. We help businesses stay compliant and run payroll smoothly.</p>
              <div className="mt-4 flex gap-3">
                <Link href="/services" className="px-4 py-2 bg-blue-600 text-white rounded">Our Services</Link>
                <Link href="/contact" className="px-4 py-2 border rounded">Contact Us</Link>
                <Link href="/auth/signup" className="px-4 py-2 border rounded">Register</Link>
                <Link href="/auth/login" className="px-4 py-2 text-gray-700">Login</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">Payroll Outsourcing</h3>
            <p className="text-sm text-gray-600">End-to-end payroll processing, statutory filings, and payslips.</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">Compliance Advisory</h3>
            <p className="text-sm text-gray-600">Advisory on labour laws, registrations, and employment contracts.</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">Document Management</h3>
            <p className="text-sm text-gray-600">Secure document uploads and signed agreements management.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
