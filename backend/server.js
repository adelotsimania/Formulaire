const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CONFIGURATION DES LIMITES & CORS
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 2. DOSSIER UPLOADS (Création automatique s'il n'existe pas)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// 3. CONNEXION MYSQL
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "fimpisava_user",
    password: process.env.DB_PASS || "TSIMANIA",
    database: process.env.DB_NAME || "fimpisava_db"
});

// Fonction pour sauvegarder la chaîne Base64 sous forme de fichier .jpg
function saveBase64Image(photoData, prefix = "formation") {
    if (!photoData || typeof photoData !== "string" || !photoData.startsWith("data:image")) {
        return "default.jpg";
    }

    const base64Image = photoData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");
    
    const fileName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);
    return fileName;
}
app.post("/adhesion", (req, res) => {
    const { nom, prenom, email, tel, filiere, adresse, province, region, district, sexe, photoData, photo } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ error: "Nom et prénom sont requis." });
    }

    try {
        // 1. Sauvegarde de la photo dans /uploads
        const imageToSave = photoData || photo;
        const fileName = saveBase64Image(imageToSave, "adhesion");

        // 2. Requête SQL corrigée (12 colonnes = 12 valeurs avec NOW() et fileName)
        const sql = `INSERT INTO adhesions 
            (nom, prenom, email, telephone, filiere, adresse, province, region, district, sexe, created_at, photo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`;

        const values = [nom, prenom, email, tel, filiere, adresse, province, region, district, sexe, fileName];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("❌ Erreur Adhésion SQL :", err);
                return res.status(500).json({ error: "Erreur lors de l'enregistrement de l'adhésion." });
            }
            console.log(`✅ Adhésion réussie ! Photo enregistrée : ${fileName}`);
            res.status(201).json({ message: "Adhésion enregistrée avec succès !", id: result.insertId });
        });
    } catch (err) {
        console.error("❌ Erreur image adhésion :", err);
        res.status(500).json({ error: "Erreur lors de la sauvegarde de la photo." });
    }
});

// 4. ROUTE D'INSCRIPTION (/register)
app.post("/register", (req, res) => {
    const { nom, prenom, email, tel, adresse, province, region, district, sexe, formations, photoData, photo } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ error: "Le nom et le prénom sont obligatoires." });
    }

    try {
        const imageToSave = photoData || photo;
        const fileName = saveBase64Image(imageToSave, "formation");
        const formationsText = Array.isArray(formations) ? formations.join(", ") : (formations || "Aucune");

        const sql = `INSERT INTO inscriptions_formations 
            (nom, prenom, email, telephone, adresse, province, region, district, sexe, formations, photo, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        const values = [nom, prenom, email, tel, adresse, province, region, district, sexe, formationsText, fileName];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("❌ Erreur MySQL :", err.message);
                return res.status(500).json({ error: "Erreur lors de l'enregistrement." });
            }
            console.log(`✅ Inscription réussie ! Photo enregistrée : ${fileName}`);
            res.status(201).json({ message: "Inscription réussie !", photoFileName: fileName });
        });
    } catch (err) {
        console.error("❌ Erreur image :", err);
        res.status(500).json({ error: "Erreur lors de la sauvegarde de la photo." });
    }
});

app.get("/admin/adhesions", (req, res) => {
    db.query("SELECT * FROM adhesions ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 5. ROUTE POUR L'ADMINISTRATION (/admin/formations)
app.get("/admin/formations", (req, res) => {
    db.query("SELECT * FROM inscriptions_formations ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur FIMPISAVA prêt sur http://localhost:${PORT}`);
});