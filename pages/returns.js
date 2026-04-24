import Link from 'next/link'
import { useLang } from '../lib/LangContext'

export default function Returns() {
  const { t, lang, isRTL } = useLang()
  const arabicFont = lang === 'ar' ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="max-w-3xl mx-auto px-6 py-16"
      style={arabicFont}
    >
      <h1 className="text-2xl font-semibold mb-6">
        {t('returns_title')}
      </h1>

      <p className="mb-4">
        {t('returns_desc')}
      </p>

      <p className="mb-4">
        {t('returns_steps_title')}
      </p>

      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>
          <Link href="/contact" className="underline hover:text-accent">
            {t('returns_step_1')}
          </Link>
        </li>
        <li>{t('returns_step_2')}</li>
        <li>{t('returns_step_3')}</li>
      </ul>

      <p>
        {t('returns_footer')}
      </p>
    </div>
  )
}