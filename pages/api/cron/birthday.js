// pages/api/cron/birthday.js
// Called daily at 8:00 AM via Vercel Cron (see vercel.json)
// Protected by CRON_SECRET environment variable
import { createClient } from '@supabase/supabase-js'
import { birthdayEmail } from '../../../lib/emails'

async function sendViaBrevo(to, subject, html) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'Stabena', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Brevo error')
  }
}

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const year = today.getFullYear()

  const { data: users, error } = await supabase.rpc('get_birthday_users', {
    p_month: month,
    p_day: day,
  })

  if (error) {
    console.error('Birthday query error:', error)
    return res.status(500).json({ error: error.message })
  }

  const results = []

  for (const user of users || []) {
    try {
      const birthYear = new Date(user.birthdate).getFullYear()
      const age = year - birthYear

      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
      const code = `BDAY${year}${suffix}`

      const expires = new Date(today)
      expires.setHours(23, 59, 59, 999)

      const { error: insertError } = await supabase.from('discount_codes').insert({
        code,
        user_id: user.id,
        discount_percent: age,
        min_order_amount: 80.00,
        expires_at: expires.toISOString(),
      })
      if (insertError) throw new Error(insertError.message)

      const name = user.first_name || user.full_name || 'cher client'
      const lang = user.lang || 'fr'
      const { subject, html } = birthdayEmail(name, age, age, code, lang)
      await sendViaBrevo(user.email, subject, html)

      await supabase
        .from('profiles')
        .update({ birthday_coupon_year: year })
        .eq('id', user.id)

      results.push({ email: user.email, code, age })
    } catch (e) {
      console.error(`Birthday failed for ${user.email}:`, e.message)
      results.push({ email: user.email, error: e.message })
    }
  }

  return res.status(200).json({ processed: results.length, results })
}
