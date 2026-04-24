// lib/emails.js — Templates emails FR/AR pour Stabena

const STABENA_COLOR = '#5a6a8a'

// Layout HTML de base
const baseLayout = (content, lang = 'fr') => {
  const isAr = lang === 'ar'
  const dir = isAr ? 'rtl' : 'ltr'
  const fontFamily = isAr ? 'Arial, sans-serif' : 'Georgia, serif'

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stabena</title>
</head>
<body style="margin:0;padding:0;background:#f0ebe3;font-family:${fontFamily};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe3;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${STABENA_COLOR};padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;color:white;font-size:28px;font-weight:300;letter-spacing:3px;font-family:${isAr ? 'Arial' : 'Georgia'},serif;">
              STABENA
            </h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:2px;">
              ${isAr ? 'عطور · جمال · موضة' : 'Parfums · Beauté · Mode'}
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="background:white;padding:40px;border-radius:0 0 12px 12px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px;text-align:center;">
            <p style="margin:0;color:#9a9085;font-size:12px;">
              ${isAr
                ? '© 2024 Stabena — جميع الحقوق محفوظة'
                : '© 2024 Stabena — Tous droits réservés'}
            </p>
            <p style="margin:6px 0 0;color:#b0a898;font-size:11px;">
              ${isAr
                ? 'هذا البريد أُرسل تلقائياً، يرجى عدم الرد عليه'
                : 'Cet email a été envoyé automatiquement, merci de ne pas y répondre'}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const btn = (text, link, color = STABENA_COLOR) =>
  `<a href="${link}" style="display:inline-block;padding:14px 32px;background:${color};color:white;text-decoration:none;border-radius:50px;font-size:14px;margin-top:8px;">${text}</a>`

const divider = () =>
  `<hr style="border:none;border-top:1px solid #f0e8e0;margin:24px 0;">`

const statusBadge = (text, color) =>
  `<span style="display:inline-block;padding:6px 16px;background:${color}20;color:${color};border-radius:50px;font-size:13px;font-weight:bold;">${text}</span>`

// ============================================
// 1. EMAIL DE BIENVENUE
// ============================================
export const welcomeEmail = (name, lang = 'fr') => {
  const isAr = lang === 'ar'
  const content = isAr ? `
    <h2 style="color:#2c3e50;font-size:24px;margin:0 0 8px;font-family:Arial,sans-serif;">
      أهلاً وسهلاً، ${name}! 🎉
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;font-family:Arial,sans-serif;">
      يسعدنا انضمامك إلى عائلة <strong>Stabena</strong>.<br>
      اكتشف أفضل العطور والمنتجات التي اخترناها بعناية خصيصاً لك.
    </p>
    ${divider()}
    <div style="background:#f8f5f2;border-radius:10px;padding:20px;margin:20px 0;font-family:Arial,sans-serif;">
      <p style="margin:0 0 10px;font-weight:bold;color:#2c3e50;">ما يمكنك فعله الآن:</p>
      <p style="margin:6px 0;color:#6b7280;">🛍️ تصفح مجموعاتنا الحصرية</p>
      <p style="margin:6px 0;color:#6b7280;">❤️ احفظ منتجاتك المفضلة</p>
      <p style="margin:6px 0;color:#6b7280;">🚚 استمتع بالشحن المجاني من 80€</p>
    </div>
    <div style="text-align:center;margin-top:28px;">
      ${btn('اكتشف متجرنا →', 'http://localhost:3000', STABENA_COLOR)}
    </div>
  ` : `
    <h2 style="color:#2c3e50;font-size:24px;margin:0 0 8px;font-family:Georgia,serif;">
      Bienvenue chez nous, ${name} ! 🎉
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;">
      Nous sommes ravis de vous accueillir dans la famille <strong>Stabena</strong>.<br>
      Découvrez nos parfums, produits de beauté et vêtements sélectionnés avec soin rien que pour vous.
    </p>
    ${divider()}
    <div style="background:#f8f5f2;border-radius:10px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 10px;font-weight:bold;color:#2c3e50;">Ce que vous pouvez faire dès maintenant :</p>
      <p style="margin:6px 0;color:#6b7280;">🛍️ Parcourir nos collections exclusives</p>
      <p style="margin:6px 0;color:#6b7280;">❤️ Sauvegarder vos produits favoris</p>
      <p style="margin:6px 0;color:#6b7280;">🚚 Profiter de la livraison offerte dès 80€</p>
    </div>
    <div style="text-align:center;margin-top:28px;">
      ${btn('Découvrir la boutique →', 'http://localhost:3000', STABENA_COLOR)}
    </div>
  `
  return {
    subject: isAr ? `مرحباً بك في Stabena، ${name}!` : `Bienvenue chez Stabena, ${name} !`,
    html: baseLayout(content, lang)
  }
}

// ============================================
// 2. CONFIRMATION DE COMMANDE (status: pending)
// ============================================
export const orderConfirmationEmail = (name, orderId, items, total, lang = 'fr') => {
  const isAr = lang === 'ar'
  const shortId = orderId.slice(0, 8).toUpperCase()
  const itemsList = items.map(item =>
    `<tr>
      <td style="padding:8px 0;color:#2c3e50;font-size:14px;${isAr ? 'text-align:right' : ''};font-family:${isAr ? 'Arial' : 'inherit'},sans-serif;">
        ${item.name}
      </td>
      <td style="padding:8px 0;color:#6b7280;font-size:14px;text-align:center;">x${item.quantity}</td>
      <td style="padding:8px 0;font-weight:bold;font-size:14px;${isAr ? 'text-align:left' : 'text-align:right'};">
        ${(item.price * item.quantity).toFixed(2)} €
      </td>
    </tr>`
  ).join('')

  const content = isAr ? `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;font-family:Arial,sans-serif;">
      شكراً لطلبك، ${name}! 🛍️
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;font-family:Arial,sans-serif;">
      استلمنا طلبك بنجاح وسنبدأ في معالجته قريباً.<br>
      سنُبلّغك بكل مرحلة حتى وصول طلبك إليك.
    </p>
    ${divider()}
    <div style="background:#f8f5f2;border-radius:10px;padding:20px;margin:16px 0;">
      <p style="margin:0 0 4px;color:#9a9085;font-size:12px;font-family:Arial,sans-serif;">رقم الطلب</p>
      <p style="margin:0;font-size:18px;font-weight:bold;color:#5a6a8a;letter-spacing:2px;font-family:monospace;">#${shortId}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      ${itemsList}
      <tr><td colspan="3"><hr style="border:none;border-top:1px solid #f0e8e0;margin:8px 0;"></td></tr>
      <tr>
        <td colspan="2" style="font-weight:bold;color:#2c3e50;padding:8px 0;font-family:Arial,sans-serif;">المجموع</td>
        <td style="font-weight:bold;font-size:16px;text-align:left;color:#5a6a8a;">${total.toFixed(2)} €</td>
      </tr>
    </table>
    <p style="color:#9a9085;font-size:13px;font-family:Arial,sans-serif;">
      ⏱️ سيتم تأكيد طلبك خلال 24 ساعة
    </p>
  ` : `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;">
      Merci pour votre commande, ${name} ! 🛍️
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;">
      Nous avons bien reçu votre commande et allons la traiter très bientôt.<br>
      Nous vous tiendrons informé à chaque étape jusqu'à la livraison.
    </p>
    ${divider()}
    <div style="background:#f8f5f2;border-radius:10px;padding:20px;margin:16px 0;">
      <p style="margin:0 0 4px;color:#9a9085;font-size:12px;">Numéro de commande</p>
      <p style="margin:0;font-size:18px;font-weight:bold;color:#5a6a8a;letter-spacing:2px;font-family:monospace;">#${shortId}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      ${itemsList}
      <tr><td colspan="3"><hr style="border:none;border-top:1px solid #f0e8e0;margin:8px 0;"></td></tr>
      <tr>
        <td colspan="2" style="font-weight:bold;color:#2c3e50;padding:8px 0;">Total</td>
        <td style="font-weight:bold;font-size:16px;text-align:right;color:#5a6a8a;">${total.toFixed(2)} €</td>
      </tr>
    </table>
    <p style="color:#9a9085;font-size:13px;">
      ⏱️ Votre commande sera confirmée dans les 24 heures
    </p>
  `
  return {
    subject: isAr ? `تم استلام طلبك #${shortId} — Stabena` : `Commande reçue #${shortId} — Stabena`,
    html: baseLayout(content, lang)
  }
}

// ============================================
// 3. COMMANDE CONFIRMÉE (status: confirmed)
// ============================================
export const orderConfirmedEmail = (name, orderId, lang = 'fr') => {
  const isAr = lang === 'ar'
  const shortId = orderId.slice(0, 8).toUpperCase()
  const content = isAr ? `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;font-family:Arial,sans-serif;">
      طلبك تم تأكيده، ${name}! ✅
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;font-family:Arial,sans-serif;">
      يسعدنا إخبارك أن طلبك قد تم تأكيده رسمياً من قِبَل فريق Stabena.<br>
      سنبدأ في تجهيزه الآن وسنُعلمك فور شحنه.
    </p>
    ${divider()}
    <div style="text-align:center;padding:20px;">
      ${statusBadge('✅ مؤكد', '#4a7c59')}
      <p style="margin:12px 0 0;color:#9a9085;font-size:13px;font-family:Arial,sans-serif;">طلب رقم #${shortId}</p>
    </div>
    <p style="color:#6b7280;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;">
      📦 يتم الآن تجهيز طلبك<br>
      🚚 ستصلك رسالة أخرى عند الشحن
    </p>
  ` : `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;">
      Votre commande est confirmée, ${name} ! ✅
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;">
      Bonne nouvelle ! Votre commande a été officiellement confirmée par notre équipe Stabena.<br>
      Nous allons maintenant la préparer avec soin et vous préviendrons dès l'expédition.
    </p>
    ${divider()}
    <div style="text-align:center;padding:20px;">
      ${statusBadge('✅ Confirmée', '#4a7c59')}
      <p style="margin:12px 0 0;color:#9a9085;font-size:13px;">Commande #${shortId}</p>
    </div>
    <p style="color:#6b7280;font-size:14px;line-height:1.8;">
      📦 Votre commande est en cours de préparation<br>
      🚚 Vous recevrez un email dès l'expédition
    </p>
  `
  return {
    subject: isAr ? `طلبك #${shortId} تم تأكيده ✅` : `Commande #${shortId} confirmée ✅`,
    html: baseLayout(content, lang)
  }
}

// ============================================
// 4. COMMANDE EXPÉDIÉE (status: shipped)
// ============================================
export const orderShippedEmail = (name, orderId, lang = 'fr') => {
  const isAr = lang === 'ar'
  const shortId = orderId.slice(0, 8).toUpperCase()
  const content = isAr ? `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;font-family:Arial,sans-serif;">
      طلبك في الطريق إليك، ${name}! 🚚
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;font-family:Arial,sans-serif;">
      رائع! تم شحن طلبك وهو الآن في طريقه إليك.<br>
      احتفظ بهذا البريد كمرجع لمتابعة طلبك.
    </p>
    ${divider()}
    <div style="text-align:center;padding:20px;">
      ${statusBadge('🚚 تم الشحن', '#8b5cf6')}
      <p style="margin:12px 0 0;color:#9a9085;font-size:13px;font-family:Arial,sans-serif;">طلب رقم #${shortId}</p>
    </div>
    <div style="background:#f8f5f2;border-radius:10px;padding:20px;margin:16px 0;font-family:Arial,sans-serif;">
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.8;">
        📍 ستصلك الطرد خلال الأيام القليلة القادمة<br>
        📞 للاستفسار، تواصل معنا عبر البريد الإلكتروني
      </p>
    </div>
  ` : `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;">
      Votre commande est en route, ${name} ! 🚚
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;">
      Super nouvelle ! Votre commande a été expédiée et est maintenant en chemin vers vous.<br>
      Conservez cet email comme référence.
    </p>
    ${divider()}
    <div style="text-align:center;padding:20px;">
      ${statusBadge('🚚 Expédiée', '#8b5cf6')}
      <p style="margin:12px 0 0;color:#9a9085;font-size:13px;">Commande #${shortId}</p>
    </div>
    <div style="background:#f8f5f2;border-radius:10px;padding:20px;margin:16px 0;">
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.8;">
        📍 Votre colis arrivera dans les prochains jours<br>
        📞 Pour toute question, contactez-nous par email
      </p>
    </div>
  `
  return {
    subject: isAr ? `طلبك #${shortId} تم شحنه 🚚` : `Commande #${shortId} expédiée 🚚`,
    html: baseLayout(content, lang)
  }
}

// ============================================
// 5. COMMANDE LIVRÉE (status: delivered)
// ============================================
export const orderDeliveredEmail = (name, orderId, items = [], lang = 'fr') => {
  const isAr = lang === 'ar'
  const shortId = orderId.slice(0, 8).toUpperCase()
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const reviewRows = items.map(item => {
    const reviewUrl = `${BASE_URL}/products/${item.slug}?review=1`
    return isAr
      ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0e8e0;font-family:Arial,sans-serif;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${item.image ? `<img src="${item.image}" width="40" height="50" style="object-fit:cover;border-radius:4px;" />` : ''}
              <span style="font-size:14px;color:#2c3e50;">${item.name}</span>
            </div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0e8e0;text-align:left;">
            <a href="${reviewUrl}" style="display:inline-block;padding:6px 14px;background:#f59e0b;color:white;text-decoration:none;border-radius:50px;font-size:12px;font-family:Arial,sans-serif;">
              ⭐ قيّم المنتج
            </a>
          </td>
        </tr>`
      : `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0e8e0;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${item.image ? `<img src="${item.image}" width="40" height="50" style="object-fit:cover;border-radius:4px;" />` : ''}
              <span style="font-size:14px;color:#2c3e50;">${item.name}</span>
            </div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0e8e0;text-align:right;">
            <a href="${reviewUrl}" style="display:inline-block;padding:6px 14px;background:#f59e0b;color:white;text-decoration:none;border-radius:50px;font-size:12px;">
              ⭐ Laisser un avis
            </a>
          </td>
        </tr>`
  }).join('')

  const content = isAr ? `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;font-family:Arial,sans-serif;">
      وصل طلبك! نأمل أنك راضٍ، ${name} 🎁
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;font-family:Arial,sans-serif;">
      يسعدنا إخبارك أن طلبك #${shortId} قد تم تسليمه.<br>
      رأيك يهمنا كثيراً ويساعد الآخرين على اختيار الأفضل.
    </p>
    ${divider()}
    <p style="font-size:15px;font-weight:bold;color:#2c3e50;margin:0 0 12px;font-family:Arial,sans-serif;">
      ⭐️ قيّم مشترياتك
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">${reviewRows}</table>
    <p style="color:#9a9085;font-size:13px;text-align:center;margin-top:24px;font-family:Arial,sans-serif;">
      شكراً لثقتك في Stabena ❤️
    </p>
  ` : `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;">
      Votre commande est arrivée, ${name} ! 🎁
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;">
      Votre commande #${shortId} a bien été livrée.<br>
      Votre avis compte énormément et aide d'autres clients à faire leur choix.
    </p>
    ${divider()}
    <p style="font-size:15px;font-weight:bold;color:#2c3e50;margin:0 0 12px;">
      ⭐️ Notez vos articles
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">${reviewRows}</table>
    <p style="color:#9a9085;font-size:13px;text-align:center;margin-top:24px;">
      Merci de votre confiance chez Stabena ❤️
    </p>
  `
  return {
    subject: isAr ? `طلبك #${shortId} تم تسليمه — شاركنا رأيك! ⭐️` : `Commande #${shortId} livrée — Partagez votre avis ! ⭐️`,
    html: baseLayout(content, lang)
  }
}

// ============================================
// 6. COMMANDE ANNULÉE (status: cancelled)
// ============================================
export const orderCancelledEmail = (name, orderId, lang = 'fr') => {
  const isAr = lang === 'ar'
  const shortId = orderId.slice(0, 8).toUpperCase()
  const content = isAr ? `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;font-family:Arial,sans-serif;">
      تم إلغاء طلبك، ${name} 😔
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;font-family:Arial,sans-serif;">
      نأسف لإخبارك أن طلبك رقم #${shortId} قد تم إلغاؤه.<br>
      إذا كنت تعتقد أن هذا الإلغاء خطأ أو لديك أي استفسار، لا تتردد في التواصل معنا.
    </p>
    ${divider()}
    <div style="text-align:center;padding:20px;">
      ${statusBadge('❌ ملغى', '#ef4444')}
      <p style="margin:12px 0 0;color:#9a9085;font-size:13px;font-family:Arial,sans-serif;">طلب رقم #${shortId}</p>
    </div>
    <div style="background:#fff5f5;border-radius:10px;padding:20px;margin:16px 0;border:1px solid #fecaca;font-family:Arial,sans-serif;">
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.8;">
        💳 إذا دفعت مسبقاً، سيتم استرداد المبلغ خلال 3-5 أيام عمل<br>
        📧 للاستفسار: <a href="mailto:supportstabena@gmail.com" style="color:#5a6a8a;">supportstabena@gmail.com</a>
      </p>
    </div>
    <div style="text-align:center;margin-top:20px;">
      ${btn('تصفح منتجاتنا →', 'http://localhost:3000/products', STABENA_COLOR)}
    </div>
  ` : `
    <h2 style="color:#2c3e50;font-size:22px;margin:0 0 8px;">
      Votre commande a été annulée, ${name} 😔
    </h2>
    <p style="color:#6b7280;font-size:15px;line-height:1.8;margin:0 0 20px;">
      Nous sommes désolés de vous informer que votre commande #${shortId} a été annulée.<br>
      Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions, n'hésitez pas à nous contacter.
    </p>
    ${divider()}
    <div style="text-align:center;padding:20px;">
      ${statusBadge('❌ Annulée', '#ef4444')}
      <p style="margin:12px 0 0;color:#9a9085;font-size:13px;">Commande #${shortId}</p>
    </div>
    <div style="background:#fff5f5;border-radius:10px;padding:20px;margin:16px 0;border:1px solid #fecaca;">
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.8;">
        💳 Si vous avez été prélevé, le remboursement sera effectué sous 3-5 jours ouvrés<br>
        📧 Pour toute question : <a href="mailto:supportstabena@gmail.com" style="color:#5a6a8a;">supportstabena@gmail.com</a>
      </p>
    </div>
    <div style="text-align:center;margin-top:20px;">
      ${btn('Continuer mes achats →', 'http://localhost:3000/products', STABENA_COLOR)}
    </div>
  `
  return {
    subject: isAr ? `طلبك #${shortId} تم إلغاؤه` : `Commande #${shortId} annulée`,
    html: baseLayout(content, lang)
  }
}

// Map status → template
export const getEmailForStatus = (status, name, orderId, items, total, lang) => {
  switch (status) {
    case 'confirmed': return orderConfirmedEmail(name, orderId, lang)
    case 'shipped':   return orderShippedEmail(name, orderId, lang)
    case 'delivered': return orderDeliveredEmail(name, orderId, items, lang)
    case 'cancelled': return orderCancelledEmail(name, orderId, lang)
    default: return null
  }
}
