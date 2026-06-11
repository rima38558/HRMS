// Local webhook tester: post a simulated PayU webhook payload to the local dev server
const fetch = globalThis.fetch || require('node-fetch')
const crypto = require('crypto')

const base = process.env.BASE_URL || 'http://localhost:3000'
const key = process.env.PAYU_MERCHANT_KEY || process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY || 'testkey'
const salt = process.env.PAYU_MERCHANT_SALT || 'testsalt'

function makeHash(payload){
  // emulate verification algorithm: sha512(salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
  const parts = [salt, payload.status || '', '', '', '', '', '', '', '', '', '', '', payload.email || '', payload.firstname || '', payload.productinfo || '', payload.amount || '', payload.txnid || '', key]
  const s = parts.join('|')
  return crypto.createHash('sha512').update(s).digest('hex')
}

async function run(){
  const payload = {
    txnid: process.env.TXNID || 'txn_test_123',
    status: 'success',
    amount: process.env.AMOUNT || '100.00',
    productinfo: 'Service',
    firstname: 'Test',
    email: process.env.EMAIL || 'dev+payu@example.com'
  }
  payload.hash = makeHash(payload)
  console.log('Posting webhook for txnid', payload.txnid)
  const r = await fetch(`${base}/api/payments/payu/webhook`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
  console.log('status', r.status)
  console.log(await r.text())
}

run().catch(e=>{ console.error(e); process.exit(1) })
