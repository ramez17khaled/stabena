// pages/products/[slug].js
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/shared/Navbar'
import {
  getProductBySlug, addToCart, toggleWishlist,
  getProductReviews, getUserReview, upsertReview, hasUserPurchasedProduct
} from '../../lib/supabase'
import { useAuth, useCart } from '../_app'
import { useLang } from '../../lib/LangContext'
import { Heart, ShoppingBag, Truck, RotateCcw, Shield, Star } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Star display (read-only) ──────────────────────────────────────────────────
function StarDisplay({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
          style={{ color: '#f59e0b' }} />
      ))}
    </div>
  )
}

// ── Star input (interactive) ──────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110">
          <Star size={28}
            fill={(hover || value) >= i ? '#f59e0b' : 'none'}
            style={{ color: '#f59e0b' }} />
        </button>
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useAuth()
  const { fetchCartCount } = useCart()
  const { lang, isRTL } = useLang()
  const arabicFont = lang === 'ar' ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}
  const reviewRef = useRef(null)

  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [wished, setWished] = useState(false)
  const [adding, setAdding] = useState(false)

  // Reviews
  const [reviews, setReviews] = useState([])
  const [userReview, setUserReview] = useState(null)
  const [canReview, setCanReview] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!slug) return
    getProductBySlug(slug).then(({ data }) => {
      setProduct(data)
      if (data?.sizes?.length) setSelectedSize(data.sizes[0])
      if (data?.colors?.length) setSelectedColor(data.colors[0])
    })
  }, [slug])

  useEffect(() => {
    if (!product?.id) return
    getProductReviews(product.id).then(({ data }) => setReviews(data || []))
    if (user) {
      getUserReview(product.id, user.id).then(({ data }) => {
        if (data) { setUserReview(data); setRating(data.rating); setComment(data.comment || '') }
      })
      hasUserPurchasedProduct(user.id, product.id).then(setCanReview)
    }
  }, [product?.id, user])

  // Auto-scroll to review form if ?review=1 in URL
  useEffect(() => {
    if (router.query.review === '1' && reviewRef.current) {
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
    }
  }, [router.query.review, product])

  const handleAddToCart = async () => {
    if (!user) { toast.error(lang === 'ar' ? 'سجل دخولك للشراء' : 'Connectez-vous pour acheter'); return }
    if (product.sizes?.length && !selectedSize) { toast.error(lang === 'ar' ? 'اختر المقاس' : 'Choisissez une taille'); return }
    setAdding(true)
    await addToCart(user.id, product.id, 1, selectedSize, selectedColor)
    await fetchCartCount()
    toast.success(lang === 'ar' ? 'تمت الإضافة إلى السلة ✓' : 'Ajouté au panier ✓')
    setAdding(false)
  }

  const handleWishlist = async () => {
    if (!user) { toast.error(lang === 'ar' ? 'سجل دخولك أولاً' : "Connectez-vous d'abord"); return }
    const { added } = await toggleWishlist(user.id, product.id)
    setWished(added)
    toast.success(added
      ? (lang === 'ar' ? 'أضيف إلى المفضلة ♡' : 'Ajouté aux favoris ♡')
      : (lang === 'ar' ? 'أزيل من المفضلة' : 'Retiré des favoris'))
  }

  const handleSubmitReview = async () => {
    if (!rating) { toast.error(lang === 'ar' ? 'اختر تقييمًا' : 'Choisissez une note'); return }
    setSubmitting(true)
    const { data, error } = await upsertReview(product.id, user.id, rating, comment)
    setSubmitting(false)
    if (error) { toast.error('Erreur: ' + error.message); return }
    setUserReview(data)
    setReviews(prev => {
      const filtered = prev.filter(r => r.user_id !== user.id)
      return [{ ...data, profiles: { full_name: user.user_metadata?.full_name || '' } }, ...filtered]
    })
    toast.success(lang === 'ar' ? 'تم نشر تقييمك ✓' : 'Avis publié ✓')
  }

  if (!product) return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse font-display text-2xl">
          {lang === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
        </div>
      </div>
    </div>
  )

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100) : null

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="text-sm mb-8" style={{ color: 'var(--color-muted)', ...arabicFont }}>
          <span className="hover:text-accent cursor-pointer" onClick={() => router.push('/')}>
            {lang === 'ar' ? 'الرئيسية' : 'Accueil'}
          </span>
          <span className="mx-2">/</span>
          <span className="hover:text-accent cursor-pointer" onClick={() => router.push('/products')}>
            {lang === 'ar' ? 'المنتجات' : 'Produits'}
          </span>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: '#f5f2ee' }}>
              <img src={product.images?.[selectedImage] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}
                alt={product.name} className="w-full h-full object-cover" />
              {discount && (
                <span className="absolute top-4 left-4 text-xs px-2 py-1 text-white"
                  style={{ background: 'var(--color-danger)' }}>
                  -{discount}%
                </span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className="w-20 h-24 overflow-hidden border-2 transition-all"
                    style={{ borderColor: i === selectedImage ? 'var(--color-primary)' : 'transparent' }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {(product.product_categories || []).map(pc => pc.categories?.name).filter(Boolean).map(name => (
                  <span key={name} className="text-xs tracking-widest uppercase"
                    style={{ color: 'var(--color-muted)', ...arabicFont }}>{name}</span>
                ))}
              </div>
              <h1 className="font-display text-4xl mb-3" style={arabicFont}>{product.name}</h1>

              {/* Rating summary */}
              {reviews.length > 0 && (
                <button onClick={() => reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="flex items-center gap-2 mb-3 hover:opacity-70 transition-opacity">
                  <StarDisplay rating={avgRating} size={14} />
                  <span className="text-sm" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                    {avgRating.toFixed(1)} ({reviews.length} {lang === 'ar' ? 'تقييم' : 'avis'})
                  </span>
                </button>
              )}

              <div className="flex items-center gap-3">
                <span className="text-2xl font-medium">{product.price.toFixed(2)} €</span>
                {product.compare_price && (
                  <span className="text-lg line-through" style={{ color: 'var(--color-muted)' }}>
                    {product.compare_price.toFixed(2)} €
                  </span>
                )}
              </div>
            </div>

            <p style={{ color: 'var(--color-muted)', lineHeight: 1.8, ...arabicFont }}>{product.description}</p>

            {/* Couleurs */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3" style={arabicFont}>
                  {lang === 'ar' ? 'اللون' : 'Couleur'} : <span style={{ color: 'var(--color-muted)' }}>{selectedColor}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className="px-3 py-1 text-sm border transition-all"
                      style={{
                        borderColor: selectedColor === color ? 'var(--color-primary)' : 'var(--color-border)',
                        fontWeight: selectedColor === color ? '500' : '400',
                        ...arabicFont
                      }}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tailles */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3" style={arabicFont}>
                  {lang === 'ar' ? 'المقاس' : 'Taille'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className="w-12 h-12 text-sm border transition-all"
                      style={{
                        borderColor: selectedSize === size ? 'var(--color-primary)' : 'var(--color-border)',
                        background: selectedSize === size ? 'var(--color-primary)' : 'transparent',
                        color: selectedSize === size ? 'white' : 'var(--color-primary)'
                      }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <p className="text-sm" style={{ color: product.stock > 5 ? 'var(--color-success)' : 'var(--color-danger)', ...arabicFont }}>
              {product.stock === 0
                ? (lang === 'ar' ? '✗ نفد المخزون' : '✗ Épuisé')
                : product.stock <= 5
                  ? (lang === 'ar' ? `⚠ باقي ${product.stock} فقط` : `⚠ Plus que ${product.stock} en stock`)
                  : (lang === 'ar' ? '✓ متوفر' : '✓ En stock')}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
                className="flex-1 py-4 text-sm tracking-wider text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                style={{ background: 'var(--color-primary)', ...arabicFont }}>
                <ShoppingBag size={16} />
                {adding
                  ? (lang === 'ar' ? 'جاري الإضافة...' : 'Ajout en cours...')
                  : product.stock === 0
                    ? (lang === 'ar' ? 'نفد المخزون' : 'Épuisé')
                    : (lang === 'ar' ? 'أضف إلى السلة' : 'Ajouter au panier')}
              </button>
              <button onClick={handleWishlist}
                className="w-14 border flex items-center justify-center transition-colors hover:border-primary"
                style={{ borderColor: 'var(--color-border)' }}>
                <Heart size={18} fill={wished ? 'currentColor' : 'none'}
                  style={{ color: wished ? 'var(--color-danger)' : 'var(--color-primary)' }} />
              </button>
            </div>

            {/* Services */}
            <div className="border-t pt-6 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              {[
                { icon: Truck, text: lang === 'ar' ? 'شحن مجاني من 80€' : 'Livraison offerte dès 80€' },
                { icon: RotateCcw, text: lang === 'ar' ? 'إرجاع مجاني خلال 30 يوماً' : 'Retours gratuits sous 30 jours' },
                { icon: Shield, text: lang === 'ar' ? 'دفع آمن 100%' : 'Paiement 100% sécurisé' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                  <Icon size={16} style={{ color: 'var(--color-accent)' }} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews Section ─────────────────────────────────────────────── */}
        <div ref={reviewRef} className="mt-20 pt-12 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="max-w-2xl">

            {/* Header + average */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl" style={arabicFont}>
                  {lang === 'ar' ? 'آراء العملاء' : 'Avis clients'}
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-3 mt-2">
                    <StarDisplay rating={avgRating} size={18} />
                    <span className="font-display text-2xl">{avgRating.toFixed(1)}</span>
                    <span className="text-sm" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                      ({reviews.length} {lang === 'ar' ? 'تقييم' : 'avis'})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Review form */}
            {user && canReview && (
              <div className="mb-10 p-6 border" style={{ borderColor: 'var(--color-border)', borderRadius: '8px' }}>
                <h3 className="font-medium mb-4" style={arabicFont}>
                  {userReview
                    ? (lang === 'ar' ? 'تعديل تقييمك' : 'Modifier votre avis')
                    : (lang === 'ar' ? 'لاحظ تقييمك' : 'Votre avis')}
                </h3>
                <div className="space-y-4">
                  <StarInput value={rating} onChange={setRating} />
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={lang === 'ar' ? 'شارك تجربتك (اختياري)...' : 'Partagez votre expérience (optionnel)...'}
                    rows={3}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className="w-full px-4 py-3 text-sm border outline-none bg-transparent resize-none"
                    style={{ borderColor: 'var(--color-border)', borderRadius: '6px', ...arabicFont }}
                  />
                  <button onClick={handleSubmitReview} disabled={submitting || !rating}
                    className="px-6 py-2.5 text-sm text-white disabled:opacity-50 transition-opacity"
                    style={{ background: 'var(--color-primary)', borderRadius: '50px', ...arabicFont }}>
                    {submitting
                      ? (lang === 'ar' ? 'جاري النشر...' : 'Publication...')
                      : (lang === 'ar' ? 'نشر التقييم' : "Publier l'avis")}
                  </button>
                </div>
              </div>
            )}

            {/* Not purchased notice */}
            {user && !canReview && (
              <div className="mb-8 px-4 py-3 text-sm" style={{ background: '#f8f5f2', borderRadius: '6px', color: 'var(--color-muted)', ...arabicFont }}>
                {lang === 'ar'
                  ? '💡 يمكنك تقييم هذا المنتج بعد شرائه.'
                  : '💡 Vous pourrez laisser un avis après avoir acheté ce produit.'}
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                {lang === 'ar' ? 'لا توجد تقييمات بعد. كن أول من يقيّم!' : "Aucun avis pour l'instant. Soyez le premier !"}
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm" style={arabicFont}>
                          {review.profiles?.full_name || (lang === 'ar' ? 'عميل' : 'Client')}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          {new Date(review.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'fr-FR')}
                        </p>
                      </div>
                      <StarDisplay rating={review.rating} size={14} />
                    </div>
                    {review.comment && (
                      <p className="text-sm mt-2" style={{ color: 'var(--color-muted)', lineHeight: 1.7, ...arabicFont }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
