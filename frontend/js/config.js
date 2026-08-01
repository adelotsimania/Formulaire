// Adresse de ton backend API.
// - En local (localhost / 127.0.0.1) : http://localhost:3000
// - En production (Render) : chaîne vide "" -> les fetch utilisent des chemins
//   relatifs (/adhesion, /register, /admin/...) car frontend et backend
//   sont servis par le MÊME service Node.js, donc même origine.
const API_URL =
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:3000"
        : "";
