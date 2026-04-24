// pages/contact.js
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/shared/Navbar'
import { useLang } from '../lib/LangContext'
import { sendEmail } from '../lib/sendEmail'
import toast, { Toaster } from 'react-hot-toast'
import { MessageCircle, Mail, Send, ExternalLink } from 'lucide-react'

const CONTACT_EMAIL = 'supportstabena@gmail.com'
const WHATSAPP_AR = '+96170240603'
const WHATSAPP_FR = '+330749148277'
const INSTAGRAM_URL = 'https://www.instagram.com/stabena_perfum?igsh=MWExOGt0cm1wZWhiNA=='
const FACEBOOK_URL = 'https://www.facebook.com/share/1B4qEjAUQk/?mibextid=wwXIfr'

export default function Contact() {
  const { t, lang, isRTL } = useLang()
  const arabicFont = lang === 'ar' ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', subject: '', message: ''
  })
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { firstName, lastName, phone, email, subject, message } = form
    if (!firstName || !lastName || !email || !subject || !message) {
      toast.error(t('contact_required'))
      return
    }

    // Escape user inputs to prevent HTML injection in the email
    const esc = (s) => String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    setSending(true)
    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 8px;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #c9a96e; padding-bottom: 12px;">
          Nouveau message — Stabena
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr><td style="padding: 8px 0; color: #666; width: 130px;"><strong>Prénom :</strong></td><td style="padding: 8px 0;">${esc(firstName)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;"><strong>Nom :</strong></td><td style="padding: 8px 0;">${esc(lastName)}</td></tr>
          ${phone ? `<tr><td style="padding: 8px 0; color: #666;"><strong>Téléphone :</strong></td><td style="padding: 8px 0;">${esc(phone)}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #666;"><strong>Email :</strong></td><td style="padding: 8px 0;"><a href="mailto:${esc(email)}" style="color: #c9a96e;">${esc(email)}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;"><strong>Objet :</strong></td><td style="padding: 8px 0;">${esc(subject)}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #fff; border-left: 4px solid #c9a96e; border-radius: 4px;">
          <strong style="color: #666;">Message :</strong>
          <p style="margin-top: 8px; line-height: 1.6; white-space: pre-wrap;">${esc(message)}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          Envoyé depuis le formulaire de contact Stabena
        </p>
      </div>
    `

    const result = await sendEmail({
      to: CONTACT_EMAIL,
      subject: `[Contact Stabena] ${esc(subject)} — ${esc(firstName)} ${esc(lastName)}`,
      html,
      type: 'contact',
    })

    setSending(false)
    if (result.success) {
      toast.success(t('contact_success'))
      setForm({ firstName: '', lastName: '', phone: '', email: '', subject: '', message: '' })
    } else {
      toast.error(t('contact_error'))
    }
  }

  const inputClass = "w-full px-4 py-3 text-sm bg-transparent border outline-none focus:border-accent transition-colors"
  const inputStyle = { borderColor: 'var(--color-border)', borderRadius: '8px', ...arabicFont }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Toaster position="top-center" />
      <Navbar />

      {/* Hero */}
      <section className="py-16 text-center" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--color-muted)', ...arabicFont }}>
          {t('contact_subtitle')}
        </p>
        <h1 className="font-display text-5xl" style={arabicFont}>{t('contact_title')}</h1>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-12">

        {/* Form — 3 cols */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                  {t('contact_firstname')} *
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputClass}
                  style={inputStyle}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                  {t('contact_lastname')} *
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputClass}
                  style={inputStyle}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                  {t('contact_phone')}
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  style={inputStyle}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                  {t('contact_email')} *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  style={inputStyle}
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                {t('contact_subject')} *
              </label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--color-muted)', ...arabicFont }}>
                {t('contact_message')} *
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                className={inputClass}
                style={{ ...inputStyle, resize: 'vertical' }}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-8 py-3 text-sm tracking-wider text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--color-primary)', borderRadius: '50px', ...arabicFont }}
            >
              <Send size={15} />
              {sending ? t('contact_sending') : t('contact_send')}
            </button>
          </form>
        </div>

        {/* Sidebar — 2 cols */}
        <div className="md:col-span-2 space-y-8">

          {/* Email */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail size={16} style={{ color: 'var(--color-accent)' }} />
              <span className="text-xs tracking-widest uppercase font-medium" style={arabicFont}>Email</span>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-sm hover:text-accent transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* WhatsApp */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={16} style={{ color: '#25D366' }} />
              <span className="text-xs tracking-widest uppercase font-medium" style={arabicFont}>WhatsApp</span>
            </div>
            <div className="space-y-2">
              <a
                href={`https://wa.me/${WHATSAPP_AR.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:border-accent"
                style={{ border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-muted)', ...arabicFont }}
              >
                <span style={{ fontSize: '18px' }}>🇱🇧</span>
                <div>
                  <div style={{ ...arabicFont, fontWeight: '500', color: 'var(--color-text)' }}>{t('contact_whatsapp_ar')}</div>
                  <div dir="ltr" style={{ fontSize: '12px' }}>{WHATSAPP_AR}</div>
                </div>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_FR.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:border-accent"
                style={{ border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-muted)', ...arabicFont }}
              >
                <span style={{ fontSize: '18px' }}>🇫🇷</span>
                <div>
                  <div style={{ ...arabicFont, fontWeight: '500', color: 'var(--color-text)' }}>{t('contact_whatsapp_fr')}</div>
                  <div dir="ltr" style={{ fontSize: '12px' }}>{WHATSAPP_FR}</div>
                </div>
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs tracking-widest uppercase font-medium" style={arabicFont}>{t('contact_follow')}</span>
            </div>
            <div className="space-y-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:border-accent"
                style={{ border: '1px solid var(--color-border)', borderRadius: '8px', ...arabicFont }}
              >
                <ExternalLink size={16} style={{ color: '#E1306C' }} />
                <span style={{ color: 'var(--color-text)' }}>@stabena_perfum</span>
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:border-accent"
                style={{ border: '1px solid var(--color-border)', borderRadius: '8px', ...arabicFont }}
              >
                <ExternalLink size={16} style={{ color: '#1877F2' }} />
                <span style={{ color: 'var(--color-text)' }}>Stabena</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', ...arabicFont }}>
        <Link href="/" className="hover:text-accent transition-colors">
          ← {lang === 'ar' ? 'العودة إلى المتجر' : 'Retour à la boutique'}
        </Link>
        <p className="mt-4">
          {lang === 'ar' ? '© 2024 ستابينا — جميع الحقوق محفوظة' : '© 2024 Stabena — Tous droits réservés'}
        </p>
      </footer>
    </div>
  )
}
