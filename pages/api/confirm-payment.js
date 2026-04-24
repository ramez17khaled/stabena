// pages/api/confirm-payment.js
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { session_id, order_id } = req.query
  if (!session_id || !order_id) return res.status(400).json({ error: 'Missing params' })

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed', status: session.payment_status })
    }

    // Verify this Stripe session belongs to the claimed order
    if (session.metadata?.orderId !== order_id) {
      return res.status(400).json({ error: 'Order ID mismatch' })
    }

    // Use service role to bypass RLS for server-side update
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('payment_status', 'pending_payment')

    if (error) throw new Error(error.message)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return res.status(500).json({ error: error.message })
  }
}
