// pages/cart.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/shared/Navbar'
import { getCart, removeFromCart, createOrder, markDiscountCodeUsed, supabase } from '../lib/supabase'
import { orderConfirmationEmail } from '../lib/emails'
import { sendEmail } from '../lib/sendEmail'
import { useAuth, useCart } from './_app'
import { useLang } from '../lib/LangContext'
import { Trash2, Plus, Minus, ArrowRight, X, CheckCircle, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { user, requireAuth } = useAuth()
  const { fetchCartCount } = useCart()
  const { lang, isRTL } = useLang()
  const router = useRouter()
  const ar = lang === 'ar'
  const arabicFont = ar ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Checkout modal state
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState({ name: '', street: '', city: '', zip: '', country: '' })
  const [ordering, setOrdering] = useState(false)
  const [orderDone, setOrderDone] = useState(false)

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null) // { code, discountPercent, minOrderAmount }
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  useEffect(() => {
    if (!user) { requireAuth(); setLoading(false); return }
    loadCart()
  }, [user])

  const loadCart = async () => {
    const { data } = await getCart(user.id)
    setItems(data || [])
    setLoading(false)
  }

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId)
    await loadCart()
    await fetchCartCount()
    toast.success(ar ? 'تمت إزالة المنتج' : 'Article retiré')
  }

  const handleQuantity = async (item, delta) => {
    const newQty = item.quantity + delta
    if (newQty <= 0) { handleRemove(item.id); return }
    await supabase.from('cart_items').update({ quantity: newQty }).eq('id', item.id)
    await loadCart()
    await fetchCartCount()
  }

  // Pricing
  const subtotal = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
  const couponApplied = coupon && subtotal >= coupon.minOrderAmount
  const discountAmount = couponApplied ? parseFloat((subtotal * coupon.discountPercent / 100).toFixed(2)) : 0
  const subtotalAfterDiscount = subtotal - discountAmount
  const shipping = subtotal >= 80 ? 0 : 4.99
  const total = subtotalAfterDiscount + shipping

  const openCheckout = () => {
    setStep(1)
    setOrderDone(false)
    setCheckoutOpen(true)
  }

  const handleAddressNext = (e) => {
    e.preventDefault()
    if (!address.name || !address.street || !address.city) {
      toast.error(ar ? 'يرجى ملء جميع الحقول' : 'Remplissez tous les champs')
      return
    }
    setStep(2)
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ code: couponInput }),
      })
      const data = await res.json()
      if (data.valid) {
        if (subtotal < data.minOrderAmount) {
          setCouponError(ar
            ? `يتطلب هذا الكود طلباً بقيمة $${data.minOrderAmount} على الأقل`
            : `Ce code nécessite une commande d'au moins $${data.minOrderAmount}`)
          setCoupon(null)
        } else {
          setCoupon(data)
          toast.success(ar ? `تم تطبيق الخصم ${data.discountPercent}% 🎉` : `Réduction de ${data.discountPercent}% appliquée 🎉`)
        }
      } else {
        setCouponError(ar ? 'كود غير صالح أو منتهي الصلاحية' : 'Code invalide ou expiré')
        setCoupon(null)
      }
    } catch {
      setCouponError(ar ? 'خطأ في التحقق' : 'Erreur de vérification')
    }
    setCouponLoading(false)
  }

  const removeCoupon = () => {
    setCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  const handleConfirmOrder = async () => {
    setOrdering(true)
    try {
      const { data: order, error } = await createOrder(user.id, items, address, total, 'cash')
      if (error) throw error

      // Mark coupon as used
      if (coupon) await markDiscountCodeUsed(coupon.code)

      await fetchCartCount()
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        const emailData = orderConfirmationEmail(
          profile?.full_name || 'Client',
          order.id,
          items.map(i => ({ name: i.products.name, quantity: i.quantity, price: i.products.price })),
          total,
          profile?.lang || lang
        )
        await sendEmail({ to: user.email, ...emailData })
      } catch (e) { console.error('Email error:', e) }
      setOrderDone(true)
    } catch (e) {
      toast.error('Erreur: ' + e.message)
    }
    setOrdering(false)
  }

  const inputClass = "w-full px-4 py-3 border text-sm outline-none bg-transparent"
  const inputStyle = { borderColor: 'var(--color-border)', borderRadius: '8px', ...arabicFont }

  if (loading) return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse font-display text-2xl">{ar ? 'جاري التحميل...' : 'Chargement...'}</div>
      </div>
    </div>
  )

  if (!user) return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center h-96 text-center px-4">
        <div>
          <p className="font-display text-2xl mb-4" style={arabicFont}>
            {ar ? 'سجل دخولك لعرض السلة' : 'Connectez-vous pour voir votre panier'}
          </p>
          <button onClick={() => requireAuth()} className="text-sm px-6 py-3 text-white"
            style={{ background: 'var(--color-primary)', borderRadius: '8px', ...arabicFont }}>
            {ar ? 'تسجيل الدخول' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl mb-8" style={arabicFont}>
          {ar ? 'سلة التسوق' : 'Mon Panier'}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl mb-4" style={arabicFont}>
              {ar ? 'سلتك فارغة' : 'Votre panier est vide'}
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2 text-sm px-6 py-3 text-white"
              style={{ background: 'var(--color-primary)', borderRadius: '8px', ...arabicFont }}>
              {ar ? 'اكتشف منتجاتنا' : 'Découvrir nos produits'} <ArrowRight size={14} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Articles */}
            <div className="md:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-white border"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <img src={item.products.images?.[0] || 'https://picsum.photos/seed/p/200/300'}
                    alt={item.products.name}
                    className="w-24 h-32 object-cover" style={{ background: '#f5f2ee' }} />
                  <div className="flex-1">
                    <h3 className="font-medium" style={arabicFont}>{item.products.name}</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                      {item.size && `${ar ? 'المقاس' : 'Taille'}: ${item.size}`} {item.color && `• ${item.color}`}
                    </p>
                    <p className="font-medium mt-2">${item.products.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border" style={{ borderColor: 'var(--color-border)' }}>
                        <button onClick={() => handleQuantity(item, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-base transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => handleQuantity(item, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-base transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => handleRemove(item.id)}
                        className="hover:text-danger transition-colors"
                        style={{ color: 'var(--color-muted)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Récap */}
            <div className="space-y-4">
              <div className="bg-white border p-6 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-display text-xl mb-4" style={arabicFont}>
                  {ar ? 'ملخص الطلب' : 'Récapitulatif'}
                </h3>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted)', ...arabicFont }}>{ar ? 'المجموع الفرعي' : 'Sous-total'}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm" style={{ color: '#16a34a' }}>
                    <span style={arabicFont}>🎂 {ar ? `خصم ${coupon.discountPercent}%` : `Réduction ${coupon.discountPercent}%`}</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted)', ...arabicFont }}>{ar ? 'الشحن' : 'Livraison'}</span>
                  <span style={arabicFont}>{shipping === 0 ? (ar ? 'مجاني 🎁' : 'Offerte 🎁') : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-medium"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <span style={arabicFont}>{ar ? 'المجموع' : 'Total'}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button onClick={openCheckout}
                  className="w-full py-3 text-sm tracking-wider text-white mt-2 flex items-center justify-center gap-2"
                  style={{ background: 'var(--color-primary)', borderRadius: '8px', ...arabicFont }}>
                  {ar ? 'اطلب الآن' : 'Commander'} <ArrowRight size={14} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
                </button>
              </div>

              {/* Coupon */}
              <div className="bg-white border p-4" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={14} style={{ color: 'var(--color-accent)' }} />
                  <span className="text-xs tracking-widest uppercase font-medium" style={arabicFont}>
                    {ar ? 'كود الخصم' : 'Code promo'}
                  </span>
                </div>
                {coupon ? (
                  <div className="flex items-center justify-between text-sm p-2 rounded"
                    style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                    <span style={{ color: '#16a34a', ...arabicFont }}>
                      🎂 {coupon.code} (-{coupon.discountPercent}%)
                    </span>
                    <button onClick={removeCoupon} style={{ color: '#16a34a' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value); setCouponError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder={ar ? 'BDAY2026...' : 'BDAY2026...'}
                      className="flex-1 px-3 py-2 border text-sm outline-none bg-transparent font-mono"
                      style={{ borderColor: 'var(--color-border)', borderRadius: '6px' }}
                      dir="ltr"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3 py-2 text-sm text-white disabled:opacity-50"
                      style={{ background: 'var(--color-primary)', borderRadius: '6px', ...arabicFont }}>
                      {couponLoading ? '...' : (ar ? 'تطبيق' : 'OK')}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-danger)', ...arabicFont }}>
                    {couponError}
                  </p>
                )}
              </div>

              {subtotal < 80 && (
                <p className="text-xs text-center" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                  {ar
                    ? `أضف $${(80 - subtotal).toFixed(2)} للشحن المجاني!`
                    : `Plus que $${(80 - subtotal).toFixed(2)} pour la livraison offerte !`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Checkout Modal ──────────────────────────────────────────── */}
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8"
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            <div className="bg-white w-full max-w-md animate-fade-up"
              style={{ borderRadius: '16px', overflow: 'hidden' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  {step === 2 && !orderDone && (
                    <button onClick={() => setStep(1)}
                      className="text-xs px-2 py-1 border rounded"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', ...arabicFont }}>
                      ←
                    </button>
                  )}
                  <h2 className="font-display text-xl" style={arabicFont}>
                    {orderDone
                      ? (ar ? '✓ تم الطلب' : '✓ Commande placée')
                      : step === 1
                        ? (ar ? 'عنوان التوصيل' : 'Adresse de livraison')
                        : (ar ? 'تأكيد الطلب' : 'Confirmer la commande')}
                  </h2>
                </div>
                <button onClick={() => setCheckoutOpen(false)}>
                  <X size={20} style={{ color: 'var(--color-muted)' }} />
                </button>
              </div>

              {/* Step indicator */}
              {!orderDone && (
                <div className="flex px-6 pt-4 gap-2">
                  {[1, 2].map(n => (
                    <div key={n} className="flex-1 h-1 rounded-full transition-colors"
                      style={{ background: step >= n ? 'var(--color-primary)' : 'var(--color-border)' }} />
                  ))}
                </div>
              )}

              <div className="px-6 py-6">

                {/* ── STEP 1: Address ──────────────────────────────────── */}
                {step === 1 && (
                  <form onSubmit={handleAddressNext} className="space-y-4">
                    {[
                      { key: 'name', label: ar ? 'الاسم الكامل *' : 'Nom complet *', placeholder: ar ? 'محمد علي' : 'Marie Dupont' },
                      { key: 'street', label: ar ? 'العنوان *' : 'Adresse *', placeholder: ar ? 'شارع الحمرا 12' : '123 Rue de la Paix' },
                      { key: 'city', label: ar ? 'المدينة *' : 'Ville *', placeholder: ar ? 'بيروت' : 'Paris' },
                      { key: 'zip', label: ar ? 'الرمز البريدي' : 'Code postal', placeholder: ar ? '...' : '75001' },
                      { key: 'country', label: ar ? 'البلد' : 'Pays', placeholder: ar ? 'لبنان' : 'Liban' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs tracking-widest uppercase block mb-1"
                          style={{ color: 'var(--color-muted)', ...arabicFont }}>{label}</label>
                        <input type="text" placeholder={placeholder}
                          value={address[key]}
                          onChange={e => setAddress({ ...address, [key]: e.target.value })}
                          dir={isRTL ? 'rtl' : 'ltr'}
                          className={inputClass} style={inputStyle} />
                      </div>
                    ))}
                    <button type="submit"
                      className="w-full py-3 text-sm text-white mt-2 flex items-center justify-center gap-2"
                      style={{ background: 'var(--color-primary)', borderRadius: '8px', ...arabicFont }}>
                      {ar ? 'متابعة' : 'Continuer'} <ArrowRight size={14} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
                    </button>
                  </form>
                )}

                {/* ── STEP 2: Confirmation ─────────────────────────────── */}
                {step === 2 && !orderDone && (
                  <div className="space-y-5">
                    {/* Recap */}
                    <div className="px-4 py-3 text-sm space-y-1" style={{ background: '#f8f5f2', borderRadius: '8px' }}>
                      <div className="flex justify-between items-center">
                        <span style={{ color: 'var(--color-muted)', ...arabicFont }}>{ar ? 'المجموع الفرعي' : 'Sous-total'}</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {couponApplied && (
                        <div className="flex justify-between items-center" style={{ color: '#16a34a' }}>
                          <span style={arabicFont}>🎂 -{coupon.discountPercent}%</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-medium pt-1 border-t"
                        style={{ borderColor: '#e5ddd5' }}>
                        <span style={arabicFont}>{ar ? 'المجموع' : 'Total'}</span>
                        <span className="font-display text-lg">${total.toFixed(2)}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                        {address.name} • {address.city}
                      </p>
                    </div>

                    {/* Cash on delivery */}
                    <div className="flex items-start gap-4 p-4 border-2"
                      style={{ borderColor: 'var(--color-border)', borderRadius: '12px' }}>
                      <span style={{ fontSize: '28px' }}>💵</span>
                      <div>
                        <p className="font-medium" style={arabicFont}>
                          {ar ? 'الدفع عند التوصيل' : 'Paiement à la livraison'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                          {ar ? 'ستدفع نقداً عند استلام طلبك' : 'Vous paierez en espèces à la réception de votre commande'}
                        </p>
                      </div>
                    </div>

                    <button onClick={handleConfirmOrder} disabled={ordering}
                      className="w-full py-3 text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: 'var(--color-primary)', borderRadius: '8px', ...arabicFont }}>
                      {ordering
                        ? (ar ? 'جاري تأكيد الطلب...' : 'Confirmation en cours...')
                        : (ar ? 'تأكيد الطلب' : 'Confirmer la commande')}
                    </button>
                  </div>
                )}

                {/* ── Order confirmed ──────────────────────────────────── */}
                {orderDone && (
                  <div className="space-y-5 text-center">
                    <CheckCircle size={48} className="mx-auto" style={{ color: 'var(--color-success)' }} />
                    <div>
                      <p className="font-display text-xl mb-1" style={arabicFont}>
                        {ar ? 'تم تأكيد طلبك! 🎉' : 'Commande confirmée ! 🎉'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                        {ar
                          ? 'ستتلقى بريداً إلكترونياً للتأكيد وستدفع عند التوصيل.'
                          : 'Un email de confirmation vous a été envoyé. Vous paierez à la livraison.'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setCheckoutOpen(false); router.push('/orders') }}
                        className="flex-1 py-2.5 text-sm text-white"
                        style={{ background: 'var(--color-primary)', borderRadius: '8px', ...arabicFont }}>
                        {ar ? 'تتبع الطلب' : 'Mes commandes'}
                      </button>
                      <button onClick={() => setCheckoutOpen(false)}
                        className="flex-1 py-2.5 text-sm border"
                        style={{ borderColor: 'var(--color-border)', borderRadius: '8px', ...arabicFont }}>
                        {ar ? 'إغلاق' : 'Fermer'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
