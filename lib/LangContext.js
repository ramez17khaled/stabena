// lib/LangContext.js
import { createContext, useContext, useState, useEffect } from 'react'
import { translations, detectLanguage, saveLanguage } from './i18n'

export const LangContext = createContext({})

export function LangProvider({ children }) {
  const [lang, setLang] = useState('fr')

  useEffect(() => {
    const detected = detectLanguage()
    setLang(detected)
    document.documentElement.dir = detected === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = detected
  }, [])

  const switchLang = (newLang) => {
    setLang(newLang)
    saveLanguage(newLang)
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
  }

  const t = (key) => translations[lang]?.[key] || translations['fr']?.[key] || key

  const isRTL = lang === 'ar'

  return (
    <LangContext.Provider value={{ lang, switchLang, t, isRTL }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
