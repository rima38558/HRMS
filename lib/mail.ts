import nodemailer from 'nodemailer'

export async function sendOtpEmail(to: string, code: string){
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (host && port && user && pass){
    const transporter = nodemailer.createTransport({ host, port, auth: { user, pass } })
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM || 'no-reply@example.com'}`,
      to,
      subject: 'Your verification OTP',
      text: `Your OTP code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your OTP code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    })
    console.log('OTP sent', info.messageId)
    return info
  }

  // Fallback
  console.log(`Send OTP ${code} to ${to} (SMTP not configured)`)
  return null
}

export async function sendChecklistEmail(to: string, serviceTitle: string, checklist: any[]){
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  const htmlList = checklist && checklist.length ? `<ul>${checklist.map((c:any)=>`<li>${c}</li>`).join('')}</ul>` : ''

  if (host && port && user && pass){
    const transporter = nodemailer.createTransport({ host, port, auth: { user, pass } })
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM || 'no-reply@example.com'}`,
      to,
      subject: `Checklist for ${serviceTitle}`,
      html: `<p>Please upload the following documents for ${serviceTitle}:</p>${htmlList}`
    })
    console.log('Checklist email sent', info.messageId)
    return info
  }
  console.log(`Checklist for ${serviceTitle} to ${to}:`, checklist)
  return null
}
