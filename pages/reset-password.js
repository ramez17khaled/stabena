// pages/reset-password.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import { useLang } from '../lib/LangContext'
import toast from 'react-hot-toast'
import Navbar from '../components/shared/Navbar'

export default function ResetPassword() {
  const { lang, isRTL } = useLang()
  const ar = lang === 'ar'
  const f = (fr, arText) => ar ? arText : fr
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase injects the session from the URL hash after the user clicks the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error(f('Les mots de passe ne correspondent pas', 'كلمتا المرور غير متطابقتين'))
      return
    }
    if (password.length < 6) {
      toast.error(f('Mot de passe trop court (6 min)', 'كلمة المرور قصيرة جداً'))
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(f('Mot de passe mis à jour !', 'تم تحديث كلمة المرور!'))
      router.push('/')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', fontSize: '14px',
    background: '#f8f5f2', border: '1.5px solid #e0d8d0', borderRadius: '10px',
    color: '#2c3e50', outline: 'none', boxSizing: 'border-box',
    fontFamily: ar ? 'Arial, sans-serif' : 'inherit',
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <Head><title>{f('Nouveau mot de passe — Stabena', 'كلمة مرور جديدة — Stabena')}</title></Head>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '20px', padding: '40px 32px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img src="/logo.jpg" alt="Stabena" style={{ height: '48px', objectFit: 'contain', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '22px', color: '#2c3e50', marginBottom: '6px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
              {f('Nouveau mot de passe', 'كلمة مرور جديدة')}
            </h1>
            <p style={{ fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
              {f('Choisissez un mot de passe sécurisé', 'اختر كلمة مرور آمنة')}
            </p>
          </div>

          {!ready ? (
            <p style={{ textAlign: 'center', color: '#9a9085', fontSize: '14px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
              {f('Vérification du lien en cours...', 'جاري التحقق من الرابط...')}
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '5px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Nouveau mot de passe', 'كلمة المرور الجديدة')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} required minLength={6}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" style={inputStyle} dir="ltr" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', top: '50%', [isRTL ? 'left' : 'right']: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9085' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '5px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Confirmer le mot de passe', 'تأكيد كلمة المرور')}
                </label>
                <input type="password" required value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••" style={inputStyle} dir="ltr" />
              </div>
              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '13px', fontSize: '14px', color: 'white', border: 'none',
                  background: 'linear-gradient(135deg, #6a7fa0, #8a9bb5)', borderRadius: '10px',
                  cursor: 'pointer', opacity: loading ? 0.6 : 1,
                  fontFamily: ar ? 'Arial, sans-serif' : 'inherit', fontWeight: '500',
                }}>
                {loading ? f('Mise à jour...', 'جاري التحديث...') : f('Enregistrer le mot de passe', 'حفظ كلمة المرور')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
