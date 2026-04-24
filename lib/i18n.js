// lib/i18n.js - Système de traduction FR/AR

export const translations = {
  fr: {
    // Navbar
    nav_new: 'Nouveautés',
    nav_women: 'Femme',
    nav_men: 'Homme',
    nav_accessories: 'Accessoires',
    nav_sales: 'Soldes',
    nav_account: 'Mon compte',
    nav_orders: 'Mes commandes',
    nav_admin: 'Admin',
    nav_logout: 'Se déconnecter',
    nav_login: 'Connexion',

    // Hero
    hero_subtitle: 'Parfums · Beauté · Mode · Montres',
    hero_title: 'Bienvenue chez',
    hero_desc: 'Retrouvez vos parfums, montres, vêtements et produits de beauté préférés.',
    hero_discover: 'Découvrir',
    hero_sales: 'Soldes',

    // Home
    home_categories_title: 'Nos Univers',
    home_categories_sub: 'Explorer',
    home_featured_title: 'Coups de Cœur',
    home_featured_sub: 'Sélection',
    home_see_all: 'Tout voir',
    home_passion_sub: 'Notre passion',
    home_passion_title: "L'essence du luxe",
    home_passion_desc: "Nos parfums sont sélectionnés avec soin parmi les meilleures maisons de parfumerie. Chaque fragrance raconte une histoire unique.",
    home_discover_perfumes: 'Découvrir les parfums',
    home_banner_title: 'Livraison offerte dès 80$',
    home_banner_desc: 'Et retours gratuits sous 30 jours',
    home_banner_btn: 'Commencer mes achats',
    home_see_collection: 'Voir la collection',

    // Footer
    footer_collections: 'Collections',
    footer_service: 'Service',
    footer_newsletter: 'Newsletter',
    footer_newsletter_desc: 'Restez informés de nos nouveautés.',
    footer_rights: '© 2024 Stabena — Tous droits réservés',
    footer_delivery: 'Livraison',
    footer_returns: 'Retours',
    footer_faq: 'FAQ',
    footer_contact: 'Contact',

    // Products
    products_title: 'Tous les produits',
    products_count_one: 'article',
    products_count_many: 'articles',
    products_sort: 'Pertinence',
    products_sort_new: 'Nouveautés',
    products_sort_price_asc: 'Prix croissant',
    products_sort_price_desc: 'Prix décroissant',
    products_filters: 'Filtres',
    products_category: 'Catégorie',
    products_all: 'Toutes',
    products_size: 'Taille',
    products_max_price: 'Prix max',
    products_empty: 'Aucun produit trouvé',
    products_empty_desc: "Essayez d'autres filtres",

    // Product detail
    product_in_stock: '✓ En stock',
    product_low_stock: '⚠ Plus que',
    product_low_stock_2: 'en stock',
    product_out_of_stock: '✗ Épuisé',
    product_color: 'Couleur',
    product_size: 'Taille',
    product_add_cart: 'Ajouter au panier',
    product_adding: 'Ajout en cours...',
    product_delivery: 'Livraison offerte dès 80$',
    product_returns: 'Retours gratuits sous 30 jours',
    product_secure: 'Paiement 100% sécurisé',

    // Cart
    cart_title: 'Mon Panier',
    cart_empty: 'Votre panier est vide',
    cart_discover: 'Découvrir nos produits',
    cart_subtotal: 'Sous-total',
    cart_shipping: 'Livraison',
    cart_shipping_free: 'Offerte 🎁',
    cart_total: 'Total',
    cart_order: 'Commander',
    cart_more_free: 'Plus que',
    cart_more_free_2: '$ pour la livraison offerte !',
    cart_qty: 'Qté',

    // Checkout
    checkout_title: 'Adresse de livraison',
    checkout_name: 'Nom complet',
    checkout_street: 'Adresse',
    checkout_city: 'Ville',
    checkout_zip: 'Code postal',
    checkout_cancel: 'Annuler',
    checkout_confirm: 'Confirmer',
    checkout_sending: 'Envoi...',

    // Orders
    orders_title: 'Mes Commandes',
    orders_empty: "Aucune commande pour l'instant",
    orders_start: 'Commencer mes achats',
    orders_number: 'Commande #',
    orders_delivery_to: 'Livraison à',
    status_pending: 'En attente',
    status_confirmed: 'Confirmée',
    status_shipped: 'Expédiée',
    status_delivered: 'Livrée',
    status_cancelled: 'Annulée',

    // Login
    login_title: 'Connexion',
    login_register: 'Créer un compte',
    login_email: 'Adresse e-mail',
    login_password: 'Mot de passe',
    login_name: 'Nom complet',
    login_forgot: 'Mot de passe oublié ?',
    login_btn: 'Connexion',
    login_register_btn: "S'inscrire",
    login_loading: 'Chargement...',
    login_no_account: 'Pas encore de compte ?',
    login_has_account: 'Déjà un compte ?',
    login_back: '← Retour à la boutique',
    login_welcome: 'Bon retour chez Stabena',
    login_welcome_new: 'Rejoignez la communauté Stabena',

    // Account
    account_title: 'Mon Compte',
    account_name: 'Nom complet',
    account_phone: 'Téléphone',
    account_address: 'Adresse',
    account_save: 'Sauvegarder',
    account_saving: 'Sauvegarde...',
    account_saved: 'Profil mis à jour ✓',

    // Wishlist
    wishlist_title: 'Mes Favoris',
    wishlist_empty: "Aucun favori pour l'instant",
    wishlist_discover: 'Découvrir nos produits',

    // Search
    search_title: 'Recherche',
    search_placeholder: 'Rechercher un article...',
    search_btn: 'Chercher',
    search_results: 'résultat',
    search_for: 'pour',
    search_empty: 'Aucun résultat',
    search_empty_desc: "Essayez avec d'autres mots-clés",

    // Toasts
    toast_added_cart: 'Ajouté au panier ✓',
    toast_removed_cart: 'Article retiré',
    toast_login_required: 'Connectez-vous pour acheter',
    toast_choose_size: 'Choisissez une taille',
    toast_wishlist_add: 'Ajouté aux favoris ♡',
    toast_wishlist_remove: 'Retiré des favoris',
    toast_welcome: 'Bienvenue !',
    toast_goodbye: 'À bientôt !',
    toast_order_success: 'Commande confirmée ! 🎉',
    toast_order_error: 'Erreur lors de la commande',
    toast_fill_fields: 'Remplissez tous les champs',
    toast_wrong_credentials: 'Email ou mot de passe incorrect',
    toast_account_created: 'Compte créé ! Vérifiez votre email.',
    toast_profile_saved: 'Profil mis à jour ✓',

    // Contact
    contact_title: 'Contactez-nous',
    contact_subtitle: 'Nous sommes à votre écoute',
    contact_firstname: 'Prénom',
    contact_lastname: 'Nom',
    contact_phone: 'Téléphone',
    contact_email: 'Email',
    contact_subject: 'Objet',
    contact_message: 'Votre message',
    contact_send: 'Envoyer le message',
    contact_sending: 'Envoi en cours...',
    contact_success: 'Message envoyé ! Nous vous répondrons sous 24h.',
    contact_error: "Erreur lors de l'envoi. Réessayez.",
    contact_follow: 'Suivez-nous',
    contact_whatsapp_ar: 'WhatsApp (Arabe)',
    contact_whatsapp_fr: 'WhatsApp (France)',
    contact_required: 'Remplissez tous les champs obligatoires',

    // Retours
    returns_title: 'Politique de retour',
    returns_desc: 'Vous pouvez retourner vos articles gratuitement sous 30 jours après réception de votre commande.',
    returns_steps_title: 'Pour effectuer un retour :',
    returns_step_1: 'Contactez-nous via la page Contact',
    returns_step_2: 'Indiquez votre numéro de commande',
    returns_step_3: 'Précisez votre demande de retour',
    returns_footer: 'Notre équipe support vous contactera rapidement afin de vous accompagner dans la procédure.',

    // Admin
    admin_dashboard: 'Dashboard',
    admin_products: 'Produits',
    admin_orders: 'Commandes',
    admin_users: 'Clients',
    admin_categories: 'Catégories',
    admin_store: 'Voir la boutique',
    admin_logout: 'Déconnexion',
  },

  ar: {
    // Navbar
    nav_new: 'الجديد',
    nav_women: 'نساء',
    nav_men: 'رجال',
    nav_accessories: 'إكسسوارات',
    nav_sales: 'تخفيضات',
    nav_account: 'حسابي',
    nav_orders: 'طلباتي',
    nav_admin: 'الإدارة',
    nav_logout: 'تسجيل الخروج',
    nav_login: 'تسجيل الدخول',

    // Hero
    hero_subtitle: 'عطور · جمال · موضة · ساعات',
    hero_title: 'مرحباً بكم في',
    hero_desc: 'اكتشف عطورك المفضلة والساعات والملابس ومستحضرات التجميل.',
    hero_discover: 'اكتشف',
    hero_sales: 'العروض',

    // Home
    home_categories_title: 'عوالمنا',
    home_categories_sub: 'استكشف',
    home_featured_title: 'المختارات',
    home_featured_sub: 'تشكيلة مميزة',
    home_see_all: 'عرض الكل',
    home_passion_sub: 'شغفنا',
    home_passion_title: 'جوهر الفخامة',
    home_passion_desc: 'تم اختيار عطورنا بعناية فائقة من أفضل دور العطور. كل رائحة تحكي قصة فريدة.',
    home_discover_perfumes: 'اكتشف العطور',
    home_banner_title: 'شحن مجاني من 80$',
    home_banner_desc: 'وإرجاع مجاني خلال 30 يوماً',
    home_banner_btn: 'ابدأ التسوق',
    home_see_collection: 'عرض المجموعة',

    // Footer
    footer_collections: 'المجموعات',
    footer_service: 'خدماتنا',
    footer_newsletter: 'النشرة البريدية',
    footer_newsletter_desc: 'ابق على اطلاع بأحدث منتجاتنا.',
    footer_rights: '© 2024 ستابينا — جميع الحقوق محفوظة',
    footer_delivery: 'التوصيل',
    footer_returns: 'الإرجاع',
    footer_faq: 'الأسئلة الشائعة',
    footer_contact: 'اتصل بنا',

    // Products
    products_title: 'جميع المنتجات',
    products_count_one: 'منتج',
    products_count_many: 'منتجات',
    products_sort: 'الأكثر صلة',
    products_sort_new: 'الأحدث',
    products_sort_price_asc: 'السعر: الأقل أولاً',
    products_sort_price_desc: 'السعر: الأعلى أولاً',
    products_filters: 'تصفية',
    products_category: 'الفئة',
    products_all: 'الكل',
    products_size: 'المقاس',
    products_max_price: 'الحد الأقصى للسعر',
    products_empty: 'لا توجد منتجات',
    products_empty_desc: 'جرب فلاتر أخرى',

    // Product detail
    product_in_stock: '✓ متوفر',
    product_low_stock: '⚠ باقي فقط',
    product_low_stock_2: 'في المخزن',
    product_out_of_stock: '✗ نفد المخزون',
    product_color: 'اللون',
    product_size: 'المقاس',
    product_add_cart: 'أضف إلى السلة',
    product_adding: 'جاري الإضافة...',
    product_delivery: 'شحن مجاني من 80$',
    product_returns: 'إرجاع مجاني خلال 30 يوماً',
    product_secure: 'دفع آمن 100%',

    // Cart
    cart_title: 'سلة التسوق',
    cart_empty: 'سلتك فارغة',
    cart_discover: 'اكتشف منتجاتنا',
    cart_subtotal: 'المجموع الفرعي',
    cart_shipping: 'الشحن',
    cart_shipping_free: 'مجاني 🎁',
    cart_total: 'المجموع',
    cart_order: 'اطلب الآن',
    cart_more_free: 'أضف',
    cart_more_free_2: '$ للشحن المجاني!',
    cart_qty: 'الكمية',

    // Checkout
    checkout_title: 'عنوان التوصيل',
    checkout_name: 'الاسم الكامل',
    checkout_street: 'العنوان',
    checkout_city: 'المدينة',
    checkout_zip: 'الرمز البريدي',
    checkout_cancel: 'إلغاء',
    checkout_confirm: 'تأكيد',
    checkout_sending: 'جاري الإرسال...',

    // Orders
    orders_title: 'طلباتي',
    orders_empty: 'لا توجد طلبات حتى الآن',
    orders_start: 'ابدأ التسوق',
    orders_number: 'طلب #',
    orders_delivery_to: 'التوصيل إلى',
    status_pending: 'قيد الانتظار',
    status_confirmed: 'مؤكد',
    status_shipped: 'تم الشحن',
    status_delivered: 'تم التوصيل',
    status_cancelled: 'ملغى',

    // Login
    login_title: 'تسجيل الدخول',
    login_register: 'إنشاء حساب',
    login_email: 'البريد الإلكتروني',
    login_password: 'كلمة المرور',
    login_name: 'الاسم الكامل',
    login_forgot: 'نسيت كلمة المرور؟',
    login_btn: 'دخول',
    login_register_btn: 'إنشاء حساب',
    login_loading: 'جاري التحميل...',
    login_no_account: 'ليس لديك حساب؟',
    login_has_account: 'لديك حساب بالفعل؟',
    login_back: 'العودة إلى المتجر ←',
    login_welcome: 'مرحباً بعودتك إلى ستابينا',
    login_welcome_new: 'انضم إلى مجتمع ستابينا',

    // Account
    account_title: 'حسابي',
    account_name: 'الاسم الكامل',
    account_phone: 'رقم الهاتف',
    account_address: 'العنوان',
    account_save: 'حفظ',
    account_saving: 'جاري الحفظ...',
    account_saved: 'تم تحديث الملف الشخصي ✓',

    // Wishlist
    wishlist_title: 'المفضلة',
    wishlist_empty: 'لا توجد مفضلات حتى الآن',
    wishlist_discover: 'اكتشف منتجاتنا',

    // Search
    search_title: 'البحث',
    search_placeholder: 'ابحث عن منتج...',
    search_btn: 'بحث',
    search_results: 'نتيجة',
    search_for: 'لـ',
    search_empty: 'لا توجد نتائج',
    search_empty_desc: 'جرب كلمات بحث أخرى',

    // Toasts
    toast_added_cart: 'تمت الإضافة إلى السلة ✓',
    toast_removed_cart: 'تمت إزالة المنتج',
    toast_login_required: 'سجل دخولك للشراء',
    toast_choose_size: 'اختر المقاس',
    toast_wishlist_add: 'أضيف إلى المفضلة ♡',
    toast_wishlist_remove: 'أزيل من المفضلة',
    toast_welcome: 'أهلاً وسهلاً!',
    toast_goodbye: 'إلى اللقاء!',
    toast_order_success: 'تم تأكيد الطلب! 🎉',
    toast_order_error: 'حدث خطأ في الطلب',
    toast_fill_fields: 'يرجى ملء جميع الحقول',
    toast_wrong_credentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    toast_account_created: 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني.',
    toast_profile_saved: 'تم تحديث الملف الشخصي ✓',

    // Contact
    contact_title: 'تواصل معنا',
    contact_subtitle: 'نحن هنا للمساعدة',
    contact_firstname: 'الاسم الأول',
    contact_lastname: 'اسم العائلة',
    contact_phone: 'الهاتف',
    contact_email: 'البريد الإلكتروني',
    contact_subject: 'الموضوع',
    contact_message: 'رسالتك',
    contact_send: 'إرسال الرسالة',
    contact_sending: 'جاري الإرسال...',
    contact_success: 'تم إرسال رسالتك! سنرد عليك خلال 24 ساعة.',
    contact_error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    contact_follow: 'تابعنا',
    contact_whatsapp_ar: 'واتساب (العرب)',
    contact_whatsapp_fr: 'واتساب (فرنسا)',
    contact_required: 'يرجى ملء جميع الحقول المطلوبة',

    // Retours
    returns_title: 'سياسة الإرجاع',
    returns_desc: 'يمكنك إرجاع منتجاتك مجاناً خلال 30 يوماً من استلام الطلب.',
    returns_steps_title: 'لإجراء عملية إرجاع:',
    returns_step_1: 'تواصل معنا عبر صفحة الاتصال',
    returns_step_2: 'اذكر رقم الطلب الخاص بك',
    returns_step_3: 'حدد طلب الإرجاع',
    returns_footer: 'سيقوم فريق الدعم بالتواصل معك سريعاً لمساعدتك في إتمام العملية.',

    // Admin
    admin_dashboard: 'لوحة التحكم',
    admin_products: 'المنتجات',
    admin_orders: 'الطلبات',
    admin_users: 'العملاء',
    admin_categories: 'الفئات',
    admin_store: 'عرض المتجر',
    admin_logout: 'تسجيل الخروج',
  }
}

export const detectLanguage = () => {
  if (typeof window === 'undefined') return 'fr'
  const saved = localStorage.getItem('stabena_lang')
  if (saved) return saved
  const browserLang = navigator.language || navigator.languages?.[0] || 'fr'
  return browserLang.startsWith('ar') ? 'ar' : 'fr'
}

export const saveLanguage = (lang) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('stabena_lang', lang)
  }
}
