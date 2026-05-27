const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const prisma = new PrismaClient()
const fs = require('fs')

async function main(){
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@example.com'
  const name = process.env.ADMIN_SEED_NAME || 'Admin User'
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not set in environment (.env). Aborting.')
    process.exit(1)
  }

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user){
    user = await prisma.user.create({ data: { name, email, isVerified: true, role: 'admin' } })
    console.log('Created admin user:', email)
  } else {
    user = await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, role: 'admin', name } })
    console.log('Updated existing user to admin:', email)
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  try{ fs.writeFileSync('.admin_token', token) }catch(e){}
  console.log('\n=== Admin Token (copy and set cookie named `token`) ===')
  console.log(token)
  console.log('===============================================\n')
  console.log('To use this token in the browser:')
  console.log("1. Open DevTools → Application → Cookies for http://localhost:3000")
  console.log("2. Add cookie named 'token' with the above value and path '/'")
  console.log("3. Refresh the admin page (e.g., /admin/laws or /admin/minimum-wages).")
  
  if (process.env.CREATE_SAMPLE_LAW === '1'){
    try{
      console.log('\nCreating a demo Law entry via admin API...')
      // small delay in case dev server is still warming up
      await new Promise(r => setTimeout(r, 800))
      const res = await fetch('http://localhost:3000/api/admin/law/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': `token=${token}` },
        body: JSON.stringify({ title: 'Seeded Demo Law', content: 'This is a demo law created for admin flow testing.', state: 'Demo', effectiveDate: new Date().toISOString() })
      })
      const status = res.status
      const text = await res.text()
      let parsed = null
      try{ parsed = JSON.parse(text) }catch(e){}
      if (!res.ok) {
        console.warn('Demo law creation failed. HTTP', status)
        console.warn('Response body:', text)
      } else {
        console.log('Demo law created:', parsed?.law?.title || text)
      }
    }catch(e){
      console.warn('Failed to call admin API:', e.message || e)
    }
  }

  if (process.env.CREATE_SAMPLE_WAGE === '1'){
    try{
      console.log('\nCreating a demo MinimumWage entry via admin API...')
      await new Promise(r => setTimeout(r, 800))
      const res = await fetch('http://localhost:3000/api/admin/minimum-wage/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': `token=${token}` },
        body: JSON.stringify({ state: 'Demo', effectiveDate: new Date().toISOString(), wageJson: { basic: 10000, hra: 2000 } })
      })
      const status = res.status
      const text = await res.text()
      let parsed = null
      try{ parsed = JSON.parse(text) }catch(e){}
      if (!res.ok) {
        console.warn('Demo wage creation failed. HTTP', status)
        console.warn('Response body:', text)
      } else {
        console.log('Demo wage created:', parsed?.minimumWage?.id || text)
      }
    }catch(e){
      console.warn('Failed to call wage admin API:', e.message || e)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
