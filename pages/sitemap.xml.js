import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://stabena.vercel.app'

function generateSitemap(products, categories) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  ${categories.map(c => `
  <url>
    <loc>${BASE_URL}/categories/${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${products.map(p => `
  <url>
    <loc>${BASE_URL}/products/${p.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`
}

export async function getServerSideProps({ res }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('slug').eq('is_active', true),
    supabase.from('categories').select('slug'),
  ])

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600')
  res.write(generateSitemap(products || [], categories || []))
  res.end()

  return { props: {} }
}

export default function Sitemap() { return null }
