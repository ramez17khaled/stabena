// pages/api/send-email.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, subject, html, type } = req.body
  if (!to || !subject || !html) return res.status(400).json({ error: 'Missing fields' })

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  if (type === 'contact') {
    // Contact form: only allowed to send to the configured support address
    if (to !== process.env.BREVO_SENDER_EMAIL) {
      return res.status(403).json({ error: 'Forbidden' })
    }
  } else {
    // Transactional emails: require a valid Supabase session
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    // Only allow sending to the authenticated user's own email
    if (to !== user.email) return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
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

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || JSON.stringify(data))
    return res.status(200).json({ success: true, id: data.messageId })
  } catch (error) {
    console.error('Email error:', error)
    return res.status(500).json({ error: error.message })
  }
}
