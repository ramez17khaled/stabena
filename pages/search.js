// pages/search.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/shared/Navbar'
import ProductCard from '../components/user/ProductCard'
import { getProducts } from '../lib/supabase'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()
  const { q } = router.query
  const [query, setQuery] = useState(q || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (q) { setQuery(q); doSearch(q) }
  }, [q])

  const doSearch = async (term) => {
    if (!term.trim()) return
    setLoading(true)
    setSearched(true)
    const { data } = await getProducts({ search: term, limit: 20 })
    setResults(data || [])
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl mb-8">Recherche</h1>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-12 max-w-xl">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-muted)' }} />
            <input type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full pl-11 pr-4 py-3 border text-sm outline-none bg-transparent focus:border-primary transition-colors"
              style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <button type="submit"
            className="px-6 py-3 text-sm text-white"
            style={{ background: 'var(--color-primary)' }}>
            Chercher
          </button>
        </form>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div style={{ aspectRatio: '3/4', background: 'var(--color-border)' }} />
                <div className="mt-3 h-4 rounded w-2/3" style={{ background: 'var(--color-border)' }} />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && (
          <>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
              {results.length} résultat{results.length !== 1 ? 's' : ''} pour « {q} »
            </p>
            {results.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-display text-2xl mb-2">Aucun résultat</p>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {results.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
