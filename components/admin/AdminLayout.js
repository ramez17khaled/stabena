// components/admin/AdminLayout.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../pages/_app'
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Store } from 'lucide-react'
import { signOut } from '../../lib/supabase'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Produits' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Commandes' },
  { href: '/admin/users', icon: Users, label: 'Clients' },
  { href: '/admin/categories', icon: Tag, label: 'Catégories' },
]

export default function AdminLayout({ children, title }) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error('Accès refusé')
      router.push('/')
    }
  }, [user, isAdmin, loading])

  if (loading || !isAdmin) return null

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside className="w-60 fixed top-0 left-0 h-full flex flex-col"
        style={{ background: 'var(--color-primary)', color: 'white' }}>
        <div className="p-6 border-b border-white border-opacity-10">
          <p className="font-display text-xl tracking-wider">Stabena</p>
          <p className="text-xs mt-1 opacity-50 tracking-widest uppercase">Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm rounded transition-all ${
                router.pathname === href
                  ? 'bg-white bg-opacity-10 text-white'
                  : 'text-white text-opacity-60 hover:text-white hover:bg-white hover:bg-opacity-5'
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white border-opacity-10 space-y-1">
          <Link href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm text-white text-opacity-60 hover:text-white transition-colors">
            <Store size={16} /> Voir la boutique
          </Link>
          <button onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white text-opacity-60 hover:text-white transition-colors w-full">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 min-h-screen">
        <header className="bg-white border-b px-8 py-4"
          style={{ borderColor: 'var(--color-border)' }}>
          <h1 className="font-display text-2xl">{title}</h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
