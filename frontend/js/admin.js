let authHeader = "";
let cache = { adhesions: null, formations: null };
let currentType = "adhesions";

// Récupération sécurisée de l'URL du serveur
const BASE_URL = typeof API_URL !== "undefined" ? API_URL : "http://localhost:3000";

// -------------------------------------------------------------
// 1. AUTHENTIFICATION (LOGIN / LOGOUT)
// -------------------------------------------------------------
function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (!user || !pass) {
        document.getElementById("error").textContent = "Veuillez remplir tous les champs.";
        return;
    }

    authHeader = "Basic " + btoa(`${user}:${pass}`);

    fetch(`${BASE_URL}/admin/adhesions`, { headers: { Authorization: authHeader } })
        .then(res => {
            if (res.status === 401) throw new Error("Identifiants incorrects.");
            if (!res.ok) throw new Error("Erreur serveur (" + res.status + ")");
            return res.json();
        })
        .then(() => {
            document.getElementById("login-box").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            loadStats();
            loadData("adhesions");
        })
        .catch(err => {
            document.getElementById("error").textContent = err.message;
        });
}

function logout() {
    authHeader = "";
    cache = { adhesions: null, formations: null };
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("login-box").style.display = "block";
    document.getElementById("password").value = "";
    document.getElementById("username").value = "";
    document.getElementById("error").textContent = "";
}

// -------------------------------------------------------------
// 2. STATISTIQUES
// -------------------------------------------------------------
function loadStats() {
    fetch(`${BASE_URL}/admin/adhesions`, { headers: { Authorization: authHeader } })
        .then(res => res.json())
        .then(rows => {
            document.getElementById("stat-adhesions").textContent = Array.isArray(rows) ? rows.length : 0;
        })
        .catch(() => {});

    fetch(`${BASE_URL}/admin/formations`, { headers: { Authorization: authHeader } })
        .then(res => res.json())
        .then(rows => {
            document.getElementById("stat-formations").textContent = Array.isArray(rows) ? rows.length : 0;
        })
        .catch(() => {});
}

// -------------------------------------------------------------
// 3. CHARGEMENT DES DONNÉES
// -------------------------------------------------------------
function loadData(type) {
    currentType = type;

    document.getElementById("tab-adhesions").classList.toggle("active", type === "adhesions");
    document.getElementById("tab-formations").classList.toggle("active", type === "formations");

    document.getElementById("title").textContent =
        type === "adhesions" ? "Membres Ayant Adhéré à FIMPISAVA" : "Inscrits aux Formations FIMPISAVA";

    resetSearch();
    document.getElementById("table-container").innerHTML = `<div class="empty-state">Chargement en cours...</div>`;

    fetch(`${BASE_URL}/admin/${type}`, { headers: { Authorization: authHeader } })
        .then(res => {
            if (!res.ok) throw new Error("Erreur de chargement");
            return res.json();
        })
        .then(rows => {
            cache[type] = rows;
            renderTable(rows, type);
        })
        .catch(() => {
            document.getElementById("table-container").innerHTML =
                `<div class="empty-state"><div class="icon">⚠️</div>Erreur lors du chargement des données.</div>`;
        });
}

function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
}

// -------------------------------------------------------------
// 4. RENDU DU TABLEAU
// -------------------------------------------------------------
function renderTable(rows, type) {
    const container = document.getElementById("table-container");

    if (!rows || !rows.length) {
        const isSearching = searchInput && searchInput.value.trim().length > 0;
        container.innerHTML = isSearching
            ? `<div class="empty-state">
                   <div class="icon">🔍</div>
                   Aucun résultat ne correspond à cette recherche.
               </div>`
            : `<div class="empty-state">
                   <div class="icon">📭</div>
                   Aucune donnée pour le moment.
               </div>`;
        return;
    }

    const isFormation = type === "formations";
    let html = `<table><thead><tr>
        <th>#</th><th>Nom &amp; Prénom</th><th>Contact</th>
        ${isFormation ? "" : "<th>Filière</th>"}
        <th>Adresse</th><th>Origine</th>
        ${isFormation ? "<th>Formations</th>" : "<th>Sexe</th>"}
        <th>Date</th>
    </tr></thead><tbody>`;

    rows.forEach(row => {
        // Détermination de l'URL de la photo (Fichier dans /uploads ou Base64 direct)
        let photoUrl = "https://via.placeholder.com/50?text=Sns";

        if (row.photo && row.photo !== "default.jpg") {
            if (row.photo.startsWith("data:image")) {
                photoUrl = row.photo;
            } else {
                photoUrl = `${BASE_URL}/uploads/${row.photo}`;
            }
        }

        const formattedDate = row.created_at
            ? new Date(row.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
            : "—";

        html += `<tr>
            <td class="muted">${row.id}</td>
            <td>
                <div class="name-cell" style="display:flex; align-items:center; gap:10px;">
                    <img src="${photoUrl}" 
                         alt="Photo" 
                         class="avatar-img" 
                         style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; cursor: pointer;"
                         onclick="openModal('${photoUrl}')"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/45?text=Photo';">
                    <div>
                        <div><strong>${escapeHtml(row.nom)}</strong> ${escapeHtml(row.prenom)}</div>
                    </div>
                </div>
            </td>
            <td>
                ${escapeHtml(row.telephone || row.tel)}<br>
                <small class="muted">${escapeHtml(row.email)}</small>
            </td>
            ${isFormation ? "" : `<td>${escapeHtml(row.filiere)}</td>`}
            <td>${escapeHtml(row.adresse)}</td>
            <td>${escapeHtml(row.region)} <small class="muted">(${escapeHtml(row.district || row.province)})</small></td>
            ${isFormation
                ? `<td><span class="badge">${escapeHtml(row.formations)}</span></td>`
                : `<td>${escapeHtml(row.sexe)}</td>`}
            <td class="muted">${formattedDate}</td>
        </tr>`;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
}

// -------------------------------------------------------------
// 5. GESTION DE LA MODALE PHOTO
// -------------------------------------------------------------
function openModal(imgSrc) {
    const modal = document.getElementById("photo-modal");
    const modalImg = document.getElementById("modal-img");
    if (modal && modalImg) {
        modalImg.src = imgSrc;
        modal.classList.add("show");
        modal.style.display = "flex";
    }
}

function closeModal() {
    const modal = document.getElementById("photo-modal");
    if (modal) {
        modal.classList.remove("show");
        modal.style.display = "none";
    }
}

// -------------------------------------------------------------
// 6. RECHERCHE — filtre en direct sur nom, prénom, email, téléphone
// -------------------------------------------------------------
const searchInput = document.getElementById("search-input");
const searchBox = document.querySelector(".search-box");
const searchClearBtn = document.getElementById("search-clear");

function normalize(str) {
    return (str || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function resetSearch() {
    if (!searchInput) return;
    searchInput.value = "";
    searchBox.classList.remove("has-value");
    removeResultCount();
}

function removeResultCount() {
    const existing = document.querySelector(".search-result-count");
    if (existing) existing.remove();
}

function applySearch() {
    const query = normalize(searchInput.value.trim());
    searchBox.classList.toggle("has-value", query.length > 0);

    const allRows = cache[currentType] || [];

    if (!query) {
        removeResultCount();
        renderTable(allRows, currentType);
        return;
    }

    const filtered = allRows.filter(row => {
        const haystack = normalize(
            [row.nom, row.prenom, row.email, row.telephone || row.tel, row.filiere, row.region, row.adresse]
                .filter(Boolean)
                .join(" ")
        );
        return haystack.includes(query);
    });

    renderTable(filtered, currentType);

    removeResultCount();
    const container = document.getElementById("table-container");
    const countEl = document.createElement("p");
    countEl.className = "search-result-count";
    countEl.textContent = `${filtered.length} résultat${filtered.length !== 1 ? "s" : ""} pour "${searchInput.value.trim()}"`;
    container.parentElement.insertBefore(countEl, container);
}

if (searchInput) {
    searchInput.addEventListener("input", applySearch);
}

if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
        resetSearch();
        renderTable(cache[currentType] || [], currentType);
    });
}

// -------------------------------------------------------------
// MODE SOMBRE — bascule + préférence mémorisée
// -------------------------------------------------------------
const themeToggle = document.getElementById("theme-toggle");

function applyThemeIcon() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    themeToggle.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    themeToggle.title = isDark ? "Passer en mode clair" : "Passer en mode sombre";
}

if (themeToggle) {
    applyThemeIcon();

    themeToggle.addEventListener("click", () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("fimpisava-theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("fimpisava-theme", "dark");
        }
        applyThemeIcon();
    });
}

// -------------------------------------------------------------
// Événements globaux (Touche Entrée et Fermeture Modale au clic)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // Permet de valider avec la touche "Entrée" sur le mot de passe
    const passInput = document.getElementById("password");
    if (passInput) {
        passInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") login();
        });
    }

    // Fermeture de la modale en appuyant sur la touche 'Échap'
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
});