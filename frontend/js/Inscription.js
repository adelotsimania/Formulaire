const form = document.getElementById("inscription-form");
const messageBox = document.getElementById("message-box");
const submitBtn = document.getElementById("submit-btn");

// Utilise API_URL s'il est défini dans config.js, sinon localhost:3000 par défaut
const BASE_URL = typeof API_URL !== "undefined" ? API_URL : "http://localhost:3000";

function showMessage(text, isError) {
    if (!messageBox) return;
    messageBox.style.display = "block";
    messageBox.style.background = isError ? "#fdecea" : "#e6f4ea";
    messageBox.style.color = isError ? "#b3261e" : "#0d47a1";
    messageBox.textContent = text;
    messageBox.scrollIntoView({ behavior: "smooth" });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Récupération des langues et de l'informatique
    const languesChecked = Array.from(document.querySelectorAll('input[name="langues"]:checked')).map(cb => cb.value);
    const infoChecked = document.querySelector('input[name="informatique"]:checked') ? 'Informatique' : null;
    
    // Fusion des choix dans un seul tableau
    const formationsList = [...languesChecked];
    if (infoChecked) formationsList.push(infoChecked);

    // 2. Récupération de la photo en Base64
    const photoBase64 = document.getElementById("photo-data") ? document.getElementById("photo-data").value : "";

    if (!photoBase64) {
        showMessage("Veuillez prendre une photo avec la caméra avant de valider !", true);
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours...";

    // 3. Construction de l'objet de données
    const data = {
        nom: document.getElementById("nom").value.trim(),
        prenom: document.getElementById("prenom").value.trim(),
        email: document.getElementById("email").value.trim(),
        tel: document.getElementById("tel").value.trim(),
        adresse: document.getElementById("adresse").value.trim(),
        province: document.getElementById("province").value.trim(),
        region: document.getElementById("region").value.trim(),
        district: document.getElementById("district").value.trim(),
        sexe: document.getElementById("sexe").value,
        
        // Envoi sous les deux noms de variables pour compatibilité totale avec le serveur
        photoData: photoBase64,
        photo: photoBase64,
        
        formations: formationsList
    };

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            form.reset();
            
            // Masquer la photo de prévisualisation si présente
            const preview = document.getElementById("photo-preview");
            if (preview) preview.style.display = "none";
            
            window.location.href = "confirmation.html?type=formation";
            return;
        } else {
            showMessage(result.error || "Une erreur est survenue lors de l'enregistrement.", true);
        }
    } catch (err) {
        console.error("Erreur réseau :", err);
        showMessage("Impossible de contacter le serveur. Vérifiez que 'node server.js' est bien démarré.", true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "S'inscrire";
    }
});