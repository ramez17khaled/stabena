import { useLang } from '../../lib/LangContext'

// ============================================
// PARTENAIRES — Remplace les noms et logos ici
// Pour ajouter un logo : mets l'image dans /public/partners/
// et remplace le "logo" par "/partners/nom-partenaire.png"
// ============================================
const PARTNERS = [
  { name: 'CHANEL', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Chanel_logo_interlocking_cs.svg/1280px-Chanel_logo_interlocking_cs.svg.png'},
  { name: 'Dior', logo: 'https://images.seeklogo.com/logo-png/40/1/dior-logo-png_seeklogo-407105.png' },
  { name: 'Versace', logo: 'https://thumbs.dreamstime.com/b/logo-versace-srl-gianni-souvent-vis%C3%A9-juste-comme-le-est-une-soci%C3%A9t%C3%A9-de-luxe-italienne-mode-et-un-nom-commercial-fond%C3%A9e-par-en-204759435.jpg' },
  { name: "L'oreal", logo: 'https://lucid.communiti.corsica/img/back/back-l-oreal.png' },
  { name: 'BOSS', logo: 'https://www.urbancitystyles.fr/cdn/shop/collections/mens-clothing-boss_793x630.jpg?v=1756759846' },
  { name: 'Invicta', logo: 'https://logoeps.com/wp-content/uploads/2012/11/invicta-logo-vector.png' },
  { name: 'TISSOT', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Tissot_Logo_%282023%29.png' },
  { name: 'CASIO', logo: 'https://icon2.cleanpng.com/20180714/pvc/kisspng-casio-f-91w-g-shock-watch-pro-trek-superdry-5b49cf0e244554.2130343215315637901486.jpg' },
]

// Composant logo placeholder élégant
const LogoPlaceholder = ({ name }) => (
  <div style={{
    width: '140px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px dashed #d0c8be',
    borderRadius: '8px',
    background: 'white',
    padding: '0 16px',
  }}>
    <span style={{
      fontSize: '13px',
      fontWeight: '600',
      color: '#b0a898',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '110px',
      textAlign: 'center',
    }}>
      {name}
    </span>
  </div>
)

const LogoImage = ({ name, logo }) => (
  <div style={{
    width: '140px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    filter: 'grayscale(100%)',
    opacity: 0.6,
    transition: 'all 0.3s',
  }}
  onMouseOver={e => { e.currentTarget.style.filter = 'grayscale(0%)'; e.currentTarget.style.opacity = '1' }}
  onMouseOut={e => { e.currentTarget.style.filter = 'grayscale(100%)'; e.currentTarget.style.opacity = '0.6' }}>
    <img src={logo} alt={name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
  </div>
)

export default function PartnersCarousel() {
  const { lang, isRTL } = useLang()
  const ar = lang === 'ar'

  // Dupliquer les partenaires pour l'effet infini
  const items = [...PARTNERS, ...PARTNERS, ...PARTNERS]

  return (
    <section style={{ background: '#f8f5f2', padding: '48px 0', overflow: 'hidden' }}>
      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 400, color: '#2c3e50', margin: 0,
          fontFamily: ar ? 'Arial, sans-serif' : 'Georgia, serif'
        }}>
          {ar ? 'متوفر' : 'Marks'}
        </h2>
      </div>

      {/* Carousel wrapper avec masques dégradés */}
      <div style={{ position: 'relative' }}>
        {/* Masque gauche */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', zIndex: 2,
          background: 'linear-gradient(to right, #f8f5f2, transparent)',
          pointerEvents: 'none'
        }} />
        {/* Masque droit */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', zIndex: 2,
          background: 'linear-gradient(to left, #f8f5f2, transparent)',
          pointerEvents: 'none'
        }} />

        {/* Track animé */}
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            animation: `scroll-left 35s linear infinite`,
            width: 'max-content',
          }}>
            {items.map((partner, i) => (
              <div key={i} style={{ flexShrink: 0, cursor: 'default' }}>
                {partner.logo
                  ? <LogoImage name={partner.name} logo={partner.logo} />
                  : <LogoPlaceholder name={partner.name} />
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-${PARTNERS.length} * 180px)); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="scroll-left"] { animation: none; }
        }
      `}</style>
    </section>
  )
}