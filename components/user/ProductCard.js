// components/user/ProductCard.js
import Link from 'next/link'
import { useState } from 'react'
import { Heart, ShoppingBag } from 'lucide-react'
import { supabase, addToCart, toggleWishlist } from '../../lib/supabase'
import { useAuth, useCart } from '../../pages/_app'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { requireAuth } = useAuth()
  const { fetchCartCount } = useCart()
  const [wished, setWished] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    requireAuth(async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return
      setAdding(true)
      await addToCart(currentUser.id, product.id, 1)
      await fetchCartCount()
      toast.success('Ajouté au panier ✓')
      setAdding(false)
    })
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    requireAuth(async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return
      const { added } = await toggleWishlist(currentUser.id, product.id)
      setWished(added)
      toast.success(added ? 'Ajouté aux favoris ♡' : 'Retiré des favoris')
    })
  }

  const image = product.images?.[0] || 'https://picsum.photos/seed/product/600/800'
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100) : null

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: '#f5f2ee' }}>
        <img src={image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && (
            <span className="text-xs px-2 py-1 text-white font-medium"
              style={{ background: 'var(--color-danger)', borderRadius: '2px' }}>
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-xs px-2 py-1 text-white"
              style={{ background: 'var(--color-muted)', borderRadius: '2px' }}>
              Épuisé
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleWishlist}
            className="w-9 h-9 flex items-center justify-center bg-white shadow-sm hover:scale-110 transition-transform"
            style={{ borderRadius: '50%' }}>
            <Heart size={16} fill={wished ? 'currentColor' : 'none'}
              style={{ color: wished ? 'var(--color-danger)' : 'var(--color-primary)' }} />
          </button>
        </div>

        {product.stock > 0 && (
          <button onClick={handleAddToCart} disabled={adding}
            className="absolute bottom-0 left-0 right-0 py-3 text-sm text-white tracking-wider
              translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
            style={{ background: 'var(--color-primary)' }}>
            <ShoppingBag size={14} />
            {adding ? 'Ajout...' : 'Ajouter au panier'}
          </button>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--color-muted)' }}>
          {(product.product_categories || []).map(pc => pc.categories?.name).filter(Boolean).join(' · ')}
        </p>
        <h3 className="font-display text-lg leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-medium">{product.price.toFixed(2)} €</span>
          {product.compare_price && (
            <span className="text-sm line-through" style={{ color: 'var(--color-muted)' }}>
              {product.compare_price.toFixed(2)} €
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
