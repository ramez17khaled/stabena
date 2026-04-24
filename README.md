# 🛍️ Maison Mode — Guide Complet de Déploiement

Stack : **Next.js 14 + Supabase + Tailwind CSS + Vercel**
Coût : **0€** (dans les limites des free tiers)

---

## 📁 Structure du projet

```
fashion-store/
├── components/
│   ├── admin/
│   │   └── AdminLayout.js       ← Sidebar admin
│   ├── shared/
│   │   └── Navbar.js            ← Navigation principale
│   └── user/
│       └── ProductCard.js       ← Carte produit
├── lib/
│   └── supabase.js              ← TOUTES les fonctions API
├── pages/
│   ├── admin/
│   │   ├── index.js             ← Dashboard admin
│   │   ├── products.js          ← Gestion produits
│   │   ├── orders.js            ← Gestion commandes
│   │   ├── users.js             ← Gestion clients
│   │   └── categories.js        ← Gestion catégories
│   ├── products/
│   │   ├── index.js             ← Liste produits
│   │   └── [slug].js            ← Détail produit
│   ├── _app.js                  ← Auth context global
│   ├── index.js                 ← Page d'accueil
│   ├── login.js                 ← Connexion / Inscription
│   ├── cart.js                  ← Panier + checkout
│   ├── orders.js                ← Mes commandes
│   ├── account.js               ← Mon compte
│   ├── wishlist.js              ← Mes favoris
│   └── search.js                ← Recherche
├── styles/
│   └── globals.css              ← Styles globaux
├── supabase_schema.sql          ← Base de données complète
├── .env.local.example           ← Variables d'env à remplir
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 ÉTAPE 1 — Créer la base de données Supabase

1. Allez sur **https://supabase.com** → Créez un compte gratuit
2. Cliquez **"New Project"** → Donnez un nom → Choisissez un mot de passe fort
3. Attendez ~2 minutes que le projet démarre
4. Dans le menu gauche → **SQL Editor**
5. Copiez-collez tout le contenu de `supabase_schema.sql`
6. Cliquez **"Run"** ✅

---

## 🔑 ÉTAPE 2 — Récupérer vos clés API

Dans Supabase → **Settings** → **API** :

- Copiez **Project URL** → c'est votre `NEXT_PUBLIC_SUPABASE_URL`
- Copiez **anon public** → c'est votre `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Créez un fichier `.env.local` à la racine :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 💻 ÉTAPE 3 — Lancer en local

```bash
# 1. Installez les dépendances
npm install

# 2. Lancez le serveur de développement
npm run dev

# 3. Ouvrez http://localhost:3000
```

---

## 👑 ÉTAPE 4 — Créer votre compte Admin

1. Allez sur `http://localhost:3000/login`
2. Créez un compte avec votre email
3. Dans Supabase → **Table Editor** → Table **profiles**
4. Trouvez votre ligne → cliquez sur le champ `role`
5. Changez `user` en `admin` → Sauvegardez
6. Rechargez la page → Vous verrez le menu **Admin** dans la navbar

---

## 🌐 ÉTAPE 5 — Déployer sur Vercel (gratuit)

1. Allez sur **https://vercel.com** → Créez un compte avec GitHub
2. Pushez votre code sur GitHub :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE-USERNAME/fashion-store.git
   git push -u origin main
   ```
3. Dans Vercel → **"New Project"** → Importez votre repo GitHub
4. Dans **Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL` = votre URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre clé anon
5. Cliquez **Deploy** → Votre site est en ligne ! 🎉

---

## ✨ Fonctionnalités incluses

### Interface CLIENT
- ✅ Page d'accueil avec hero, catégories, produits vedette
- ✅ Catalogue avec filtres (catégorie, taille, prix, soldes)
- ✅ Page détail produit (images, tailles, couleurs, stock)
- ✅ Panier avec gestion des quantités
- ✅ Checkout avec adresse de livraison
- ✅ Historique des commandes avec statuts
- ✅ Liste de favoris (wishlist)
- ✅ Page compte avec édition du profil
- ✅ Recherche de produits
- ✅ Inscription / Connexion

### Interface ADMIN (/admin)
- ✅ Dashboard avec statistiques (commandes, produits, clients, revenus)
- ✅ Gestion produits (créer, modifier, supprimer)
- ✅ Gestion commandes (voir détails, changer statut)
- ✅ Gestion clients (voir liste, changer rôle admin/user)
- ✅ Gestion catégories (créer, supprimer)

---

## 🎨 Personnalisation

### Changer les couleurs
Dans `styles/globals.css`, modifiez les variables CSS :
```css
:root {
  --color-accent: #c4956a;    /* couleur principale dorée */
  --color-primary: #1a1a1a;  /* noir */
  --color-bg: #faf8f5;       /* fond crème */
}
```

### Changer le nom de la boutique
Recherchez `Maison Mode` dans tous les fichiers et remplacez.

### Ajouter des produits
- Via l'interface admin → `/admin/products` → "Nouveau produit"
- Ou directement dans Supabase → Table Editor → products

### Ajouter des images
Les images sont des URLs. Vous pouvez utiliser :
- **Cloudinary** (gratuit jusqu'à 25GB) pour héberger vos propres images
- **Unsplash** pour des images de test gratuites
- N'importe quelle URL d'image publique

---

## 💳 Ajouter le paiement Stripe (optionnel)

Si vous voulez accepter de vrais paiements (frais : ~1.5% + 0.25€/transaction) :

1. Créez un compte sur **https://stripe.com**
2. Installez Stripe : `npm install stripe @stripe/stripe-js`
3. Ajoutez dans `.env.local` :
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Créez une route API `pages/api/create-checkout-session.js`

---

## 🐛 Problèmes fréquents

**"relation does not exist"** → Vous n'avez pas exécuté le SQL dans Supabase

**Page blanche admin** → Votre compte n'est pas encore en mode "admin" dans la table profiles

**Images qui ne s'affichent pas** → Ajoutez le domaine dans `next.config.js` → `images.domains`

**Erreur CORS** → Vérifiez que vos variables d'env sont bien renseignées

---

## 📞 Structure de la base de données

| Table | Description |
|-------|-------------|
| `profiles` | Infos utilisateurs (nom, rôle, adresse) |
| `categories` | Catégories de produits |
| `products` | Produits avec prix, stock, images |
| `orders` | Commandes avec statut et adresse |
| `order_items` | Lignes de chaque commande |
| `cart_items` | Panier en cours |
| `wishlist` | Favoris par utilisateur |
