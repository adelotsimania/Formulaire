import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.jpg';

const MainLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        // léger délai pour laisser le temps au DOM de la page de se peindre
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }));
      }
    }
  }, [location]);


  return (
    <>
      <header>
        <a href="/" className="logo">
          <img src={logo} alt="Logo FIMPISAVA" />
          <div className="logo-text">
            <h2>FIMPISAVA</h2>
            <span className="logo-sub">Fikambanana Mpianatra SAVA</span>
          </div>
        </a>

        <nav className={menuOpen ? 'active' : ''}>
          <ul>
            <li><Link to="/#accueil" onClick={closeMenu}>Accueil</Link></li>
            <li><Link to="/#apropos" onClick={closeMenu}>À propos</Link></li>
            <li><Link to="/#parcours" onClick={closeMenu}>Parcours</Link></li>
            <li><Link to="/#services" onClick={closeMenu}>Services</Link></li>
            <li><Link to="/orientation" onClick={closeMenu}>Orientation</Link></li>
            <li><Link to="/#contact" onClick={closeMenu}>Contact</Link></li>
            <li>
              <Link to="/inscription" className="btn-menu" onClick={closeMenu}>
                Inscription
              </Link>
            </li>
          </ul>
        </nav>

        <div
          className="menu-toggle"
          id="menuToggle"
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
          role="button"
          tabIndex={0}
          onClick={toggleMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMenu();
            }
          }}
        >
          <i className="fa-solid fa-bars" />
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <div className="footer-container">
          <div className="footer-logo">
            <h2>FIMPISAVA</h2>
            <p>Fikambanana Mpianatra SAVA - unis pour la réussite des étudiants SAVA à Antananarivo.</p>
          </div>

          <div className="footer-links">
            <h3>Liens rapides</h3>
            <Link to="/#accueil"><i className="fa-solid fa-chevron-right" /> Accueil</Link>
            <Link to="/#apropos"><i className="fa-solid fa-chevron-right" /> À propos</Link>
            <Link to="/#services"><i className="fa-solid fa-chevron-right" /> Services</Link>
            <Link to="/#contact"><i className="fa-solid fa-chevron-right" /> Contact</Link>
          </div>

          <div className="footer-contact">
            <h3>Contact</h3>
            <p><a href="tel:+261322604930"><i className="fa-solid fa-phone" /> 032 26 049 30</a></p>
            <p><a href="mailto:fimpisava@gmail.com"><i className="fa-solid fa-envelope" /> fimpisava@gmail.com</a></p>
            <p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=FIMPISAVA+Ambohipo+Ambadiky+BNI+Antananarivo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-solid fa-location-dot" /> Antananarivo, Madagascar
              </a>
            </p>
          </div>

          <div className="footer-social">
            <h3>Suivez-nous</h3>
            <div className="social-links">
              <a
                href="https://www.facebook.com/fimpisava.sava"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Facebook FIMPISAVA"
              >
                <div className="icon-box"><i className="fab fa-facebook-f" /></div>
                <div className="btn-text">
                  <span className="label">Facebook</span>
                  <span className="title">FIMPISAVA</span>
                </div>
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61592699075987"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Facebook Club de Langues"
              >
                <div className="icon-box"><i className="fab fa-facebook-f" /></div>
                <div className="btn-text">
                  <span className="label">Facebook</span>
                  <span className="title">Club de Langues</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <hr />
        <p className="copyright">© 2026 FIMPISAVA. Tous droits réservés.</p>
      </footer>
    </>
  );
};

export default MainLayout;
