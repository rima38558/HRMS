import Head from 'next/head'
import React from 'react'

export default function Contact(){
  return (
    <div className="max-w-3xl mx-auto p-8">
      <Head>
        <title>Contact Us - Legal Compliance & Payroll Services</title>
      </Head>
      <section className="bg-white rounded shadow p-6">
        <h1 className="text-2xl font-semibold mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-4">Have questions? Reach out and we will get back to you.</p>
        <form className="grid grid-cols-1 gap-3">
          <input placeholder="Your name" className="border p-2 rounded" />
          <input placeholder="Email" className="border p-2 rounded" />
          <textarea placeholder="Message" className="border p-2 rounded h-28" />
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded">Send Message</button>
        </form>
      </section>
    </div>
  )
}
