// Portage de js/config.js : adhesion.js lit une variable globale `API_URL` avec
// un repli sur http://localhost:3000. En environnement Vite, l'équivalent est
// une variable d'env préfixée VITE_ (à définir dans un .env / .env.production).
//
// ⚠️ Je n'ai pas le contenu réel de js/config.js — si l'URL de prod n'est pas
// http://localhost:3000, ajoute VITE_API_URL=... dans ton .env.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
