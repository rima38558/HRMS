import Head from 'next/head'
import Link from 'next/link'

export default function Login(){
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Head>
        <title>Login - Legal Compliance</title>
      </Head>
      <main className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        <form className="flex flex-col gap-3">
          <input placeholder="Email" className="border p-2 rounded" />
          <input placeholder="Password" type="password" className="border p-2 rounded" />
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
        </form>
        <p className="mt-4 text-sm">Do not have an account? <Link href="/auth/signup" className="text-blue-600">Register</Link></p>
      </main>
    </div>
  )
}
