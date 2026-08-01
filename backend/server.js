const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CONFIGURATION DES LIMITES & CORS
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 2. CONFIGURATION CLOUDINARY (stockage persistant des photos)
// Variable à définir sur Render : CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
// Le SDK Cloudinary détecte automatiquement cette variable d'environnement,
// aucun cloudinary.config({...}) manuel n'est nécessaire.

// 2bis. DOSSIER FRONTEND (sert le HTML/CSS/JS statique du frontend)
// Structure : FORMULAIRE/backend/server.js  et  FORMULAIRE/frontend/*
const frontendDir = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendDir));

// 3. CONNEXION POSTGRESQL
// Sur Render, utilise DATABASE_URL fourni automatiquement par le service Postgres.
// En local, tu peux soit définir DATABASE_URL, soit les variables DB_HOST/DB_USER/etc.
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false }
      })
    : new Pool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "fimpisava_user",
        password: process.env.DB_PASS || "TSIMANIA",
        database: process.env.DB_NAME || "fimpisava_db",
        port: process.env.DB_PORT || 5432,
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
      });

pool.connect((err) => {
    if (err) {
        console.error("❌ Erreur de connexion PostgreSQL :", err.message);
    } else {
        console.log("✅ Connecté à PostgreSQL");
    }
});

// Fonction pour envoyer la chaîne Base64 vers Cloudinary et récupérer l'URL publique
async function uploadBase64Image(photoData, prefix = "formation") {
    if (!photoData || typeof photoData !== "string" || !photoData.startsWith("data:image")) {
        return "default.jpg";
    }

    const publicId = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}`;

    const result = await cloudinary.uploader.upload(photoData, {
        folder: "fimpisava",
        public_id: publicId,
        resource_type: "image"
    });

    return result.secure_url; // URL https:// stockée directement en base
}

// 4. ROUTE D'ADHESION
app.post("/adhesion", async (req, res) => {
    const { nom, prenom, email, tel, filiere, adresse, province, region, district, sexe, photoData, photo } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ error: "Nom et prénom sont requis." });
    }

    try {
        // 1. Upload de la photo vers Cloudinary
        const imageToSave = photoData || photo;
        const photoUrl = await uploadBase64Image(imageToSave, "adhesion");

        // 2. Requête SQL PostgreSQL (placeholders $1, $2... + RETURNING id)
        const sql = `INSERT INTO adhesions
            (nom, prenom, email, telephone, filiere, adresse, province, region, district, sexe, created_at, photo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
            RETURNING id`;

        const values = [nom, prenom, email, tel, filiere, adresse, province, region, district, sexe, photoUrl];

        const result = await pool.query(sql, values);
        console.log(`✅ Adhésion réussie ! Photo : ${photoUrl}`);
        res.status(201).json({ message: "Adhésion enregistrée avec succès !", id: result.rows[0].id });
    } catch (err) {
        console.error("❌ Erreur Adhésion :", err.message);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de l'adhésion." });
    }
});

// 5. ROUTE D'INSCRIPTION (/register)
app.post("/register", async (req, res) => {
    const { nom, prenom, email, tel, adresse, province, region, district, sexe, formations, photoData, photo } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ error: "Le nom et le prénom sont obligatoires." });
    }

    try {
        const imageToSave = photoData || photo;
        const photoUrl = await uploadBase64Image(imageToSave, "formation");
        const formationsText = Array.isArray(formations) ? formations.join(", ") : (formations || "Aucune");

        const sql = `INSERT INTO inscriptions_formations
            (nom, prenom, email, telephone, adresse, province, region, district, sexe, formations, photo, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            RETURNING id`;

        const values = [nom, prenom, email, tel, adresse, province, region, district, sexe, formationsText, photoUrl];

        const result = await pool.query(sql, values);
        console.log(`✅ Inscription réussie ! Photo : ${photoUrl}`);
        res.status(201).json({ message: "Inscription réussie !", id: result.rows[0].id, photoUrl });
    } catch (err) {
        console.error("❌ Erreur :", err.message);
        res.status(500).json({ error: "Erreur lors de l'enregistrement." });
    }
});

// 6. ROUTES ADMIN
app.get("/admin/adhesions", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM adhesions ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/admin/formations", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM inscriptions_formations ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. CATCH-ALL : sert index.html pour toute route non-API (navigation directe par URL)
app.get(/^(?!\/(adhesion|register|admin)).*/, (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur FIMPISAVA prêt sur http://localhost:${PORT}`);
});
