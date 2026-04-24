// pages/account.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/shared/Navbar'
import { useAuth } from './_app'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LangContext'
import { User, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const COUNTRIES = [
  { code: 'LB', name: 'Liban' }, { code: 'FR', name: 'France' },
  { code: 'DZ', name: 'Algérie' }, { code: 'MA', name: 'Maroc' },
  { code: 'TN', name: 'Tunisie' }, { code: 'EG', name: 'Égypte' },
  { code: 'SA', name: 'Arabie Saoudite' }, { code: 'AE', name: 'Émirats' },
  { code: 'JO', name: 'Jordanie' }, { code: 'SY', name: 'Syrie' },
  { code: 'DE', name: 'Allemagne' }, { code: 'GB', name: 'Royaume-Uni' },
  { code: 'US', name: 'États-Unis' }, { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
]

export default function AccountPage() {
  const { user, profile } = useAuth()
  const { t, lang, isRTL } = useLang()
  const router = useRouter()
  const ar = lang === 'ar'
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', birthdate: '', country: '', address: '',
  })

  useEffect(() => {
    if (!user) { router.push('/'); return }
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || user.email || '',
        phone: profile.phone || '',
        birthdate: profile.birthdate || '',
        country: profile.country || '',
        address: profile.address || '',
      })
    }
  }, [user, profile])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      first_name: form.first_name,
      last_name: form.last_name,
      full_name: `${form.first_name} ${form.last_name}`.trim(),
      phone: form.phone,
      birthdate: form.birthdate || null,
      country: form.country,
      address: form.address,
    }).eq('id', user.id)
    if (error) toast.error(ar ? 'خطأ في الحفظ' : 'Erreur lors de la sauvegarde')
    else toast.success(ar ? 'تم تحديث الملف الشخصي ✓' : 'Profil mis à jour ✓')
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', fontSize: '14px',
    border: '1.5px solid var(--color-border)', borderRadius: '8px',
    background: 'transparent', outline: 'none',
    fontFamily: ar ? 'Arial, sans-serif' : 'inherit',
    color: 'var(--color-primary)', boxSizing: 'border-box'
  }
  const labelStyle = {
    fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--color-muted)', display: 'block', marginBottom: '5px',
    fontFamily: ar ? 'Arial, sans-serif' : 'inherit'
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl mb-8" style={{ fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
          {ar ? 'حسابي' : 'Mon Compte'}
        </h1>

        <div className="bg-white border p-8" style={{ borderColor: 'var(--color-border)', borderRadius: '12px' }}>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-display"
              style={{ background: 'var(--color-accent)', flexShrink: 0 }}>
              {form.first_name?.[0]?.toUpperCase() || <User size={24} />}
            </div>
            <div>
              <p className="font-medium">{form.first_name} {form.last_name}</p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
              {profile?.role === 'admin' && (
                <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background: '#c4956a20', color: 'var(--color-accent)' }}>
                  {ar ? 'مدير' : 'Administrateur'}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Prénom */}
            <div>
              <label style={labelStyle}>{ar ? 'الاسم *' : 'Prénom *'}</label>
              <input type="text" value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
                placeholder={ar ? 'محمد' : 'Marie'} style={inputStyle} />
            </div>

            {/* Nom */}
            <div>
              <label style={labelStyle}>{ar ? 'اللقب *' : 'Nom *'}</label>
              <input type="text" value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
                placeholder={ar ? 'الأحمد' : 'Dupont'} style={inputStyle} />
            </div>

            {/* Email (readonly) */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>{ar ? 'البريد الإلكتروني' : 'Email'}</label>
              <input type="email" value={form.email} disabled
                style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} dir="ltr" />
            </div>

            {/* Téléphone */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>{ar ? 'رقم الهاتف' : 'Téléphone'}</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+961 70 000 000" style={inputStyle} dir="ltr" />
            </div>

            {/* Date naissance */}
            <div>
              <label style={labelStyle}>{ar ? 'تاريخ الميلاد' : 'Date de naissance'}</label>
              <input type="date" value={form.birthdate}
                onChange={e => setForm({ ...form, birthdate: e.target.value })}
                style={inputStyle} dir="ltr" />
            </div>

            {/* Pays */}
            <div>
              <label style={labelStyle}>{ar ? 'البلد' : 'Pays'}</label>
              <select value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                style={inputStyle}>
                <option value="">{ar ? 'اختر البلد' : 'Choisir...'}</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Adresse */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>{ar ? 'عنوان التوصيل' : 'Adresse de livraison'}</label>
              <textarea value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                rows={3} placeholder={ar
                  ? 'مثال: المبنى الأبيض أمام المخبز، الطابق 2، شقة 5، بيروت...'
                  : 'Ex: Bâtiment blanc face à la boulangerie, 2ème étage, apt 5, Beyrouth...'}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
              <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
                {ar ? 'صف موقعك بدقة لتسهيل التوصيل' : 'Décrivez votre emplacement précisément pour faciliter la livraison'}
              </p>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 text-sm text-white transition-opacity disabled:opacity-70 mt-6"
            style={{ background: 'var(--color-primary)', borderRadius: '8px', fontFamily: ar ? 'Arial, sans-serif' : 'inherit' }}>
            <Save size={14} />
            {saving ? (ar ? 'جاري الحفظ...' : 'Sauvegarde...') : (ar ? 'حفظ التغييرات' : 'Sauvegarder')}
          </button>
        </div>
      </div>
    </div>
  )
}
