# 📧 Configuration des Emails Automatiques — Stabena

## Étape 1 — Ajouter les colonnes Supabase

Dans **Supabase → SQL Editor**, exécutez :

```sql
-- Colonnes pour le système d'emails
alter table public.profiles 
  add column if not exists lang text default 'fr',
  add column if not exists welcome_sent boolean default false;
```

## Étape 2 — Créer un compte Resend (gratuit)

1. Allez sur **https://resend.com** → Sign up
2. **Settings → API Keys** → Create API Key → copiez la clé
3. **Settings → Domains** → Add Domain → ajoutez votre domaine

> ⚠️ **Pour Gmail** : Resend ne permet pas d'envoyer depuis @gmail.com directement.
> Options :
> - Utilisez un domaine personnalisé (ex: `noreply@stabena.com`) → le plus professionnel
> - Ou utilisez l'adresse Resend par défaut : `onboarding@resend.dev` (pour tester)

## Étape 3 — Configurer le .env.local

Ajoutez dans votre fichier `.env.local` :

```
RESEND_API_KEY=re_votre_cle_api
```

## Étape 4 — Mettre à jour l'adresse expéditeur

Dans `pages/api/send-email.js`, ligne `from` :

```javascript
// Pour tester sans domaine :
from: 'Stabena <onboarding@resend.dev>',

// Avec votre domaine vérifié :
from: 'Stabena <noreply@stabena.com>',
```

## Emails envoyés automatiquement

| Événement | Déclencheur |
|-----------|-------------|
| 🎉 Bienvenue | À la première connexion après inscription |
| 🛍️ Commande reçue | Quand le client passe une commande |
| ✅ Commande confirmée | Admin change statut → "confirmée" |
| 🚚 Commande expédiée | Admin change statut → "expédiée" |
| 🎁 Commande livrée | Admin change statut → "livrée" (+ invitation avis) |
| ❌ Commande annulée | Admin change statut → "annulée" |

## Langue des emails

Les emails sont envoyés en FR ou AR selon le champ `lang` du profil client.
Par défaut : français. Le client peut changer sa langue via le switcher FR/ع dans la navbar
(il faudra sauvegarder ce choix dans son profil — voir ci-dessous).
