import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { syntheticEmail, password, phone, profile } = req.body
  if (!syntheticEmail || !password || !phone) {
    return res.status(400).json({ error: 'Données manquantes' })
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: syntheticEmail,
    password,
    phone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: {
      full_name: profile.full_name,
      first_name: profile.first_name,
      last_name: profile.last_name,
    },
  })

  if (error) return res.status(400).json({ error: error.message })

  if (data?.user) {
    await supabaseAdmin.from('profiles').update(profile).eq('id', data.user.id)
  }

  return res.status(200).json({ success: true })
}
