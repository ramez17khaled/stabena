// components/shared/AuthModal.js
import { useState } from 'react'
import { X, Phone, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { supabase, signIn, signUp } from '../../lib/supabase'
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

export default function AuthModal({ onClose, onSuccess }) {
  const { lang, isRTL } = useLang()
  const ar = lang === 'ar'
  const f = (fr, arText) => ar ? arText : fr

  const [step, setStep] = useState('choice') // choice | login-email | login-phone | otp | register
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  // Login email
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Login phone
  const [dialCode, setDialCode] = useState('+961')
  const [phoneNum, setPhoneNum] = useState('')
  const [otpCode, setOtpCode] = useState('')

  // Register
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    dialCode: '+961', phone: '', birthdate: '', country: 'LB',
    addressType: 'description', addressDesc: '', street: '', city: '', zip: '',
  })

  const inputStyle = {
    width: '100%', padding: '12px 16px', fontSize: '14px',
    background: '#f8f5f2', border: '1.5px solid #e0d8d0', borderRadius: '10px',
    color: '#2c3e50', outline: 'none', fontFamily: ar ? 'Arial, sans-serif' : 'inherit',
    textAlign: isRTL ? 'right' : 'left', boxSizing: 'border-box'
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#9a9085', marginBottom: '5px',
    fontFamily: ar ? 'Arial, sans-serif' : 'inherit'
  }
  const btnPrimary = {
    width: '100%', padding: '13px', fontSize: '14px', color: 'white', border: 'none',
    background: 'linear-gradient(135deg, #6a7fa0, #8a9bb5)', borderRadius: '10px',
    cursor: 'pointer', fontFamily: ar ? 'Arial, sans-serif' : 'inherit', fontWeight: '500'
  }

  const PhoneRow = ({ dialVal, onDial, phoneVal, onPhone }) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select value={dialVal} onChange={e => onDial(e.target.value)}
        style={{ ...inputStyle, width: '120px', flexShrink: 0 }}>
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.dial}>
            {c.dial} {ar ? c.nameAr : c.name}
          </option>
        ))}
      </select>
      <input type="tel" value={phoneVal} onChange={e => onPhone(e.target.value)}
        placeholder={f('Numéro', 'الرقم')}
        style={{ ...inputStyle, flex: 1 }} dir="ltr" />
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

  // ── OTP PHONE ──
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!phoneNum) { toast.error(f('Entrez votre numéro', 'أدخل رقم هاتفك')); return }
    setLoading(true)
    const full = dialCode + phoneNum.replace(/^0/, '')
    const { error } = await supabase.auth.signInWithOtp({ phone: full })
    if (error) toast.error(error.message)
    else { toast.success(f('Code SMS envoyé !', 'تم إرسال الرمز!')); setStep('otp') }
    setLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    const full = dialCode + phoneNum.replace(/^0/, '')
    const { error } = await supabase.auth.verifyOtp({ phone: full, token: otpCode, type: 'sms' })
    if (error) toast.error(f('Code incorrect', 'رمز خاطئ'))
    else { toast.success(f('Bienvenue !', 'أهلاً!')); onSuccess() }
    setLoading(false)
  }

  // ── REGISTER ──
  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error(f('Remplissez tous les champs obligatoires', 'يرجى ملء جميع الحقول الإلزامية')); return
    }
    if (form.password !== form.confirmPassword) {
      toast.error(f('Mots de passe différents', 'كلمتا المرور غير متطابقتين')); return
    }
    if (form.password.length < 6) {
      toast.error(f('Mot de passe trop court (6 min)', 'كلمة المرور قصيرة جداً (6 على الأقل)')); return
    }
    setLoading(true)
    const address = form.addressType === 'description'
      ? form.addressDesc
      : `${form.street}, ${form.city}${form.zip ? ' ' + form.zip : ''}`
    const country = COUNTRIES.find(c => c.code === form.country)
    const fullPhone = form.dialCode + form.phone.replace(/^0/, '')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.firstName} ${form.lastName}`,
          first_name: form.firstName,
          last_name: form.lastName,
          phone: fullPhone,
          birthdate: form.birthdate || null,
          country: country ? (ar ? country.nameAr : country.name) : form.country,
          address: address,
        }
      }
    })
    if (error) { toast.error(error.message); setLoading(false); return }

    // Mise à jour du profil avec toutes les infos
    if (data?.user) {
      await supabase.from('profiles').update({
        full_name: `${form.firstName} ${form.lastName}`,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: fullPhone,
        birthdate: form.birthdate || null,
        country: country ? (ar ? country.nameAr : country.name) : form.country,
        address: address,
      }).eq('id', data.user.id)
    }
    toast.success(f('Compte créé ! Vérifiez votre email.', 'تم إنشاء الحساب! تحقق من بريدك.'))
    onClose()
    setLoading(false)
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
            <button onClick={() => setStep(step === 'otp' ? 'login-phone' : 'choice')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <ArrowLeft size={18} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            </button>
          ) : <div style={{ width: '26px' }} />}
          <img src="/logo.jpg" alt="Stabena" style={{ height: '44px', objectFit: 'contain' }} />
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
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

              {/* Email */}
              <button onClick={() => setStep('login-email')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px', border: '2px solid #e0d8d0', borderRadius: '12px',
                  background: 'white', cursor: 'pointer', marginBottom: '12px',
                  textAlign: isRTL ? 'right' : 'left'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#8a9bb5'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#e0d8d0'}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eef1f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} color="#5a6a8a" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                    {f('Continuer avec Email', 'المتابعة بالبريد الإلكتروني')}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                    {f('Email + mot de passe', 'بريد إلكتروني وكلمة مرور')}
                  </p>
                </div>
              </button>

              {/* Phone */}
              <button onClick={() => setStep('login-phone')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px', border: '2px solid #e0d8d0', borderRadius: '12px',
                  background: 'white', cursor: 'pointer', marginBottom: '20px',
                  textAlign: isRTL ? 'right' : 'left'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#4a7c59'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#e0d8d0'}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eef8f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={18} color="#4a7c59" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                    {f('Continuer avec Téléphone', 'المتابعة برقم الهاتف')}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                    {f('Code SMS de vérification', 'رمز تحقق عبر SMS')}
                  </p>
                </div>
              </button>

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
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{f('Mot de passe', 'كلمة المرور')}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required style={inputStyle} dir="ltr" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', top: '50%', [isRTL ? 'left' : 'right']: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9085' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
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
            <form onSubmit={handleSendOTP}>
              <h2 style={{ fontSize: '20px', color: '#2c3e50', textAlign: 'center', marginBottom: '8px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Connexion par SMS', 'الدخول برقم الهاتف')}
              </h2>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#9a9085', marginBottom: '20px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Recevez un code de vérification par SMS', 'ستصلك رسالة SMS برمز التحقق')}
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{f('Numéro de téléphone', 'رقم الهاتف')}</label>
                <PhoneRow dialVal={dialCode} onDial={setDialCode} phoneVal={phoneNum} onPhone={setPhoneNum} />
              </div>
              <button type="submit" disabled={loading} style={{ ...btnPrimary, background: '#4a7c59', marginBottom: '14px', opacity: loading ? 0.6 : 1 }}>
                {loading ? f('Envoi...', 'جاري الإرسال...') : f('Envoyer le code SMS', 'إرسال رمز التحقق')}
              </button>
            </form>
          )}

          {/* ── OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eef8f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Phone size={24} color="#4a7c59" />
                </div>
                <h2 style={{ fontSize: '20px', color: '#2c3e50', marginBottom: '6px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f('Code de vérification', 'رمز التحقق')}
                </h2>
                <p style={{ fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                  {f(`Envoyé au ${dialCode} ${phoneNum}`, `أُرسل إلى ${dialCode} ${phoneNum}`)}
                </p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{f('Code à 6 chiffres', 'الرمز المكون من 6 أرقام')}</label>
                <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" maxLength={6} required
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '10px' }} dir="ltr" />
              </div>
              <button type="submit" disabled={loading || otpCode.length !== 6}
                style={{ ...btnPrimary, background: '#4a7c59', marginBottom: '12px', opacity: (loading || otpCode.length !== 6) ? 0.6 : 1 }}>
                {loading ? f('Vérification...', 'جاري التحقق...') : f('Confirmer', 'تأكيد')}
              </button>
              <button type="button" onClick={() => setStep('login-phone')}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#9a9085', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('← Changer de numéro', '← تغيير الرقم')}
              </button>
            </form>
          )}

          {/* ── REGISTER ── */}
          {step === 'register' && (
            <form onSubmit={handleRegister}>
              <h2 style={{ fontSize: '20px', color: '#2c3e50', textAlign: 'center', marginBottom: '20px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {f('Créer mon compte', 'إنشاء حساب')}
              </h2>

              {/* Prénom + Nom */}
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

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Email *', 'البريد الإلكتروني *')}</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="exemple@email.com" style={inputStyle} dir="ltr" />
              </div>

              {/* Téléphone */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Téléphone', 'رقم الهاتف')}</label>
                <PhoneRow dialVal={form.dialCode} onDial={v => setForm({ ...form, dialCode: v })}
                  phoneVal={form.phone} onPhone={v => setForm({ ...form, phone: v })} />
              </div>

              {/* Date naissance */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Date de naissance', 'تاريخ الميلاد')}</label>
                <input type="date" value={form.birthdate}
                  onChange={e => setForm({ ...form, birthdate: e.target.value })}
                  style={inputStyle} dir="ltr" />
              </div>

              {/* Pays */}
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

              {/* Adresse */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Adresse de livraison', 'عنوان التوصيل')}</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {[
                    { val: 'description', fr: 'Description libre', ar: 'وصف حر' },
                    { val: 'structured', fr: 'Rue / Ville / CP', ar: 'شارع / مدينة / رمز' },
                  ].map(opt => (
                    <button key={opt.val} type="button"
                      onClick={() => setForm({ ...form, addressType: opt.val })}
                      style={{
                        flex: 1, padding: '8px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer',
                        border: `1.5px solid ${form.addressType === opt.val ? '#5a6a8a' : '#e0d8d0'}`,
                        background: form.addressType === opt.val ? '#5a6a8a' : 'white',
                        color: form.addressType === opt.val ? 'white' : '#9a9085',
                        fontFamily: ar ? 'Arial, sans-serif' : 'inherit'
                      }}>
                      {ar ? opt.ar : opt.fr}
                    </button>
                  ))}
                </div>

                {form.addressType === 'description' ? (
                  <>
                    <textarea value={form.addressDesc}
                      onChange={e => setForm({ ...form, addressDesc: e.target.value })}
                      rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                      placeholder={f(
                        'Ex: Bâtiment blanc en face de la boulangerie, 2ème étage, apt 5, Beyrouth...',
                        'مثال: المبنى الأبيض أمام المخبز، الطابق الثاني، شقة 5، بيروت...'
                      )} />
                    <p style={{ fontSize: '11px', color: '#b0a898', marginTop: '4px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                      {f('Décrivez votre emplacement pour faciliter la livraison', 'صف موقعك لتسهيل عملية التوصيل')}
                    </p>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="text" value={form.street}
                      onChange={e => setForm({ ...form, street: e.target.value })}
                      placeholder={f('Rue et numéro', 'الشارع والرقم')} style={inputStyle} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="text" value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        placeholder={f('Ville', 'المدينة')} style={inputStyle} />
                      <input type="text" value={form.zip}
                        onChange={e => setForm({ ...form, zip: e.target.value })}
                        placeholder={f('Code postal (optionnel)', 'الرمز البريدي')} style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{f('Mot de passe * (6 min.)', 'كلمة المرور * (6 أحرف على الأقل)')}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} required minLength={6}
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••" style={inputStyle} dir="ltr" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', top: '50%', [isRTL ? 'left' : 'right']: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9085' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>{f('Confirmer le mot de passe *', 'تأكيد كلمة المرور *')}</label>
                <input type="password" required value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••" style={inputStyle} dir="ltr" />
              </div>

              <button type="submit" disabled={loading} style={{ ...btnPrimary, marginBottom: '14px', opacity: loading ? 0.6 : 1 }}>
                {loading ? f('Création du compte...', 'جاري إنشاء الحساب...') : f('Créer mon compte', 'إنشاء حسابي')}
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
        </div>
      </div>
    </div>
  )
}
