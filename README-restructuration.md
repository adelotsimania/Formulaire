# Restructuration CSS — FIMPISAVA

## 1. Nouvelle arborescence à créer

```
src/assets/styles/
├── global/                  ← chargé UNE SEULE FOIS, globalement, dans main.tsx
│   ├── variables.css        (nouveau)
│   ├── reset.css            (nouveau)
│   ├── shared.css           (nouveau — .eyebrow, .page, .page-intro)
│   ├── layout.css           (nouveau — header/footer + mini-header/mini-footer)
│   └── dark-theme.css       (déplacé depuis assets/styles/, contenu inchangé)
└── pages/                   ← chargé UNIQUEMENT dans le composant de la page
    ├── home.css             (remplace l'ancien home.css)
    ├── orientation.css      (inchangé, juste déplacé)
    ├── inscription.css      (remplace l'ancien, sert à Inscription ET Adhesion)
    ├── confirmation.css     (corrigé : ne redéfinit plus .mini-header/.mini-footer)
    └── admin.css             (inchangé, juste déplacé)
```

Supprimer les anciens `assets/styles/home.css`, `inscription.css`, `orientation.css`,
`confirmation.css`, `admin.css`, `dark-theme.css` à la racine une fois la migration faite.

## 2. Imports à modifier, fichier par fichier

**`src/main.tsx`** — ajouter tous les imports globaux (voir fichier fourni) :
```ts
import './assets/styles/global/variables.css';
import './assets/styles/global/reset.css';
import './assets/styles/global/shared.css';
import './assets/styles/global/layout.css';
import './assets/styles/global/dark-theme.css';
```

**`src/layouts/MainLayout.tsx`** — aucun import CSS nécessaire (tout est global désormais).

**`src/layouts/FormLayout.tsx`** — aucun import CSS nécessaire.

**`src/pages/Home.tsx`** — changer le chemin d'import :
```ts
import '../assets/styles/pages/home.css';
```

**`src/pages/Orientation.tsx`** — AJOUTER (absent actuellement) :
```ts
import '../assets/styles/pages/orientation.css';
```
+ remplacer `<main className="page orientation-page">` par
`<div className="page orientation-page">` (et la balise fermante correspondante).

**`src/pages/Inscription.tsx`** — AJOUTER (absent actuellement) :
```ts
import '../assets/styles/pages/inscription.css';
```

**`src/pages/Adhesion.tsx`** — AJOUTER (absent actuellement) :
```ts
import '../assets/styles/pages/inscription.css';
```
(même feuille de style que Inscription — elles partagent `.form`/`.block`/`.grid`)

**`src/pages/Confirmation.tsx`** — AJOUTER (absent actuellement) :
```ts
import '../assets/styles/pages/confirmation.css';
```

**`src/pages/Admin.tsx`** — AJOUTER (absent actuellement) :
```ts
import '../assets/styles/pages/admin.css';
```

## 3. Pourquoi c'était cassé

Avant cette restructuration, seul `Home.tsx` importait un fichier CSS
(`home.css`). `AppRoutes.tsx` important toutes les pages de façon statique,
Vite bundlait tout en un seul paquet — et comme aucune autre page n'important
son CSS, `inscription.css`, `orientation.css`, `confirmation.css`, `admin.css`
et `dark-theme.css` n'étaient **jamais inclus dans le bundle**, donc jamais
appliqués. Chaque page doit désormais importer explicitement son propre CSS
(page-specific), pendant que le CSS partagé (variables, reset, header/footer)
est chargé une seule fois dans `main.tsx`.

## 4. Le bug de collision `.mini-header` évité

`Confirmation.tsx` s'affiche à l'intérieur de `FormLayout`, qui rend le vrai
`.mini-header`/`.mini-footer`. L'ancien `confirmation.css` redéfinissait ces
mêmes classes avec un style différent (pas de fond navy, padding différent) :
si on l'avait importé tel quel, le header aurait eu une apparence différente
sur `/confirmation` par rapport aux autres pages de `FormLayout`. Le nouveau
`confirmation.css` ne touche plus à `.mini-header`/`.mini-footer` — ce style
vit uniquement dans `global/layout.css`, sur toutes les routes de `FormLayout`.
