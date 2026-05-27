const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

async function run(){
  const outDir = path.join(process.cwd(), 'demo', 'screenshots')
  fs.mkdirSync(outDir, { recursive: true })
  const tokenFile = path.join(process.cwd(), '.admin_token')
  const token = fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile,'utf8').trim() : process.env.ADMIN_TOKEN
  if (!token) {
    console.error('No admin token found. Run `npm run create-admin` first or set ADMIN_TOKEN env var.')
    process.exit(1)
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:3000')
  // set cookie
  await page.context().addCookies([{ name: 'token', value: token, domain: 'localhost', path: '/' }])

  const pages = ['/admin/laws', '/admin/minimum-wages']
  for (const p of pages){
    const url = `http://localhost:3000${p}`
    await page.goto(url, { waitUntil: 'networkidle' })
    const safe = p.replace(/\//g,'').replace(/[^a-z0-9-_]/gi,'_') || 'index'
    const file = path.join(outDir, `${safe}.png`)
    await page.screenshot({ path: file, fullPage: true })
    console.log('Saved', file)
  }

  await browser.close()
}

run().catch(e=>{ console.error(e); process.exit(1) })
