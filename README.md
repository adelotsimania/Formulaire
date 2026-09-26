# FIMPISAVA

Site de l'association FIMPISAVA (Fikambanana Mpianatra SAVA)

## Structure du projet

```
fimpisava/          → frontend React (ce dossier)
fimpisava/backend/   → API Express + PostgreSQL (TypeScript)
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

# --- Base de données ---
# Option A : une URL unique (utile pour un service distant type Neon)
DATABASE_URL=postgresql://user:password@host:5432/fimpisava_db
DB_SSL=true

# Option B : identifiants séparés (utilisé pour un PostgreSQL local)
# Laisse DATABASE_URL vide/absent pour forcer l'utilisation de cette config
DB_HOST=localhost
DB_PORT=5432
DB_USER=fimpisava_user
DB_PASS=change-moi
DB_NAME=fimpisava_db
DB_SSL=false

# Authentification admin (utilisée sur /admin)
ADMIN_USER=admin
ADMIN_PASS=change-moi

# Stockage des images (optionnel en local, voir note ci-dessous)
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Envoi d'emails (optionnel en local)
RESEND_API_KEY=re_xxxxxxxx
```

## 3. Créer le schéma de la base de données

Une fois la base PostgreSQL créée (localement ou via ton hébergeur), exécute
le script de schéma fourni :

```bash
psql -U fimpisava_user -d fimpisava_db -f backend/init-db.sql
```

Ça crée les tables `adhesions` et `inscriptions_formations` nécessaires au
fonctionnement du site. À faire une seule fois (ou à chaque fois que tu
repars d'une base vide).

## 4. Lancer en développement

Deux terminaux séparés :

```bash
# Terminal 1 - API (compile le TypeScript puis lance le serveur)
cd fimpisava/backend
npm start
# → 🚀 Serveur FIMPISAVA prêt sur http://localhost:3000

# Terminal 2 - Frontend
cd fimpisava
npm run dev
# → ouvre l'URL affichée (en général http://localhost:5173)
```

Le frontend (Vite) appelle l'API sur `http://localhost:3000` grâce à `.env`.

> Le backend est écrit en TypeScript (`server.ts`) et compilé vers
> `dist-server/server.js` avant exécution — `npm start` gère cette étape
> automatiquement (build + lancement). Si tu veux uniquement recompiler sans
> lancer le serveur, regarde le script `build` dans `package.json`.

## 5. Build de production

```bash
cd fimpisava
npm run build
```

Génère `fimpisava/dist/`, que le serveur sert directement (voir
`frontendDir` dans `backend/server.ts`). Une fois le build fait, un seul
`npm start` dans `backend/` suffit à servir le site complet (front + API)
sur un même port.

## Déploiement

Les fichiers de déploiement (config nginx, notes PM2/VPS) sont préparés
séparément et ne font pas partie du dépôt - à demander si besoin au moment
de la mise en ligne.
