// En dev (npm run dev), VITE_API_URL vient de .env → http://localhost:3000
// (Vite et Express tournent sur deux ports différents).
//
// En prod sur le VPS, .env.production définit VITE_API_URL="" (vide) : le front
// et l'API sont servis depuis le même domaine par server.js, donc les appels
// peuvent être relatifs (fetch('/register') au lieu de fetch('https://.../register')).
// Une chaîne vide reste une chaîne vide avec ??, donc le fallback ne s'applique
// que si la variable est complètement absente.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
