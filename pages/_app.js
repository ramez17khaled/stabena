// pages/_app.js
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { LangProvider } from '../lib/LangContext'
import AuthModal from '../components/shared/AuthModal'
import { welcomeEmail } from '../lib/emails'
import { sendEmail } from '../lib/sendEmail'
import { Toaster } from 'react-hot-toast'
import '../styles/globals.css'

export const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)
export const useCart = () => useContext(CartContext)
export const CartContext = createContext({})

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authCallback, setAuthCallback] = useState(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single()
        setProfile(data)
        // Email de bienvenue à la première inscription
        if (event === 'SIGNED_IN' && data && !data.welcome_sent) {
          try {
            const lang = data.lang || 'fr'
            const name = data.first_name || data.full_name || 'cher client'
            const emailData = welcomeEmail(name, lang)
            const result = await sendEmail({ to: session.user.email, ...emailData })
            if (result.success) {
              await supabase.from('profiles').update({ welcome_sent: true }).eq('id', session.user.id)
            }
          } catch (e) { console.error('Welcome email error:', e) }
        }
      } else {
        setUser(null)
        setProfile(null)
        setCartCount(0)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (user) fetchCartCount() }, [user])

  const fetchCartCount = async () => {
    const { data } = await supabase.from('cart_items').select('quantity').eq('user_id', user.id)
    setCartCount(data?.reduce((sum, item) => sum + item.quantity, 0) || 0)
  }

  const requireAuth = (callback) => {
    if (user) { callback && callback(); return true }
    setAuthCallback(() => callback)
    setShowAuthModal(true)
    return false
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    if (authCallback) {
      setTimeout(() => { authCallback(); setAuthCallback(null) }, 800)
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <LangProvider>
      <AuthContext.Provider value={{ user, profile, isAdmin, loading, fetchCartCount, requireAuth }}>
        <CartContext.Provider value={{ cartCount, setCartCount, fetchCartCount }}>
          <Toaster position="top-right" toastOptions={{
            style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', borderRadius: '4px' }
          }} />
          {!loading && <Component {...pageProps} />}
          {showAuthModal && (
            <AuthModal
              onClose={() => setShowAuthModal(false)}
              onSuccess={handleAuthSuccess}
            />
          )}
        </CartContext.Provider>
      </AuthContext.Provider>
    </LangProvider>
  )
}

export default MyApp
