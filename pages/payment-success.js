// pages/payment-success.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/shared/Navbar'
import { useLang } from '../lib/LangContext'
import { useAuth } from './_app'
import { supabase } from '../lib/supabase'
import { orderConfirmationEmail } from '../lib/emails'
import { sendEmail } from '../lib/sendEmail'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function PaymentSuccess() {
  const router = useRouter()
  const { lang, isRTL } = useLang()
  const { user } = useAuth()
  const ar = lang === 'ar'
  const arabicFont = ar ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}

  const [status, setStatus] = useState('loading') // loading | success | error
  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    const { session_id, order_id } = router.query
    if (!session_id || !order_id) return

    setOrderId(order_id)

    fetch(`/api/confirm-payment?session_id=${session_id}&order_id=${order_id}`)
      .then(r => r.json())
      .then(async data => {
        if (data.success) {
          setStatus('success')
          // Send confirmation email
          try {
            if (user) {
              const { data: profile } = await supabase
                .from('profiles').select('*').eq('id', user.id).single()
              const { data: orderData } = await supabase
                .from('orders')
                .select('*, order_items(*, products(name, price))')
                .eq('id', order_id).single()
              if (profile && orderData) {
                const emailData = orderConfirmationEmail(
                  profile.full_name || 'Client',
                  order_id,
                  orderData.order_items?.map(i => ({
                    name: i.products?.name,
                    quantity: i.quantity,
                    price: i.price,
                  })) || [],
                  parseFloat(orderData.total_amount),
                  profile.lang || 'fr'
                )
                await sendEmail({ to: user.email, ...emailData })
              }
            }
          } catch (e) { console.error('Email error:', e) }
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [router.query, user])

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-96 px-6 py-20 text-center">

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader size={48} className="animate-spin mx-auto" style={{ color: 'var(--color-primary)' }} />
            <p className="font-display text-2xl" style={arabicFont}>
              {ar ? 'جاري التحقق من الدفع...' : 'Vérification du paiement...'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 max-w-md">
            <CheckCircle size={64} className="mx-auto" style={{ color: 'var(--color-success)' }} />
            <div>
              <h1 className="font-display text-4xl mb-3" style={arabicFont}>
                {ar ? 'تم الدفع بنجاح!' : 'Paiement réussi !'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                {ar
                  ? 'تم استلام دفعتك وتأكيد طلبك. ستصلك رسالة بريدية قريباً.'
                  : 'Votre paiement a été reçu et votre commande est confirmée. Un email de confirmation vous a été envoyé.'}
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/orders"
                className="px-6 py-3 text-sm text-white"
                style={{ background: 'var(--color-primary)', borderRadius: '50px', ...arabicFont }}>
                {ar ? 'تتبع طلبي' : 'Suivre ma commande'}
              </Link>
              <Link href="/products"
                className="px-6 py-3 text-sm border"
                style={{ borderColor: 'var(--color-border)', borderRadius: '50px', ...arabicFont }}>
                {ar ? 'متابعة التسوق' : 'Continuer mes achats'}
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 max-w-md">
            <XCircle size={64} className="mx-auto" style={{ color: 'var(--color-danger)' }} />
            <div>
              <h1 className="font-display text-3xl mb-3" style={arabicFont}>
                {ar ? 'حدث خطأ' : 'Une erreur est survenue'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                {ar
                  ? 'لم يتم التحقق من دفعتك. يرجى التواصل معنا.'
                  : 'Votre paiement n\'a pas pu être vérifié. Contactez-nous si vous avez été débité.'}
              </p>
            </div>
            <Link href="/contact"
              className="inline-block px-6 py-3 text-sm text-white"
              style={{ background: 'var(--color-primary)', borderRadius: '50px', ...arabicFont }}>
              {ar ? 'تواصل معنا' : 'Nous contacter'}
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
