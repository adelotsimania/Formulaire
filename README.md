# FIMPISAVA

Site de l'association FIMPISAVA (Fikambanana Mpianatra SAVA), réécrit en
React + TypeScript (Vite) pour le frontend, avec un backend Express/PostgreSQL.

## Structure du projet

```
fimpisava/          → frontend React (ce dossier)
fimpisava/backend/   → API Express + PostgreSQL (server.js)
```

## Prérequis

- Node.js 18+ et npm
- Une base PostgreSQL accessible (locale, ou un service comme Neon)

## 1. Installer les dépendances

```bash
# Frontend
cd fimpisava
npm install

# Backend
cd backend
npm install
```

## 2. Configurer les variables d'environnement

**Frontend** - déjà en place à la racine de `fimpisava/` :
- `.env` → utilisé par `npm run dev` (pointe vers `http://localhost:3000`)
- `.env.production` → utilisé par `npm run build` (URL relative, même domaine que l'API)

**Backend** - créer un fichier `.env` dans `fimpisava/backend/` (non fourni, à
remplir avec tes propres identifiants) :

```
PORT=3000

# Base de données
DATABASE_URL=postgresql://user:password@host:5432/fimpisava_db
DB_SSL=true

# Authentification admin (utilisée sur /admin)
ADMIN_USER=admin
ADMIN_PASS=change-moi

# Stockage des images
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Envoi d'emails
RESEND_API_KEY=re_xxxxxxxx
```

⚠️ Ce fichier `.env` backend ne doit jamais être commité (vérifie qu'il est
dans `.gitignore`).

## 3. Lancer en développement

Deux terminaux séparés :

```bash
# Terminal 1 - API
cd fimpisava/backend
node server.js
# → 🚀 Serveur FIMPISAVA prêt sur http://localhost:3000

# Terminal 2 - Frontend
cd fimpisava
npm run dev
# → ouvre l'URL affichée (en général http://localhost:5173)
```

Le frontend (Vite) appelle l'API sur `http://localhost:3000` grâce à `.env`.

## 4. Build de production

```bash
cd fimpisava
npm run build
```

Génère `fimpisava/dist/`, que `server.js` sert directement (voir
`frontendDir` dans `backend/server.js`). Une fois le build fait, un seul
`node server.js` suffit à servir le site complet (front + API) sur un même
port.

## Déploiement

Les fichiers de déploiement (config nginx, notes PM2/VPS) sont préparés
séparément et ne font pas partie du dépôt - à demander si besoin au moment
de la mise en ligne.

## Comptes de test admin

L'espace `/admin` utilise l'authentification définie par `ADMIN_USER` /
`ADMIN_PASS` dans le `.env` du backend - aucun compte n'est stocké en base.
