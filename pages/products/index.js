// pages/products/index.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/shared/Navbar'
import ProductCard from '../../components/user/ProductCard'
import { getProducts, getCategories } from '../../lib/supabase'
import { useLang } from '../../lib/LangContext'
import { SlidersHorizontal, X } from 'lucide-react'

export default function ProductsPage() {
  const router = useRouter()
  const { lang, isRTL } = useLang()
  const arabicFont = lang === 'ar' ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}

  const { categories: catsParam, search, sale, sort } = router.query
  const activeCats = catsParam ? catsParam.split(',').filter(Boolean) : []

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState([])
  const [priceMax, setPriceMax] = useState(500)

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    getProducts({ categories: activeCats, search, limit: 100 }).then(({ data }) => {
      let filtered = data || []
      if (sale === 'true') filtered = filtered.filter(p => p.compare_price)
      if (selectedSizes.length) filtered = filtered.filter(p =>
        selectedSizes.some(s => p.sizes?.includes(s)))
      filtered = filtered.filter(p => p.price <= priceMax)
      if (sort === 'new') filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
      if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
      setProducts(filtered)
      setLoading(false)
    })
  }, [catsParam, search, sale, sort, selectedSizes, priceMax])

  const toggleCategory = (slug) => {
    const updated = activeCats.includes(slug)
      ? activeCats.filter(s => s !== slug)
      : [...activeCats, slug]
    const query = { ...router.query }
    if (updated.length > 0) query.categories = updated.join(',')
    else delete query.categories
    router.push({ query })
  }

  const clearCategories = () => {
    const query = { ...router.query }
    delete query.categories
    router.push({ query })
  }

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38']

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const activeFilterNames = activeCats
    .map(slug => categories.find(c => c.slug === slug)?.name).filter(Boolean)

  const title = search ? `"${search}"` : lang === 'ar' ? 'جميع المنتجات' : 'Tous les produits'

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl" style={arabicFont}>{title}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)', ...arabicFont }}>
              {products.length} {lang === 'ar' ? 'منتج' : `article${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sort || ''}
              onChange={e => router.push({ query: { ...router.query, sort: e.target.value } })}
              className="text-sm border px-3 py-2 bg-transparent outline-none cursor-pointer"
              style={{ borderColor: 'var(--color-border)', ...arabicFont }}>
              <option value="">{lang === 'ar' ? 'الأكثر صلة' : 'Pertinence'}</option>
              <option value="new">{lang === 'ar' ? 'الأحدث' : 'Nouveautés'}</option>
              <option value="price-asc">{lang === 'ar' ? 'السعر: الأقل' : 'Prix croissant'}</option>
              <option value="price-desc">{lang === 'ar' ? 'السعر: الأعلى' : 'Prix décroissant'}</option>
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 text-sm px-4 py-2 border transition-colors hover:bg-primary hover:text-white"
              style={{ borderColor: 'var(--color-primary)', ...arabicFont }}>
              <SlidersHorizontal size={14} />
              {lang === 'ar' ? 'تصفية' : 'Filtres'}
              {activeCats.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs text-white rounded-full"
                  style={{ background: 'var(--color-accent)' }}>
                  {activeCats.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterNames.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilterNames.map((name, i) => (
              <span key={activeCats[i]}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs text-white"
                style={{ background: 'var(--color-primary)', borderRadius: '50px', ...arabicFont }}>
                {name}
                <button onClick={() => toggleCategory(activeCats[i])} className="ml-1 hover:opacity-70">
                  <X size={11} />
                </button>
              </span>
            ))}
            <button onClick={clearCategories}
              className="text-xs px-3 py-1 border hover:bg-primary hover:text-white transition-colors"
              style={{ borderColor: 'var(--color-border)', borderRadius: '50px', ...arabicFont }}>
              {lang === 'ar' ? 'مسح الكل' : 'Tout effacer'}
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filters sidebar */}
          {filtersOpen && (
            <aside className="w-64 shrink-0 animate-fade-in">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium" style={arabicFont}>
                    {lang === 'ar' ? 'تصفية' : 'Filtres'}
                  </h3>
                  <button onClick={() => setFiltersOpen(false)}>
                    <X size={16} style={{ color: 'var(--color-muted)' }} />
                  </button>
                </div>

                {/* Catégories — multi-select checkboxes */}
                <div className="mb-8">
                  <h4 className="text-xs tracking-widest uppercase mb-3 font-medium" style={arabicFont}>
                    {lang === 'ar' ? 'الفئة' : 'Catégorie'}
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={clearCategories}
                      className="flex items-center gap-2 text-sm w-full text-left"
                      style={{ color: activeCats.length === 0 ? 'var(--color-primary)' : 'var(--color-muted)', ...arabicFont }}>
                      <span className={`w-4 h-4 border flex items-center justify-center shrink-0`}
                        style={{
                          borderColor: activeCats.length === 0 ? 'var(--color-primary)' : 'var(--color-border)',
                          background: activeCats.length === 0 ? 'var(--color-primary)' : 'transparent',
                        }}>
                        {activeCats.length === 0 && <span className="text-white text-xs">✓</span>}
                      </span>
                      {lang === 'ar' ? 'الكل' : 'Toutes'}
                    </button>
                    {categories.map(cat => {
                      const isActive = activeCats.includes(cat.slug)
                      return (
                        <button key={cat.id}
                          onClick={() => toggleCategory(cat.slug)}
                          className="flex items-center gap-2 text-sm w-full text-left transition-colors"
                          style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted)', ...arabicFont }}>
                          <span className="w-4 h-4 border flex items-center justify-center shrink-0"
                            style={{
                              borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                              background: isActive ? 'var(--color-primary)' : 'transparent',
                            }}>
                            {isActive && <span className="text-white text-xs">✓</span>}
                          </span>
                          {cat.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tailles */}
                <div className="mb-8">
                  <h4 className="text-xs tracking-widest uppercase mb-3 font-medium" style={arabicFont}>
                    {lang === 'ar' ? 'المقاس' : 'Taille'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(size => (
                      <button key={size} onClick={() => toggleSize(size)}
                        className="w-10 h-10 text-xs border transition-colors"
                        style={{
                          borderColor: selectedSizes.includes(size) ? 'var(--color-primary)' : 'var(--color-border)',
                          background: selectedSizes.includes(size) ? 'var(--color-primary)' : 'transparent',
                          color: selectedSizes.includes(size) ? 'white' : 'var(--color-primary)'
                        }}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prix max */}
                <div className="mb-8">
                  <h4 className="text-xs tracking-widest uppercase mb-3 font-medium" style={arabicFont}>
                    {lang === 'ar' ? `الحد الأقصى: ${priceMax}$` : `Prix max : ${priceMax} $`}
                  </h4>
                  <input type="range" min="20" max="500" step="10" value={priceMax}
                    onChange={e => setPriceMax(Number(e.target.value))}
                    className="w-full" />
                </div>
              </div>
            </aside>
          )}

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="rounded" style={{ aspectRatio: '3/4', background: 'var(--color-border)' }} />
                    <div className="mt-3 h-4 rounded w-2/3" style={{ background: 'var(--color-border)' }} />
                    <div className="mt-2 h-4 rounded w-1/3" style={{ background: 'var(--color-border)' }} />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display text-2xl mb-2" style={arabicFont}>
                  {lang === 'ar' ? 'لا توجد منتجات' : 'Aucun produit trouvé'}
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                  {lang === 'ar' ? 'جرب فلاتر أخرى' : "Essayez d'autres filtres"}
                </p>
                {activeCats.length > 0 && (
                  <button onClick={clearCategories}
                    className="text-sm px-6 py-2 text-white"
                    style={{ background: 'var(--color-primary)', borderRadius: '50px', ...arabicFont }}>
                    {lang === 'ar' ? 'مسح الفلاتر' : 'Effacer les filtres'}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
