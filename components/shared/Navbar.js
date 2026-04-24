// components/shared/Navbar.js
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ShoppingBag, Heart, User, Menu, X, Search, LogOut, Settings } from 'lucide-react'
import { useAuth, useCart } from '../../pages/_app'
import { useLang } from '../../lib/LangContext'
import { signOut } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const { t, lang, switchLang, isRTL } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    toast.success(t('toast_goodbye'))
    router.push('/')
  }

  const navLinks = [
    { label: t('nav_new'), href: '/products?sort=new' },
    { label: t('nav_women'), href: '/products?categories=femme' },
    { label: t('nav_men'), href: '/products?categories=homme' },
    { label: t('nav_accessories'), href: '/products?categories=accessoires' },
    { label: t('nav_sales'), href: '/products?sale=true' },
  ]

  return (
    <nav style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.jpg" alt="Stabena" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="text-sm tracking-wide hover:text-accent transition-colors"
                style={{ color: 'var(--color-muted)', fontFamily: lang === 'ar' ? 'Arial, sans-serif' : 'inherit' }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3">

            {/* Language switcher */}
            <button
              onClick={() => switchLang(lang === 'fr' ? 'ar' : 'fr')}
              className="text-xs font-bold px-2 py-1 border rounded transition-all hover:bg-primary hover:text-white"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', minWidth: '36px' }}>
              {lang === 'fr' ? 'ع' : 'FR'}
            </button>

            <Link href="/search" className="p-2 hover:text-accent transition-colors">
              <Search size={20} />
            </Link>

            {user ? (
              <>
                <Link href="/wishlist" className="p-2 hover:text-accent transition-colors">
                  <Heart size={20} />
                </Link>

                <Link href="/cart" className="p-2 hover:text-accent transition-colors relative">
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-medium"
                      style={{ background: 'var(--color-accent)', fontSize: '11px' }}>
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 hover:text-accent transition-colors">
                    <User size={20} />
                  </button>
                  {userMenuOpen && (
                    <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-12 w-48 shadow-lg border animate-fade-in`}
                      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '4px' }}>
                      <Link href="/account" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-base transition-colors"
                        style={{ fontFamily: lang === 'ar' ? 'Arial, sans-serif' : 'inherit' }}>
                        <User size={14} /> {t('nav_account')}
                      </Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-base transition-colors"
                        style={{ fontFamily: lang === 'ar' ? 'Arial, sans-serif' : 'inherit' }}>
                        <ShoppingBag size={14} /> {t('nav_orders')}
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-base transition-colors"
                          style={{ color: 'var(--color-accent)' }}>
                          <Settings size={14} /> {t('nav_admin')}
                        </Link>
                      )}
                      <hr style={{ borderColor: 'var(--color-border)' }} />
                      <button onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-3 text-sm w-full hover:bg-base transition-colors"
                        style={{ color: 'var(--color-danger)', fontFamily: lang === 'ar' ? 'Arial, sans-serif' : 'inherit' }}>
                        <LogOut size={14} /> {t('nav_logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login"
                className="text-sm px-4 py-2 border transition-colors hover:bg-primary hover:text-white"
                style={{ borderColor: 'var(--color-primary)', borderRadius: '2px', fontFamily: lang === 'ar' ? 'Arial, sans-serif' : 'inherit' }}>
                {t('nav_login')}
              </Link>
            )}

            {/* Mobile menu */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm tracking-wide"
                style={{ color: 'var(--color-muted)', fontFamily: lang === 'ar' ? 'Arial, sans-serif' : 'inherit' }}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
