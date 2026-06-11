// Simple test script to exercise OTP endpoints. Run after starting dev server:
// node scripts/check_otp_endpoints.js

const fetch = globalThis.fetch || require('node-fetch')

const base = process.env.BASE_URL || 'http://localhost:3000'
const testEmail = process.env.TEST_EMAIL || 'dev+otp@example.com'

async function run(){
  console.log('Requesting OTP for', testEmail)
  const r1 = await fetch(`${base}/api/auth/otp/request`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  })
  console.log('request status', r1.status)
  const j1 = await r1.json().catch(()=>null)
  console.log(j1)

  console.log('Please check console or SMTP logs for OTP code, then set OTP_CODE env and run verify step')
  if (!process.env.OTP_CODE){
    console.log('Skipping verify step; set OTP_CODE to run verify')
    return
  }

  const code = process.env.OTP_CODE
  console.log('Verifying code', code)
  const r2 = await fetch(`${base}/api/auth/otp/verify`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: testEmail, code }) })
  console.log('verify status', r2.status)
  console.log(await r2.json())
}

run().catch(e=>{ console.error(e); process.exit(1) })
