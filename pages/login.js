// pages/login.js
// Cette page redirige vers l'accueil et ouvre le modal d'auth
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './_app'

export default function LoginPage() {
  const router = useRouter()
  const { user, requireAuth } = useAuth()

  useEffect(() => {
    if (user) { router.push('/'); return }
    // Ouvre le modal auth sur la page d'accueil
    router.push('/?auth=true')
  }, [user])

  return null
}
