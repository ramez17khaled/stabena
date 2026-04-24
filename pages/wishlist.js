// pages/wishlist.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/shared/Navbar'
import ProductCard from '../components/user/ProductCard'
import { getWishlist } from '../lib/supabase'
import { useAuth } from './_app'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    getWishlist(user.id).then(({ data }) => {
      setItems(data || [])
      setLoading(false)
    })
  }, [user])

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl mb-2">Mes Favoris</h1>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-muted)' }}>
          {items.length} article{items.length !== 1 ? 's' : ''} sauvegardé{items.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div style={{ aspectRatio: '3/4', background: 'var(--color-border)' }} />
                <div className="mt-3 h-4 rounded w-2/3" style={{ background: 'var(--color-border)' }} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={40} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
            <p className="font-display text-2xl mb-4">Aucun favori pour l'instant</p>
            <Link href="/products"
              className="inline-block text-sm px-6 py-3 text-white"
              style={{ background: 'var(--color-primary)' }}>
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map(item => (
              <ProductCard key={item.id} product={item.products} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
