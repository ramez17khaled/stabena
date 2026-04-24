// pages/index.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/shared/Navbar'
import ProductCard from '../components/user/ProductCard'
import { getProducts, getCategories } from '../lib/supabase'
import { useLang } from '../lib/LangContext'
import { useAuth } from './_app'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import PartnersCarousel from '../components/shared/PartnersCarousel'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const { t, lang, isRTL } = useLang()
  const { requireAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        getProducts({ featured: true, limit: 4 }),
        getCategories()
      ])
      setFeaturedProducts(prods || [])
      setCategories(cats || [])
    }
    load()
  }, [])

  // Ouvrir le modal si ?auth=true dans l'URL
  useEffect(() => {
    if (router.query.auth === 'true') {
      requireAuth()
      router.replace('/', undefined, { shallow: true })
    }
  }, [router.query])

  const arabicFont = { fontFamily: lang === 'ar' ? 'Arial, sans-serif' : 'inherit' }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center overflow-hidden" style={{ minHeight: '100vh' }}>
        <div className="absolute inset-0">
          <img src="/hero-bg.png" alt="Stabena" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, transparent 50%, rgba(240,235,230,0.92) 78%, rgba(240,235,230,1) 100%)'
          }} />
        </div>

        <div className="relative w-full flex flex-col items-center justify-end" style={{ minHeight: '100vh', paddingBottom: '8vh' }}>
          <div className="text-center px-6 animate-fade-up" style={{ maxWidth: '560px' }}>
            <p className="text-sm tracking-[0.35em] uppercase mb-3" style={{ color: '#8a9bb5', ...arabicFont }}>
              {t('hero_subtitle')}
            </p>
            <h1 className="font-display mb-3"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#3a4a5c', lineHeight: 1.25, ...arabicFont }}>
              {t('hero_title')} <span style={{ color: '#5a6a8a', fontStyle: lang === 'fr' ? 'italic' : 'normal' }}>Stabena</span>
            </h1>
            <p className="mb-8" style={{ color: '#7a8a9a', fontSize: '1rem', lineHeight: 1.75, fontWeight: 300, ...arabicFont }}>
              {t('hero_desc')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/products"
                className="px-9 py-3 text-sm tracking-widest text-white transition-all hover:opacity-90 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #6a7fa0, #8a9bb5)', borderRadius: '50px', boxShadow: '0 4px 20px rgba(90,106,138,0.35)', ...arabicFont }}>
                {t('hero_discover')}
              </Link>
              <Link href="/products?sale=true"
                className="px-9 py-3 text-sm tracking-widest transition-all hover:scale-105"
                style={{ border: '1.5px solid #8a9bb5', color: '#5a6a8a', borderRadius: '50px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', ...arabicFont }}>
                {t('hero_sales')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm tracking-widest uppercase mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>{t('home_categories_sub')}</p>
          <h2 className="font-display text-4xl" style={arabicFont}>{t('home_categories_title')}</h2>
        </div>
        <div className={`grid gap-6 grid-cols-1 ${
          categories.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
        }`}>
          {categories.map((cat) => {
            const img = cat.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
            return (
              <Link key={cat.id} href={`/products?categories=${cat.slug}`}
                className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                style={{ height: '320px', borderRadius: '16px' }}>
                <img src={img} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'rgba(90,106,138,0.35)' }} />
                <div className={`absolute bottom-6 ${isRTL ? 'right-6' : 'left-6'} text-white`}>
                  <h3 className="font-display text-3xl" style={arabicFont}>{cat.name}</h3>
                  <p className="text-sm mt-1 opacity-80 flex items-center gap-1" style={arabicFont}>
                    {t('home_see_collection')} <ArrowRight size={14} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Produits phares */}
      <section className="py-20" style={{ background: '#f8f5f2' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm tracking-widest uppercase mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>{t('home_featured_sub')}</p>
              <h2 className="font-display text-4xl" style={arabicFont}>{t('home_featured_title')}</h2>
            </div>
            <Link href="/products" className="text-sm flex items-center gap-1 hover:text-accent transition-colors" style={arabicFont}>
              {t('home_see_all')} <ArrowRight size={14} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Section parfums */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm tracking-widest uppercase mb-3" style={{ color: 'var(--color-muted)', ...arabicFont }}>{t('home_passion_sub')}</p>
            <h2 className="font-display text-5xl mb-6" style={arabicFont}>{t('home_passion_title')}</h2>
            <p className="mb-8" style={{ color: 'var(--color-muted)', lineHeight: 1.8, ...arabicFont }}>{t('home_passion_desc')}</p>
            <Link href="/products"
              className="inline-flex items-center gap-2 text-sm px-8 py-3 text-white"
              style={{ background: '#5a6a8a', borderRadius: '50px', ...arabicFont }}>
              {t('home_discover_perfumes')} <ArrowRight size={14} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            </Link>
          </div>
          <div className="relative h-96 overflow-hidden" style={{ borderRadius: '16px' }}>
            <img src="/hero-bg.png" alt="Parfums Stabena" className="w-full h-full object-cover object-center" />
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-20" style={{ background: '#5a6a8a', color: 'white' }}>
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="font-display text-4xl mb-4" style={arabicFont}>{t('home_banner_title')}</h2>
          <p className="opacity-70 mb-8" style={arabicFont}>{t('home_banner_desc')}</p>
          <Link href="/products"
            className="inline-block px-10 py-3 border border-white text-sm tracking-wider hover:bg-white hover:text-primary transition-all"
            style={{ borderRadius: '50px', ...arabicFont }}>
            {t('home_banner_btn')}
          </Link>
        </div>
      </section>

      {/* Partenaires */}
      <PartnersCarousel />

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <img src="/logo.jpg" alt="Stabena" className="h-14 w-auto object-contain mb-3" />
            <img src="https://scontent-cdg6-1.cdninstagram.com/v/t51.82787-19/504382857_17971662086913093_98522060138893124_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=103&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=amjrZOvSpdgQ7kNvwF2BeEl&_nc_oc=Adr1xECzsQxTcEyHF-98DHCAeWAgt7pYQRfZo0KvLZqts3G3E_YKJaR89oOn-DV5VAw&_nc_zt=24&_nc_ht=scontent-cdg6-1.cdninstagram.com&_nc_gid=LdZ1AqIhRXLMfQcUA2QzTw&_nc_ss=7b289&oh=00_Af0GNjFs4ZQyTYXKTPnPRhKYIB2JSFBB5jZ_i5BmAkFlCg&oe=69F11894" alt="Stabena" className="h-14 w-auto object-contain mb-3" />
            <p className="text-sm" style={{ color: 'var(--color-muted)', ...arabicFont }}>
              {lang === 'ar' ? 'عطور، جمال وموضة منذ 2024.' : 'Parfums, beauté & mode depuis 2024.'}
            </p>
          </div>
          <div>
            <h5 className="text-sm font-medium mb-3 tracking-wider uppercase" style={arabicFont}>{t('footer_collections')}</h5>
            {categories.map(cat => (
              <Link key={cat.id} href={`/products?categories=${cat.slug}`}
                className="block text-sm mb-2 hover:text-accent transition-colors"
                style={{ color: 'var(--color-muted)', ...arabicFont }}>
                {cat.name}
              </Link>
            ))}
          </div>
          <div>
            <h5 className="text-sm font-medium mb-3 tracking-wider uppercase" style={arabicFont}>{t('footer_service')}</h5>
            <Link href="/returns"
              className="block text-sm mb-2 hover:text-accent transition-colors"
              style={{ color: 'var(--color-muted)', ...arabicFont }}>
              {t('footer_returns')}
            </Link>

            <p className="text-sm mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>
              {t('footer_delivery')}
            </p>

            <p className="text-sm mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>
              {t('footer_faq')}
            </p>
            <Link href="/contact" className="block text-sm mb-2 hover:text-accent transition-colors"
              style={{ color: 'var(--color-muted)', ...arabicFont }}>
              {t('footer_contact')}
            </Link>
          </div>
          <div>
            <h5 className="text-sm font-medium mb-3 tracking-wider uppercase" style={arabicFont}>{t('footer_newsletter')}</h5>
            <p className="text-sm mb-3" style={{ color: 'var(--color-muted)', ...arabicFont }}>{t('footer_newsletter_desc')}</p>
            <div className="flex overflow-hidden" style={{ borderRadius: '50px', border: '1px solid var(--color-border)' }}>
              <input type="email" placeholder={lang === 'ar' ? 'بريدك@الإلكتروني' : 'votre@email.com'}
                className="flex-1 px-4 py-2 text-sm bg-transparent outline-none" dir={isRTL ? 'rtl' : 'ltr'} />
              <button className="px-4 py-2 text-sm text-white" style={{ background: '#5a6a8a' }}>
                {lang === 'ar' ? 'إرسال' : 'OK'}
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t text-center text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', ...arabicFont }}>
          {t('footer_rights')}
        </div>
      </footer>
    </div>
  )
}
