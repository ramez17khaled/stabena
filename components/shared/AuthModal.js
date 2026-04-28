// components/shared/AuthModal.js
import { useState } from 'react'
import { X, Phone, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { supabase, signIn } from '../../lib/supabase'
import { useLang } from '../../lib/LangContext'
import toast from 'react-hot-toast'

const COUNTRIES = [
  { code: 'LB', name: 'Liban', nameAr: 'لبنان', dial: '+961' },
  { code: 'FR', name: 'France', nameAr: 'فرنسا', dial: '+33' },
  { code: 'DZ', name: 'Algérie', nameAr: 'الجزائر', dial: '+213' },
  { code: 'MA', name: 'Maroc', nameAr: 'المغرب', dial: '+212' },
  { code: 'TN', name: 'Tunisie', nameAr: 'تونس', dial: '+216' },
  { code: 'EG', name: 'Égypte', nameAr: 'مصر', dial: '+20' },
  { code: 'SA', name: 'Arabie Saoudite', nameAr: 'السعودية', dial: '+966' },
  { code: 'AE', name: 'Émirats Arabes Unis', nameAr: 'الإمارات', dial: '+971' },
  { code: 'JO', name: 'Jordanie', nameAr: 'الأردن', dial: '+962' },
  { code: 'SY', name: 'Syrie', nameAr: 'سوريا', dial: '+963' },
  { code: 'IQ', name: 'Irak', nameAr: 'العراق', dial: '+964' },
  { code: 'KW', name: 'Koweït', nameAr: 'الكويت', dial: '+965' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر', dial: '+974' },
  { code: 'DE', name: 'Allemagne', nameAr: 'ألمانيا', dial: '+49' },
  { code: 'GB', name: 'Royaume-Uni', nameAr: 'المملكة المتحدة', dial: '+44' },
  { code: 'US', name: 'États-Unis', nameAr: 'الولايات المتحدة', dial: '+1' },
  { code: 'CA', name: 'Canada', nameAr: 'كندا', dial: '+1' },
  { code: 'BE', name: 'Belgique', nameAr: 'بلجيكا', dial: '+32' },
  { code: 'CH', name: 'Suisse', nameAr: 'سويسرا', dial: '+41' },
]

// Compute a deterministic internal email from a phone number
const phoneSyntheticEmail = (dialCode, phone) => {
  const digits = (dialCode + phone.replace(/^0/, '')).replace(/[^0-9]/g, '')
  return `stabena${digits}@stabena.com`
}

// Defined OUTSIDE to avoid focus loss on re-render
const PhoneRow = ({ dialVal, onDial, phoneVal, onPhone, ar, isRTL }) => {
  const style = {
    width: '100%', padding: '12px 16px', fontSize: '14px',
    background: '#f8f5f2', border: '1.5px solid #e0d8d0', borderRadius: '10px',
    color: '#2c3e50', outline: 'none', fontFamily: ar ? 'Arial, sans-serif' : 'inherit',
    textAlign: isRTL ? 'right' : 'left', boxSizing: 'border-box',
  }
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select value={dialVal} onChange={e => onDial(e.target.value)}
        style={{ ...style, width: '120px', flexShrink: 0 }}>
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.dial}>
            {c.dial} {ar ? c.nameAr : c.name}
          </option>
        ))}
      </select>
      <input type="tel" value={phoneVal} onChange={e => onPhone(e.target.value)}
        placeholder={ar ? 'الرقم' : 'Numéro'}
        style={{ ...style, flex: 1 }} dir="ltr" />
    </div>
  )
}

export default function AuthModal({ onClose, onSuccess }) {
  const { lang, isRTL } = useLang()
  const ar = lang === 'ar'
  const f = (fr, arText) => ar ? arText : fr

  // steps: choice | login-email | login-phone | register | register-otp | forgot-email | forgot-phone | forgot-phone-otp
  const [step, setStep] = useState('choice')
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  const [loading, setLoading] = useState(false)

  // Login email
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Login phone
  const [loginDialCode, setLoginDialCode] = useState('+961')
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // OTP verification
  const [otpCode, setOtpCode] = useState('')

  // Reset password (email)
  const [resetEmail, setResetEmail] = useState('')

  // Reset password (phone)
  const [resetDialCode, setResetDialCode] = useState('+961')
  const [resetPhone, setResetPhone] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')

  // Register form
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    dialCode: '+961', phone: '', birthdate: '', country: 'LB',
    addressType: 'description', addressDesc: '', street: '', city: '', zip: '',
  })
  const [pendingRegisterData, setPendingRegisterData] = useState(null)

  const inputStyle = {
    width: '100%', padding: '12px 16px', fontSize: '14px',
    background: '#f8f5f2', border: '1.5px solid #e0d8d0', borderRadius: '10px',
    color: '#2c3e50', outline: 'none', fontFamily: ar ? 'Arial, sans-serif' : 'inherit',
    textAlign: isRTL ? 'right' : 'left', boxSizing: 'border-box',
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#9a9085', marginBottom: '5px',
    fontFamily: ar ? 'Arial, sans-serif' : 'inherit',
  }
  const btnPrimary = {
    width: '100%', padding: '13px', fontSize: '14px', color: 'white', border: 'none',
    background: 'linear-gradient(135deg, #6a7fa0, #8a9bb5)', borderRadius: '10px',
    cursor: 'pointer', fontFamily: ar ? 'Arial, sans-serif' : 'inherit', fontWeight: '500',
  }
  const btnGreen = { ...btnPrimary, background: 'linear-gradient(135deg, #4a7c59, #5a9068)' }

  const PasswordInput = ({ value, onChange, show, onToggle, placeholder = '••••••••' }) => (
    <div style={{ position: 'relative' }}>
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder={placeholder} style={inputStyle} dir="ltr" />
      <button type="button" onClick={onToggle}
        style={{ position: 'absolute', top: '50%', [isRTL ? 'left' : 'right']: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9085' }}>
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )

  // ── LOGIN EMAIL ──
  const handleLoginEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) toast.error(f('Email ou mot de passe incorrect', 'بريد أو كلمة مرور خاطئة'))
    else { toast.success(f('Bienvenue !', 'أهلاً!')); onSuccess() }
    setLoading(false)
  }

  // ── LOGIN PHONE (phone + password) ──
  const handleLoginPhone = async (e) => {
    e.preventDefault()
    if (!loginPhone || !loginPassword) {
      toast.error(f('Remplissez tous les champs', 'يرجى ملء جميع الحقول')); return
    }
    setLoading(true)
    const syntheticEmail = phoneSyntheticEmail(loginDialCode, loginPhone)
    const { error } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password: loginPassword })
    if (error) toast.error(f('Numéro ou mot de passe incorrect', 'رقم الهاتف أو كلمة المرور خاطئة'))
    else { toast.success(f('Bienvenue !', 'أهلاً!')); onSuccess() }
    setLoading(false)
  }

  // ── FORGOT PASSWORD (email) ──
  const handleForgotEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })
    if (error) toast.error(error.message)
    else toast.success(f('Lien envoyé ! Vérifiez votre boîte mail.', 'تم إرسال الرابط! تحقق من بريدك.'))
    setLoading(false)
  }

  // ── FORGOT PASSWORD (phone) — send OTP ──
  const handleForgotPhoneSendOTP = async (e) => {
    e.preventDefault()
    if (!resetPhone) { toast.error(f('Entrez votre numéro', 'أدخل رقمك')); return }
    setLoading(true)
    const full = resetDialCode + resetPhone.replace(/^0/, '')
    const { error } = await supabase.auth.signInWithOtp({ phone: full })
    if (error) toast.error(error.message)
    else { toast.success(f('Code SMS envoyé !', 'تم إرسال الرمز!')); setStep('forgot-phone-otp') }
    setLoading(false)
  }

  // ── FORGOT PASSWORD (phone) — verify OTP and set new password ──
  const handleForgotPhoneVerify = async (e) => {
    e.preventDefault()
    if (resetNewPassword !== resetConfirmPassword) {
      toast.error(f('Mots de passe différents', 'كلمتا المرور غير متطابقتين')); return
    }
    if (resetNewPassword.length < 6) {
      toast.error(f('Mot de passe trop court (6 min)', 'كلمة المرور قصيرة جداً')); return
    }
    setLoading(true)
    const full = resetDialCode + resetPhone.replace(/^0/, '')
    const { error: otpError } = await supabase.auth.verifyOtp({ phone: full, token: otpCode, type: 'sms' })
    if (otpError) { toast.error(f('Code incorrect', 'رمز خاطئ')); setLoading(false); return }

    // Update password on the newly established session
    const { error: pwError } = await supabase.auth.updateUser({ password: resetNewPassword })
    if (pwError) { toast.error(pwError.message); setLoading(false); return }

    // Sign out and sign back in with the synthetic email + new password
    await supabase.auth.signOut()
    const syntheticEmail = phoneSyntheticEmail(resetDialCode, resetPhone)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password: resetNewPassword })
    if (signInError) {
      toast.success(f('Mot de passe mis à jour ! Reconnectez-vous.', 'تم تحديث كلمة المرور! سجل دخولك مجدداً.'))
      setStep('login-phone')
    } else {
      toast.success(f('Mot de passe mis à jour !', 'تم تحديث كلمة المرور!'))
      onSuccess()
    }
    setLoading(false)
  }

  // ── REGISTER ──
  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName) {
      toast.error(f('Prénom et nom requis', 'الاسم واللقب مطلوبان')); return
    }
    if (!form.email && !form.phone) {
      toast.error(f('Email ou téléphone requis', 'البريد الإلكتروني أو رقم الهاتف مطلوب')); return
    }
    if (form.password !== form.confirmPassword) {
      toast.error(f('Mots de passe différents', 'كلمتا المرور غير متطابقتين')); return
    }
    if (form.password.length < 6) {
      toast.error(f('Mot de passe trop court (6 min)', 'كلمة المرور قصيرة جداً')); return
    }

    setLoading(true)

    // Phone-only: send OTP first to verify, then create account
    if (!form.email && form.phone) {
      const full = form.dialCode + form.phone.replace(/^0/, '')
      const { error } = await supabase.auth.signInWithOtp({ phone: full })
      if (error) { toast.error(error.message); setLoading(false); return }
      setPendingRegisterData({ ...form })
      setOtpCode('')
      toast.success(f('Code SMS envoyé pour vérifier votre numéro', 'تم إرسال رمز SMS للتحقق من رقمك'))
      setStep('register-otp')
      setLoading(false)
      return
    }

    // Email registration
    const address = form.addressType === 'description'
      ? form.addressDesc
      : `${form.street}, ${form.city}${form.zip ? ' ' + form.zip : ''}`
    const country = COUNTRIES.find(c => c.code === form.country)
    const fullPhone = form.phone ? form.dialCode + form.phone.replace(/^0/, '') : ''

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.firstName} ${form.lastName}`,
          first_name: form.firstName, last_name: form.lastName,
          phone: fullPhone, birthdate: form.birthdate || null,
          country: country ? (ar ? country.nameAr : country.name) : form.country,
          address,
        }
      }
    })
    if (error) { toast.error(error.message); setLoading(false); return }

    if (data?.user) {
      await supabase.from('profiles').update({
        full_name: `${form.firstName} ${form.lastName}`,
        first_name: form.firstName, last_name: form.lastName,
        phone: fullPhone, birthdate: form.birthdate || null,
        country: country ? (ar ? country.nameAr : country.name) : form.country,
        address, lang,
      }).eq('id', data.user.id)
    }
    toast.success(f('Compte créé ! Vérifiez votre email.', 'تم إنشاء الحساب! تحقق من بريدك.'))
    onClose()
    setLoading(false)
  }

  // ── REGISTER OTP (phone-only: verify then create account) ──
  const handleVerifyRegisterOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    const d = pendingRegisterData
    const fullPhone = d.dialCode + d.phone.replace(/^0/, '')

    // 1. Verify OTP (proves phone ownership)
    const { error: otpErr } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otpCode, type: 'sms' })
    if (otpErr) { toast.error(f('Code incorrect', 'رمز خاطئ')); setLoading(false); return }

    // 2. Sign out the temporary OTP session
    await supabase.auth.signOut()

    // 3. Create real account via admin API (email+password with synthetic email)
    const syntheticEmail = phoneSyntheticEmail(d.dialCode, d.phone)
    const address = d.addressType === 'description'
      ? d.addressDesc
      : `${d.street}, ${d.city}${d.zip ? ' ' + d.zip : ''}`
    const country = COUNTRIES.find(c => c.code === d.country)

    const res = await fetch('/api/auth/phone-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syntheticEmail,
        password: d.password,
        phone: fullPhone,
        profile: {
          full_name: `${d.firstName} ${d.lastName}`,
          first_name: d.firstName, last_name: d.lastName,
          phone: fullPhone, birthdate: d.birthdate || null,
          country: country ? (ar ? country.nameAr : country.name) : d.country,
          address, lang,
        },
      }),
    })

    const result = await res.json()
    if (!res.ok) { toast.error(result.error); setLoading(false); return }

    // 4. Sign in with synthetic email + password
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password: d.password })
    if (signInErr) { toast.error(signInErr.message); setLoading(false); return }

    toast.success(f('Compte créé !', 'تم إنشاء الحساب!'))
    onSuccess()
    setLoading(false)
  }

  const backStep = () => {
    if (step === 'register-otp') return setStep('register')
    if (step === 'forgot-email') return setStep('login-email')
    if (step === 'forgot-phone') return setStep('login-phone')
    if (step === 'forgot-phone-otp') return setStep('forgot-phone')
    setStep('choice')
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          position: 'relative', width: '100%', maxWidth: '420px',
          background: 'white', borderRadius: '20px',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }}>

        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, background: 'white', zIndex: 10,
          padding: '20px 24px 16px', borderBottom: '1px solid #f0e8e0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {step !== 'choice' ? (
            <button onClick={backStep} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <ArrowLeft size={18} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            </button>
          ) : <div style={{ width: '26px' }} />}
          <img src="/logo.jpg" alt="Stabena" style={{ height: '44px', objectFit: 'contain' }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 28px' }}>

          {/* ── CHOICE ── */}
          {step === 'choice' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', color: '#2c3e50', marginBottom: '6px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Identifiez-vous', 'تسجيل الدخول أو إنشاء حساب')}
                </h2>
                <p style={{ fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Pour acheter, ajouter au panier ou aux favoris', 'للشراء أو إضافة منتجات إلى السلة والمفضلة')}
                </p>
              </div>

              {[
                { step: 'login-email', icon: <Mail size={18} color="#5a6a8a" />, bg: '#eef1f8', hover: '#8a9bb5', title: f('Continuer avec Email', 'المتابعة بالبريد الإلكتروني'), sub: f('Email + mot de passe', 'بريد إلكتروني وكلمة مرور') },
                { step: 'login-phone', icon: <Phone size={18} color="#4a7c59" />, bg: '#eef8f1', hover: '#4a7c59', title: f('Continuer avec Téléphone', 'المتابعة برقم الهاتف'), sub: f('Téléphone + mot de passe', 'رقم الهاتف وكلمة المرور') },
              ].map(item => (
                <button key={item.step} onClick={() => setStep(item.step)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', border: '2px solid #e0d8d0', borderRadius: '12px', background: 'white', cursor: 'pointer', marginBottom: '12px', textAlign: isRTL ? 'right' : 'left' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = item.hover}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#e0d8d0'}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>{item.title}</p>
                    <p style={{ fontSize: '12px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>{item.sub}</p>
                  </div>
                </button>
              ))}

              <div style={{ textAlign: 'center', marginBottom: '16px', position: 'relative' }}>
                <div style={{ borderTop: '1px solid #e0d8d0', position: 'absolute', top: '50%', left: 0, right: 0 }} />
                <span style={{ background: 'white', padding: '0 12px', position: 'relative', fontSize: '12px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Pas encore de compte ?', 'ليس لديك حساب؟')}
                </span>
              </div>
              <button onClick={() => setStep('register')} style={btnPrimary}>
                {f('Créer un compte', 'إنشاء حساب جديد')}
              </button>
            </div>
          )}

          {/* ── LOGIN EMAIL ── */}
          {step === 'login-email' && (
            <form onSubmit={handleLoginEmail}>
              <h2 style={{ fontSize: '20px', color: '#2c3e50', textAlign: 'center', marginBottom: '20px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Connexion par Email', 'الدخول بالبريد الإلكتروني')}
              </h2>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Adresse Email', 'البريد الإلكتروني')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="exemple@email.com" required style={inputStyle} dir="ltr" />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>{f('Mot de passe', 'كلمة المرور')}</label>
                <PasswordInput value={password} onChange={e => setPassword(e.target.value)} show={showPass} onToggle={() => setShowPass(!showPass)} />
              </div>
              <p style={{ textAlign: isRTL ? 'left' : 'right', marginBottom: '20px' }}>
                <button type="button" onClick={() => { setResetEmail(email); setStep('forgot-email') }}
                  style={{ background: 'none', border: 'none', color: '#9a9085', cursor: 'pointer', fontSize: '12px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Mot de passe oublié ?', 'نسيت كلمة المرور؟')}
                </button>
              </p>
              <button type="submit" disabled={loading} style={{ ...btnPrimary, marginBottom: '14px', opacity: loading ? 0.6 : 1 }}>
                {loading ? f('Connexion...', 'جاري الدخول...') : f('Se connecter', 'دخول')}
              </button>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Pas de compte ? ', 'ليس لديك حساب؟ ')}
                <button type="button" onClick={() => setStep('register')}
                  style={{ background: 'none', border: 'none', color: '#5a6a8a', cursor: 'pointer', fontWeight: '600', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f("S'inscrire", 'إنشاء حساب')}
                </button>
              </p>
            </form>
          )}

          {/* ── LOGIN PHONE ── */}
          {step === 'login-phone' && (
            <form onSubmit={handleLoginPhone}>
              <h2 style={{ fontSize: '20px', color: '#2c3e50', textAlign: 'center', marginBottom: '20px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Connexion par Téléphone', 'الدخول برقم الهاتف')}
              </h2>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Numéro de téléphone', 'رقم الهاتف')}</label>
                <PhoneRow dialVal={loginDialCode} onDial={setLoginDialCode} phoneVal={loginPhone} onPhone={setLoginPhone} ar={ar} isRTL={isRTL} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>{f('Mot de passe', 'كلمة المرور')}</label>
                <PasswordInput value={loginPassword} onChange={e => setLoginPassword(e.target.value)} show={showPass} onToggle={() => setShowPass(!showPass)} />
              </div>
              <p style={{ textAlign: isRTL ? 'left' : 'right', marginBottom: '20px' }}>
                <button type="button" onClick={() => { setResetDialCode(loginDialCode); setResetPhone(loginPhone); setStep('forgot-phone') }}
                  style={{ background: 'none', border: 'none', color: '#9a9085', cursor: 'pointer', fontSize: '12px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Mot de passe oublié ?', 'نسيت كلمة المرور؟')}
                </button>
              </p>
              <button type="submit" disabled={loading} style={{ ...btnGreen, marginBottom: '14px', opacity: loading ? 0.6 : 1 }}>
                {loading ? f('Connexion...', 'جاري الدخول...') : f('Se connecter', 'دخول')}
              </button>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Pas de compte ? ', 'ليس لديك حساب؟ ')}
                <button type="button" onClick={() => setStep('register')}
                  style={{ background: 'none', border: 'none', color: '#5a6a8a', cursor: 'pointer', fontWeight: '600', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f("S'inscrire", 'إنشاء حساب')}
                </button>
              </p>
            </form>
          )}

          {/* ── FORGOT PASSWORD (email) ── */}
          {step === 'forgot-email' && (
            <form onSubmit={handleForgotEmail}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eef1f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Mail size={24} color="#5a6a8a" />
                </div>
                <h2 style={{ fontSize: '20px', color: '#2c3e50', marginBottom: '6px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Mot de passe oublié', 'نسيت كلمة المرور')}
                </h2>
                <p style={{ fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Un lien vous sera envoyé par email', 'سيُرسل إليك رابط عبر البريد الإلكتروني')}
                </p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{f('Adresse Email', 'البريد الإلكتروني')}</label>
                <input type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                  placeholder="exemple@email.com" style={inputStyle} dir="ltr" />
              </div>
              <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
                {loading ? f('Envoi...', 'جاري الإرسال...') : f('Envoyer le lien', 'إرسال الرابط')}
              </button>
            </form>
          )}

          {/* ── FORGOT PASSWORD (phone — step 1: enter phone) ── */}
          {step === 'forgot-phone' && (
            <form onSubmit={handleForgotPhoneSendOTP}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eef8f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Phone size={24} color="#4a7c59" />
                </div>
                <h2 style={{ fontSize: '20px', color: '#2c3e50', marginBottom: '6px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Réinitialiser le mot de passe', 'إعادة تعيين كلمة المرور')}
                </h2>
                <p style={{ fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Vous recevrez un SMS pour vérifier votre identité', 'ستستلم رسالة SMS للتحقق من هويتك')}
                </p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{f('Numéro de téléphone', 'رقم الهاتف')}</label>
                <PhoneRow dialVal={resetDialCode} onDial={setResetDialCode} phoneVal={resetPhone} onPhone={setResetPhone} ar={ar} isRTL={isRTL} />
              </div>
              <button type="submit" disabled={loading} style={{ ...btnGreen, opacity: loading ? 0.6 : 1 }}>
                {loading ? f('Envoi...', 'جاري الإرسال...') : f('Envoyer le code SMS', 'إرسال رمز التحقق')}
              </button>
            </form>
          )}

          {/* ── FORGOT PASSWORD (phone — step 2: OTP + new password) ── */}
          {step === 'forgot-phone-otp' && (
            <form onSubmit={handleForgotPhoneVerify}>
              <h2 style={{ fontSize: '20px', color: '#2c3e50', textAlign: 'center', marginBottom: '20px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Nouveau mot de passe', 'كلمة مرور جديدة')}
              </h2>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Code SMS reçu', 'رمز SMS المستلَم')}</label>
                <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" maxLength={6} required
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '10px' }} dir="ltr" />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Nouveau mot de passe', 'كلمة المرور الجديدة')}</label>
                <PasswordInput value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)} show={showPass} onToggle={() => setShowPass(!showPass)} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{f('Confirmer', 'تأكيد')}</label>
                <PasswordInput value={resetConfirmPassword} onChange={e => setResetConfirmPassword(e.target.value)} show={showPass2} onToggle={() => setShowPass2(!showPass2)} />
              </div>
              <button type="submit" disabled={loading || otpCode.length !== 6}
                style={{ ...btnGreen, opacity: (loading || otpCode.length !== 6) ? 0.6 : 1 }}>
                {loading ? f('Mise à jour...', 'جاري التحديث...') : f('Enregistrer', 'حفظ')}
              </button>
            </form>
          )}

          {/* ── REGISTER ── */}
          {step === 'register' && (
            <form onSubmit={handleRegister}>
              <h2 style={{ fontSize: '20px', color: '#2c3e50', textAlign: 'center', marginBottom: '20px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Créer mon compte', 'إنشاء حساب')}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>{f('Prénom *', 'الاسم *')}</label>
                  <input type="text" required value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    placeholder={f('Marie', 'محمد')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{f('Nom *', 'اللقب *')}</label>
                  <input type="text" required value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    placeholder={f('Dupont', 'الأحمد')} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>
                  {f('Email', 'البريد الإلكتروني')}
                  <span style={{ color: '#b0a898', marginLeft: '4px', textTransform: 'none', fontSize: '11px' }}>
                    {f('(optionnel si téléphone renseigné)', '(اختياري إذا أدخلت رقم الهاتف)')}
                  </span>
                </label>
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="exemple@email.com" style={inputStyle} dir="ltr" />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>
                  {f('Téléphone', 'رقم الهاتف')}
                  <span style={{ color: '#b0a898', marginLeft: '4px', textTransform: 'none', fontSize: '11px' }}>
                    {f('(optionnel si email renseigné)', '(اختياري إذا أدخلت البريد الإلكتروني)')}
                  </span>
                </label>
                <PhoneRow dialVal={form.dialCode} onDial={v => setForm({ ...form, dialCode: v })}
                  phoneVal={form.phone} onPhone={v => setForm({ ...form, phone: v })} ar={ar} isRTL={isRTL} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Mot de passe * (6 min.)', 'كلمة المرور * (6 أحرف على الأقل)')}</label>
                <PasswordInput value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} show={showPass} onToggle={() => setShowPass(!showPass)} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Confirmer le mot de passe *', 'تأكيد كلمة المرور *')}</label>
                <PasswordInput value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} show={showPass2} onToggle={() => setShowPass2(!showPass2)} />
              </div>

              {!form.email && form.phone && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#eef8f1', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={15} color="#4a7c59" />
                  <p style={{ fontSize: '12px', color: '#4a7c59', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                    {f('Un code SMS sera envoyé pour vérifier votre numéro', 'سيُرسل رمز SMS للتحقق من رقمك (مرة واحدة فقط)')}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Date de naissance', 'تاريخ الميلاد')}</label>
                <input type="date" value={form.birthdate}
                  onChange={e => setForm({ ...form, birthdate: e.target.value })}
                  style={inputStyle} dir="ltr" />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Pays', 'البلد')}</label>
                <select value={form.country}
                  onChange={e => {
                    const c = COUNTRIES.find(x => x.code === e.target.value)
                    setForm({ ...form, country: e.target.value, dialCode: c?.dial || form.dialCode })
                  }}
                  style={inputStyle}>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{ar ? c.nameAr : c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{f('Adresse de livraison', 'عنوان التوصيل')}</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {[{ val: 'description', fr: 'Description libre', ar: 'وصف حر' }, { val: 'structured', fr: 'Rue / Ville / CP', ar: 'شارع / مدينة / رمز' }].map(opt => (
                    <button key={opt.val} type="button" onClick={() => setForm({ ...form, addressType: opt.val })}
                      style={{ flex: 1, padding: '8px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer', border: `1.5px solid ${form.addressType === opt.val ? '#5a6a8a' : '#e0d8d0'}`, background: form.addressType === opt.val ? '#5a6a8a' : 'white', color: form.addressType === opt.val ? 'white' : '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                      {ar ? opt.ar : opt.fr}
                    </button>
                  ))}
                </div>
                {form.addressType === 'description' ? (
                  <textarea value={form.addressDesc} onChange={e => setForm({ ...form, addressDesc: e.target.value })}
                    rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                    placeholder={f('Ex: Bâtiment blanc en face de la boulangerie, 2ème étage...', 'مثال: المبنى الأبيض أمام المخبز، الطابق الثاني...')} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="text" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder={f('Rue et numéro', 'الشارع والرقم')} style={inputStyle} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder={f('Ville', 'المدينة')} style={inputStyle} />
                      <input type="text" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} placeholder={f('Code postal', 'الرمز البريدي')} style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} style={{ ...btnPrimary, marginBottom: '14px', opacity: loading ? 0.6 : 1 }}>
                {loading ? f('Création...', 'جاري الإنشاء...') : (!form.email && form.phone) ? f('Vérifier mon numéro →', 'التحقق من رقمي →') : f('Créer mon compte', 'إنشاء حسابي')}
              </button>

              <p style={{ textAlign: 'center', fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Déjà un compte ? ', 'لديك حساب؟ ')}
                <button type="button" onClick={() => setStep('choice')}
                  style={{ background: 'none', border: 'none', color: '#5a6a8a', cursor: 'pointer', fontWeight: '600', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Se connecter', 'تسجيل الدخول')}
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER OTP (phone-only signup verification) ── */}
          {step === 'register-otp' && (
            <form onSubmit={handleVerifyRegisterOTP}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eef8f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Phone size={24} color="#4a7c59" />
                </div>
                <h2 style={{ fontSize: '20px', color: '#2c3e50', marginBottom: '6px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Vérifiez votre numéro', 'تحقق من رقمك')}
                </h2>
                <p style={{ fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f(`Code envoyé au ${pendingRegisterData?.dialCode} ${pendingRegisterData?.phone}`, `تم إرسال الرمز إلى ${pendingRegisterData?.dialCode} ${pendingRegisterData?.phone}`)}
                </p>
                <p style={{ fontSize: '12px', color: '#4a7c59', marginTop: '6px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Cette vérification n\'est requise qu\'une seule fois', 'هذا التحقق مطلوب مرة واحدة فقط')}
                </p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{f('Code à 6 chiffres', 'الرمز المكون من 6 أرقام')}</label>
                <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" maxLength={6} required
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '10px' }} dir="ltr" />
              </div>
              <button type="submit" disabled={loading || otpCode.length !== 6}
                style={{ ...btnGreen, opacity: (loading || otpCode.length !== 6) ? 0.6 : 1 }}>
                {loading ? f('Création du compte...', 'جاري إنشاء الحساب...') : f('Créer mon compte', 'إنشاء حسابي')}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
