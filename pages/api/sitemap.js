import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://stabena.vercel.app'

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('slug').eq('is_active', true),
    supabase.from('categories').select('slug'),
  ])

  const urls = [
    { loc: BASE_URL, priority: '1.0', changefreq: 'daily' },
    { loc: `${BASE_URL}/products`, priority: '0.9', changefreq: 'daily' },
    { loc: `${BASE_URL}/contact`, priority: '0.5', changefreq: 'monthly' },
    ...(categories || []).map(c => ({
      loc: `${BASE_URL}/categories/${c.slug}`, priority: '0.8', changefreq: 'weekly'
    })),
    ...(products || []).map(p => ({
      loc: `${BASE_URL}/products/${p.slug}`, priority: '0.7', changefreq: 'weekly'
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600')
  res.status(200).send(xml)
}
