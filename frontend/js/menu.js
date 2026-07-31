// Menu mobile — ouverture/fermeture au clic sur l'icône burger
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const nav = document.querySelector('header nav');

  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  toggle.addEventListener('click', toggleMenu);

  // Ouvrir/fermer aussi au clavier (accessibilité)
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  // Fermer le menu après avoir cliqué sur un lien (utile en mobile)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
});