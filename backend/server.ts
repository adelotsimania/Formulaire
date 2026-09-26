import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { Pool, PoolConfig } from "pg";
import path from "path";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

// 1. CONFIGURATION DES LIMITES & CORS
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 2. CONFIGURATION CLOUDINARY (stockage persistant des photos)
// Variable à définir sur le VPS : CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"

// 2bis. CONFIGURATION RESEND (envoi d'emails de confirmation)
// Variable à définir sur le VPS (ou en local dans .env) : RESEND_API_KEY
// Optionnel : si absente, le serveur démarre quand même mais les emails de
// confirmation sont simplement désactivés (utile en dev local sans compte Resend configuré).
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (!resend) {
    console.warn("⚠️ RESEND_API_KEY absente : les emails de confirmation sont désactivés.");
}

// En mode test (sans domaine vérifié), Resend n'autorise l'envoi que vers cette adresse.
// Remplace-la par la tienne si besoin. Une fois un domaine vérifié, on pourra
// envoyer aux vraies adresses des inscrits.
const TEST_EMAIL_RECEIVER = "adelotsimania@gmail.com";

type ConfirmationType = "adhesion" | "formation";

async function sendConfirmationEmail(
    destinataire: string | undefined,
    prenom: string,
    type: ConfirmationType
): Promise<void> {
    if (!resend) {
        return;
    }

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
        const message = err instanceof Error ? err.message : String(err);
        console.error("⚠️ Erreur envoi email (inscription quand même enregistrée) :", message);
    }
}

// 2ter. DOSSIER FRONTEND (sert le build React statique)
// ⚠️ Changé : pointe maintenant vers fimpisava/dist (généré par `npm run build`),
// et non plus l'ancien Formulaire/frontend en HTML/JS vanilla.
// Structure attendue : fimpisava/backend/server.ts et fimpisava/dist/*
// (ajuste le chemin relatif si server.ts ne vit pas dans un sous-dossier "backend")
const frontendDir = path.join(__dirname, "..", "dist");
app.use(express.static(frontendDir));

// 3. CONNEXION POSTGRESQL (instance locale)
// Migration effectuée : on utilise désormais un PostgreSQL installé en local
// plutôt qu'une base hébergée en ligne (ex: Neon). Les identifiants viennent
// du fichier .env (voir .env.example) et ne sont jamais codés en dur ici.
// DATABASE_URL reste supporté en option, utile si un jour tu redéploies vers
// une base distante sans changer le code.
if (!process.env.DATABASE_URL && !process.env.DB_PASS) {
    console.warn("⚠️ Aucune variable DATABASE_URL ni DB_PASS définie : connexion PostgreSQL susceptible d'échouer. Vérifie ton fichier .env.");
}

const poolConfig: PoolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
    }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "fimpisava_user",
        password: process.env.DB_PASS,
        database: process.env.DB_NAME || "fimpisava_db",
        port: Number(process.env.DB_PORT) || 5432,
        // En local, pas besoin de SSL (par défaut désactivé).
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

// IMPORTANT : on utilise pool.query() (et non pool.connect()) pour ce test,
// car pool.query() emprunte ET rend automatiquement la connexion.
// pool.connect() garde la connexion ouverte indéfiniment si on ne la relâche
// pas manuellement, ce qui provoquait un crash du serveur.
pool.query("SELECT NOW()")
    .then(() => console.log("✅ Connecté à PostgreSQL (local)"))
    .catch((err: Error) => console.error("❌ Erreur de connexion PostgreSQL :", err.message));

// IMPORTANT : sans ce gestionnaire, une connexion fermée en arrière-plan par le serveur
// PostgreSQL (ex: inactivité, redémarrage du service local) fait planter TOUT le serveur Node.js.
pool.on("error", (err: Error) => {
    console.error("⚠️ Erreur inattendue sur le pool PostgreSQL (serveur toujours actif) :", err.message);
});

// Cloudinary n'est configuré que si CLOUDINARY_URL contient de vrais identifiants
// (pas juste le placeholder "cloudinary://API_KEY:API_SECRET@CLOUD_NAME" du .env.example)
const cloudinaryConfigured =
    !!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.includes("API_KEY");

if (!cloudinaryConfigured) {
    console.warn(
        "⚠️ CLOUDINARY_URL absente ou non configurée : les images seront stockées en base64 directement en base (mode local uniquement, à ne pas utiliser en prod)."
    );
}

// Fonction pour envoyer la chaîne Base64 vers Cloudinary et récupérer l'URL publique.
// En local sans Cloudinary configuré, on garde simplement le base64 tel quel pour
// pouvoir tester tout le flux (formulaire → backend → DB) sans dépendance externe.
async function uploadBase64Image(
    photoData: string | undefined,
    prefix: string = "formation"
): Promise<string> {
    if (!photoData || typeof photoData !== "string" || !photoData.startsWith("data:image")) {
        return "default.jpg";
    }

    if (!cloudinaryConfigured) {
        return photoData;
    }

    const publicId = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    const result = await cloudinary.uploader.upload(photoData, {
        folder: "fimpisava",
        public_id: publicId,
        resource_type: "image"
    });

    return result.secure_url;
}

// Formes des corps de requête (typage minimal, basé sur les champs utilisés)
interface AdhesionBody {
    nom?: string;
    prenom?: string;
    email?: string;
    tel?: string;
    filiere?: string;
    adresse?: string;
    province?: string;
    region?: string;
    district?: string;
    sexe?: string;
    photoData?: string;
    photo?: string;
}

interface RegisterBody {
    nom?: string;
    prenom?: string;
    email?: string;
    tel?: string;
    adresse?: string;
    province?: string;
    region?: string;
    district?: string;
    sexe?: string;
    formations?: string[] | string;
    photoData?: string;
    photo?: string;
    preuvePaiement?: string;
    preuveVersement?: string;
}

// 4. ROUTE D'ADHESION
app.post("/adhesion", async (req: Request<{}, {}, AdhesionBody>, res: Response) => {
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
        const message = err instanceof Error ? err.message : String(err);
        console.error("❌ Erreur Adhésion :", message);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de l'adhésion." });
    }
});

// 5. ROUTE D'INSCRIPTION (/register)
app.post("/register", async (req: Request<{}, {}, RegisterBody>, res: Response) => {
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
        const message = err instanceof Error ? err.message : String(err);
        console.error("❌ Erreur :", message);
        res.status(500).json({ error: "Erreur lors de l'enregistrement." });
    }
});

// 6. ROUTES ADMIN
// Middleware de vérification du mot de passe admin (authentification Basic)
function checkAdminAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.set("WWW-Authenticate", "Basic");
        res.status(401).json({ error: "Authentification requise." });
        return;
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [user, pass] = credentials.split(":");

    const validUser = process.env.ADMIN_USER;
    const validPass = process.env.ADMIN_PASS;

    if (user === validUser && pass === validPass) {
        next();
        return;
    }

    res.status(401).json({ error: "Identifiants incorrects." });
}

app.get("/admin/adhesions", checkAdminAuth, async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM adhesions ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: message });
    }
});

app.get("/admin/formations", checkAdminAuth, async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM inscriptions_formations ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: message });
    }
});

// 7. CATCH-ALL : sert index.html pour toute route non-API (React Router prend le relais côté client)
// Seules les routes API exactes (/adhesion, /register, /admin/adhesions, /admin/formations)
// sont exclues ; "/admin" tout court (la page Admin React) est bien servi via index.html.
// Implémenté en middleware générique (app.use, sans pattern de chemin) plutôt qu'avec un
// chemin regex sur app.get, pour éviter toute dépendance au parsing de routes de path-to-regexp
// (Express 5 a durci ce parsing et cassé certains patterns regex/wildcard historiques).
const spaFallbackExclusions = /^\/(adhesion|register)$|^\/admin\/(adhesions|formations)$/;

app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === "GET" && !spaFallbackExclusions.test(req.path)) {
        res.sendFile(path.join(frontendDir, "index.html"));
        return;
    }
    next();
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur FIMPISAVA prêt sur http://localhost:${PORT}`);
});
