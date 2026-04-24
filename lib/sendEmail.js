// lib/sendEmail.js
import { supabase } from './supabase'

export const sendEmail = async ({ to, subject, html, type }) => {
  try {
    const headers = { 'Content-Type': 'application/json' }

    if (type !== 'contact') {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
    }

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers,
      body: JSON.stringify({ to, subject, html, type }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return { success: true }
  } catch (error) {
    console.error('sendEmail error:', error)
    return { success: false, error: error.message }
  }
}
