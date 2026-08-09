const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CONFIGURATION DES LIMITES & CORS
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 2. CONFIGURATION CLOUDINARY (stockage persistant des photos)
// Variable à définir sur Render : CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"

// 2bis. CONFIGURATION RESEND (envoi d'emails de confirmation)
// Variable à définir sur Render : RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

// En mode test (sans domaine vérifié), Resend n'autorise l'envoi que vers cette adresse.
// Remplace-la par la tienne si besoin. Une fois un domaine vérifié, on pourra
// envoyer aux vraies adresses des inscrits.
const TEST_EMAIL_RECEIVER = "adelotsimania@gmail.com";

async function sendConfirmationEmail(destinataire, prenom, type) {
    try {
        const sujet = type === "adhesion"
            ? "Confirmation de votre adhésion à FIMPISAVA"
            : "Confirmation de votre inscription aux formations FIMPISAVA";

        const texte = type === "adhesion"
            ? `Bonjour ${prenom},\n\nVotre adhésion à FIMPISAVA a bien été enregistrée. Merci de nous avoir rejoints !\n\nL'équipe FIMPISAVA`
            : `Bonjour ${prenom},\n\nVotre inscription aux formations FIMPISAVA a bien été enregistrée. Nous vous recontacterons prochainement.\n\nL'équipe FIMPISAVA`;

        await resend.emails.send({
            from: "FIMPISAVA <onboarding@resend.dev>",
            to: TEST_EMAIL_RECEIVER,
            subject: sujet,
            text: texte
        });

        console.log(`📧 Email de confirmation envoyé (destinataire réel visé : ${destinataire})`);
    } catch (err) {
        // Un échec d'email ne doit jamais faire planter l'inscription elle-même
        console.error("⚠️ Erreur envoi email (inscription quand même enregistrée) :", err.message);
    }
}

// 2ter. DOSSIER FRONTEND (sert le HTML/CSS/JS statique du frontend)
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

// IMPORTANT : sans ce gestionnaire, une connexion fermée par Neon en arrière-plan
// (ex: inactivité) fait planter TOUT le serveur Node.js (crash total).
pool.on("error", (err) => {
    console.error("⚠️ Erreur inattendue sur le pool PostgreSQL (serveur toujours actif) :", err.message);
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

    return result.secure_url;
}

// 4. ROUTE D'ADHESION
app.post("/adhesion", async (req, res) => {
    const { nom, prenom, email, tel, filiere, adresse, province, region, district, sexe, photoData, photo } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ error: "Nom et prénom sont requis." });
    }

    try {
        const imageToSave = photoData || photo;
        const photoUrl = await uploadBase64Image(imageToSave, "adhesion");

        const sql = `INSERT INTO adhesions
            (nom, prenom, email, telephone, filiere, adresse, province, region, district, sexe, created_at, photo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
            RETURNING id`;

        const values = [nom, prenom, email, tel, filiere, adresse, province, region, district, sexe, photoUrl];

        const result = await pool.query(sql, values);
        console.log(`✅ Adhésion réussie ! Photo : ${photoUrl}`);

        // Envoi de l'email de confirmation (n'empêche pas la réponse si ça échoue)
        sendConfirmationEmail(email, prenom, "adhesion");

        res.status(201).json({ message: "Adhésion enregistrée avec succès !", id: result.rows[0].id });
    } catch (err) {
        console.error("❌ Erreur Adhésion :", err.message);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de l'adhésion." });
    }
});

// 5. ROUTE D'INSCRIPTION (/register)
app.post("/register", async (req, res) => {
    const {
        nom, prenom, email, tel, adresse, province, region, district, sexe,
        formations, photoData, photo, preuvePaiement, preuveVersement
    } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ error: "Le nom et le prénom sont obligatoires." });
    }

    // Le reçu de versement est désormais obligatoire, comme les autres champs du formulaire.
    const preuveImage = preuvePaiement || preuveVersement;
    if (!preuveImage) {
        return res.status(400).json({ error: "Le reçu de versement est obligatoire." });
    }

    try {
        const imageToSave = photoData || photo;
        const photoUrl = await uploadBase64Image(imageToSave, "formation");
        const preuvePaiementUrl = await uploadBase64Image(preuveImage, "paiement");
        const formationsText = Array.isArray(formations) ? formations.join(", ") : (formations || "Aucune");

        const sql = `INSERT INTO inscriptions_formations
            (nom, prenom, email, telephone, adresse, province, region, district, sexe, formations, photo, preuve_paiement, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            RETURNING id`;

        const values = [nom, prenom, email, tel, adresse, province, region, district, sexe, formationsText, photoUrl, preuvePaiementUrl];

        const result = await pool.query(sql, values);
        console.log(`✅ Inscription réussie ! Photo : ${photoUrl} | Reçu de versement : ${preuvePaiementUrl}`);

        // Envoi de l'email de confirmation
        sendConfirmationEmail(email, prenom, "formation");

        res.status(201).json({ message: "Inscription réussie !", id: result.rows[0].id, photoUrl, preuvePaiementUrl });
    } catch (err) {
        console.error("❌ Erreur :", err.message);
        res.status(500).json({ error: "Erreur lors de l'enregistrement." });
    }
});

// 6. ROUTES ADMIN
// Middleware de vérification du mot de passe admin (authentification Basic)
function checkAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.set("WWW-Authenticate", "Basic");
        return res.status(401).json({ error: "Authentification requise." });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [user, pass] = credentials.split(":");

    const validUser = process.env.ADMIN_USER;
    const validPass = process.env.ADMIN_PASS;

    if (user === validUser && pass === validPass) {
        return next();
    }

    return res.status(401).json({ error: "Identifiants incorrects." });
}

app.get("/admin/adhesions", checkAdminAuth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM adhesions ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/admin/formations", checkAdminAuth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM inscriptions_formations ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. CATCH-ALL : sert index.html pour toute route non-API
app.get(/^(?!\/(adhesion|register|admin)).*/, (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur FIMPISAVA prêt sur http://localhost:${PORT}`);
});
