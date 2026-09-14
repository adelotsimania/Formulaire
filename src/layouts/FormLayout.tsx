import { Link, Outlet } from 'react-router-dom';
import logo from '../assets/images/logo.jpg';
import { useDarkTheme } from '../hooks/useDarkTheme';

const FormLayout = () => {
  const { theme, toggleTheme } = useDarkTheme();

  return (
    <>
      <header className="mini-header">
        <Link to="/" className="mini-logo">
          <img src={logo} alt="Logo FIMPISAVA" />
          <div className="logo-text">
            <span>FIMPISAVA</span>
            <small>Fikambanana Mpianatra SAVA</small>
          </div>
        </Link>
        <button className="theme-toggle-btn" onClick={toggleTheme} type="button">
          <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'} />
        </button>
      </header>

      <Outlet />

      <footer className="mini-footer">
        <p>© 2026 FIMPISAVA — Fikambanana Mpianatra SAVA</p>
      </footer>
    </>
  );
};

export default FormLayout;
