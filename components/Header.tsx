import Link from 'next/link'
import React from 'react'

export default function Header(){
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="24" height="24" rx="6" fill="#2563EB"/>
            <path d="M7 12h10M7 8h6M7 16h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div className="text-lg font-semibold">Legal Compliance</div>
            <div className="text-xs text-gray-500">Payroll Services</div>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/services" className="text-sm text-gray-700 hover:text-gray-900">Services</Link>
          <Link href="/laws" className="text-sm text-gray-700 hover:text-gray-900">Laws</Link>
          <Link href="/minimum-wages" className="text-sm text-gray-700 hover:text-gray-900">Minimum Wages</Link>
          <Link href="/contact" className="text-sm text-gray-700 hover:text-gray-900">Contact</Link>
          <div className="ml-4 flex items-center gap-2">
            <Link href="/auth/login" className="px-3 py-1 border rounded text-sm">Login</Link>
            <Link href="/auth/signup" className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Register</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
