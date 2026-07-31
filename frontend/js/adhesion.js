document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("adhesion-form");
    const messageBox = document.getElementById("message-box");
    const submitBtn = document.getElementById("submit-btn");

    // Définition de l'URL Backend
    const BASE_URL = typeof API_URL !== "undefined" ? API_URL : "http://localhost:3000";

    // --- 1. GESTION DE LA CAMÉRA ---
    const startCameraBtn = document.getElementById("start-camera-btn");
    const video = document.getElementById("webcam");
    const canvas = document.getElementById("photo-canvas");
    const preview = document.getElementById("photo-preview");
    const captureBtn = document.getElementById("capture-btn");
    const retakeBtn = document.getElementById("retake-btn");
    const cameraActions = document.getElementById("camera-actions");
    const photoDataInput = document.getElementById("photo-data");
    const cameraBox = document.getElementById("camera-box");
    let streamTrack = null;

    if (startCameraBtn) {
        startCameraBtn.addEventListener("click", async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 }, audio: false });
                video.srcObject = stream;
                streamTrack = stream.getTracks()[0];
                startCameraBtn.style.display = "none";
                video.style.display = "block";
                cameraActions.style.display = "flex";
                captureBtn.style.display = "inline-flex";
                retakeBtn.style.display = "none";
                preview.style.display = "none";
            } catch (err) {
                alert("Erreur d'accès à la caméra. Veuillez autoriser la caméra dans votre navigateur.");
            }
        });

        captureBtn.addEventListener("click", () => {
            canvas.width = 150;
            canvas.height = 150;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, 150, 150);

            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
            photoDataInput.value = compressedBase64;

            preview.src = compressedBase64;
            preview.style.display = "block";
            video.style.display = "none";
            captureBtn.style.display = "none";
            retakeBtn.style.display = "inline-flex";

            if (streamTrack) streamTrack.stop();
            if (cameraBox) cameraBox.classList.remove("input-error");
        });

        retakeBtn.addEventListener("click", () => {
            photoDataInput.value = "";
            preview.style.display = "none";
            startCameraBtn.click();
        });
    }

    // --- 2. AFFICHAGE DES MESSAGES ---
    function showMessage(text, isError) {
        if (!messageBox) {
            alert(text);
            return;
        }
        messageBox.style.display = "block";
        messageBox.style.background = isError ? "#fdecea" : "#e6f4ea";
        messageBox.style.color = isError ? "#b3261e" : "#1b4332";
        messageBox.textContent = text;
        messageBox.scrollIntoView({ behavior: "smooth" });
    }

    // --- 3. SOUMISSION ET VALIDATION DU FORMULAIRE ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Masquer les messages d'erreur précédents
        form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        form.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');

        // Validation simple des champs obligatoires (Champs texte / select)
        let isValid = true;
        let firstErrorElement = null;

        const requiredFields = form.querySelectorAll('input[required], select[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('input-error');
                const errorMsg = field.parentElement.querySelector('.error-text');
                if (errorMsg) errorMsg.style.display = 'block';
                if (!firstErrorElement) firstErrorElement = field;
            }
        });

        // Validation de la photo
        const photoBase64 = photoDataInput ? photoDataInput.value : "";
        if (!photoBase64) {
            isValid = false;
            if (cameraBox) cameraBox.classList.add("input-error");
            const photoError = document.getElementById("photo-error-text");
            if (photoError) photoError.style.display = "block";
            if (!firstErrorElement) firstErrorElement = cameraBox;
        }

        if (!isValid) {
            if (firstErrorElement) firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours...";

        // Construction du payload pour le backend
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
            filiere: document.getElementById("filiere").value.trim(),
            
            photoData: photoBase64,
            photo: photoBase64
        };

        try {
            const response = await fetch(`${BASE_URL}/adhesion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                form.reset();
                if (preview) preview.style.display = "none";
                
                // Redirection vers confirmation.html
                window.location.href = "confirmation.html?type=adhesion";
            } else {
                console.error("❌ Erreur serveur :", result);
                showMessage(result.error || "Une erreur est survenue lors de l'enregistrement.", true);
            }
        } catch (err) {
            console.error("❌ Erreur réseau :", err);
            showMessage("Impossible de contacter le serveur. Vérifiez que votre serveur Node.js est démarré.", true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "S'inscrire";
        }
    });
});