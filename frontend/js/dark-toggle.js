// Bascule mode sombre — totalement indépendant de la logique du formulaire.
(function () {
    function applyIcon(btn) {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        btn.innerHTML = isDark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
        btn.title = isDark ? "Passer en mode clair" : "Passer en mode sombre";
    }

    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("theme-toggle-btn");
        if (!btn) return;

        applyIcon(btn);

        btn.addEventListener("click", () => {
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            if (isDark) {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("fimpisava-theme", "light");
            } else {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("fimpisava-theme", "dark");
            }
            applyIcon(btn);
        });
    });
})();