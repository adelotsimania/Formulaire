import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useDarkTheme } from '../hooks/useDarkTheme';
import { API_URL } from '../services/config';

type DataType = 'adhesions' | 'formations';

interface AdminRow {
  id: number | string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  tel?: string;
  filiere?: string;
  adresse: string;
  province: string;
  region: string;
  district: string;
  sexe?: string;
  formations?: string;
  preuve_paiement?: string;
  photo?: string;
  created_at?: string;
}

// via.placeholder.com a fermé en 2024 (DNS mort) - remplacé par placehold.co,
// un équivalent quasi drop-in. Absent de admin.js d'origine.
const PHOTO_PLACEHOLDER = 'https://placehold.co/50x50?text=Sans+photo';
const PHOTO_ERROR_FALLBACK = 'https://placehold.co/45x45?text=Photo';
const PREUVE_ERROR_FALLBACK = 'https://placehold.co/45x45?text=Recu';

function resolveImageUrl(value: string | undefined, placeholder: string): string {
  if (value && value !== 'default.jpg' && (value.startsWith('http') || value.startsWith('data:image'))) {
    return value;
  }
  return placeholder;
}

function normalize(str: string | undefined | null): string {
  return (str ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const Admin = () => {
  const { theme, toggleTheme } = useDarkTheme();

  const [authHeader, setAuthHeader] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [stats, setStats] = useState<{ adhesions: number | null; formations: number | null }>({
    adhesions: null,
    formations: null,
  });

  const [currentType, setCurrentType] = useState<DataType>('adhesions');
  const [cache, setCache] = useState<Record<DataType, AdminRow[] | null>>({ adhesions: null, formations: null });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState('');
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  // Fermeture de la modale avec Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalSrc(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadStats = async (header: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/adhesions`, { headers: { Authorization: header } });
      const rows = await res.json();
      setStats((prev) => ({ ...prev, adhesions: Array.isArray(rows) ? rows.length : 0 }));
    } catch {
      // silencieux, comme dans admin.js
    }
    try {
      const res = await fetch(`${API_URL}/admin/formations`, { headers: { Authorization: header } });
      const rows = await res.json();
      setStats((prev) => ({ ...prev, formations: Array.isArray(rows) ? rows.length : 0 }));
    } catch {
      // silencieux
    }
  };

  const loadData = async (type: DataType, header: string) => {
    setCurrentType(type);
    setSearch('');
    setLoading(true);
    setLoadError(false);

    try {
      const res = await fetch(`${API_URL}/admin/${type}`, { headers: { Authorization: header } });
      if (!res.ok) throw new Error('Erreur de chargement');
      const rows: AdminRow[] = await res.json();
      setCache((prev) => ({ ...prev, [type]: rows }));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setLoginError('Veuillez remplir tous les champs.');
      return;
    }

    const header = 'Basic ' + btoa(`${username.trim()}:${password.trim()}`);

    try {
      const res = await fetch(`${API_URL}/admin/adhesions`, { headers: { Authorization: header } });
      if (res.status === 401) throw new Error('Identifiants incorrects.');
      if (!res.ok) throw new Error('Erreur serveur (' + res.status + ')');

      setAuthHeader(header);
      setLoggedIn(true);
      setLoginError('');
      loadStats(header);
      loadData('adhesions', header);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Erreur inconnue.');
    }
  };

  const handleLogout = () => {
    setAuthHeader('');
    setLoggedIn(false);
    setCache({ adhesions: null, formations: null });
    setStats({ adhesions: null, formations: null });
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  const filteredRows = useMemo(() => {
    const allRows = cache[currentType] || [];
    const query = normalize(search.trim());
    if (!query) return allRows;

    return allRows.filter((row) => {
      const haystack = normalize(
        [row.nom, row.prenom, row.email, row.telephone || row.tel, row.filiere, row.region, row.adresse]
          .filter(Boolean)
          .join(' ')
      );
      return haystack.includes(query);
    });
  }, [cache, currentType, search]);

  const isFormation = currentType === 'formations';

  return (
    <>
      {!loggedIn && (
        <div id="login-box">
          <h2>Espace Administration</h2>
          <p className="subtitle">FIMPISAVA - connectez-vous pour continuer</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="username">Identifiant</label>
            <input
              type="text" id="username" placeholder="admin"
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password" id="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Se connecter</button>
            <div id="error">{loginError}</div>
          </form>
        </div>
      )}

      {loggedIn && (
        <div id="dashboard">
          <div className="topbar">
            <div className="brand">
              <div className="brand-mark">FS</div>
              <div>
                <h1>Administration FIMPISAVA</h1>
                <small>Fikambanana Mpianatra SAVA</small>
              </div>
            </div>
            <div className="header-actions">
              <button className="theme-toggle" title="Changer de thème" onClick={toggleTheme} type="button">
                <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'} />
              </button>
              <button className="logout-btn" onClick={handleLogout} type="button">Déconnexion</button>
            </div>
          </div>

          <div className="dashboard-inner">
            <div className="stats-row">
              <div className="stat-card">
                <div className="label">Adhésions</div>
                <div className="value">{stats.adhesions ?? '-'}</div>
              </div>
              <div className="stat-card">
                <div className="label">Inscrits aux formations</div>
                <div className="value">{stats.formations ?? '-'}</div>
              </div>
            </div>

            <div className="nav">
              <button className={currentType === 'adhesions' ? 'active' : ''} onClick={() => loadData('adhesions', authHeader)}>
                Adhésions
              </button>
              <button className={currentType === 'formations' ? 'active' : ''} onClick={() => loadData('formations', authHeader)}>
                Inscriptions Formations
              </button>
            </div>

            <div className="table-card">
              <div className="table-card-header">
                <h2>{isFormation ? 'Inscrits aux Formations FIMPISAVA' : 'Membres Ayant Adhéré à FIMPISAVA'}</h2>
                <div className={`search-box ${search ? 'has-value' : ''}`}>
                  <i className="fa-solid fa-magnifying-glass" />
                  <input
                    type="text" placeholder="Rechercher par nom, email, téléphone..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="button" title="Effacer" onClick={() => setSearch('')}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              </div>

              <div id="table-container">
                {loading && <div className="empty-state">Chargement en cours...</div>}

                {!loading && loadError && (
                  <div className="empty-state"><div className="icon">⚠️</div>Erreur lors du chargement des données.</div>
                )}

                {!loading && !loadError && filteredRows.length === 0 && (
                  <div className="empty-state">
                    <div className="icon">{search ? '🔍' : '📭'}</div>
                    {search ? 'Aucun résultat ne correspond à cette recherche.' : 'Aucune donnée pour le moment.'}
                  </div>
                )}

                {!loading && !loadError && filteredRows.length > 0 && (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th><th>Nom &amp; Prénom</th><th>Contact</th>
                        {!isFormation && <th>Filière</th>}
                        <th>Adresse</th><th>Province</th><th>Origine</th>
                        {isFormation ? <th>Formations</th> : <th>Sexe</th>}
                        {isFormation && <th>Reçu de versement</th>}
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row) => {
                        const photoUrl = resolveImageUrl(row.photo, PHOTO_PLACEHOLDER);
                        const preuveUrl = isFormation ? resolveImageUrl(row.preuve_paiement, '') : '';
                        const formattedDate = row.created_at
                          ? new Date(row.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-';

                        const handleRowClick = isFormation
                          ? () => {
                              if (preuveUrl) setModalSrc(preuveUrl);
                              else alert("Aucun reçu de versement n'a été téléversé pour cette inscription.");
                            }
                          : undefined;

                        return (
                          <tr key={row.id} onClick={handleRowClick} style={isFormation ? { cursor: 'pointer' } : undefined}>
                            <td className="muted">{row.id}</td>
                            <td>
                              <div className="name-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img
                                  src={photoUrl} alt="Photo" className="avatar-img"
                                  style={{ width: 45, height: 45, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                                  onClick={(e) => { e.stopPropagation(); setModalSrc(photoUrl); }}
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PHOTO_ERROR_FALLBACK; }}
                                />
                                <div>
                                  <div><strong>{row.nom}</strong> {row.prenom}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {row.telephone || row.tel}<br />
                              <small className="muted">{row.email}</small>
                            </td>
                            {!isFormation && <td>{row.filiere}</td>}
                            <td>{row.adresse}</td>
                            <td>{row.province}</td>
                            <td>{row.region} <small className="muted">({row.district})</small></td>
                            {isFormation
                              ? <td><span className="badge">{row.formations}</span></td>
                              : <td>{row.sexe}</td>}
                            {isFormation && (
                              <td>
                                {preuveUrl ? (
                                  <img
                                    src={preuveUrl} alt="Reçu de versement" className="avatar-img"
                                    style={{ width: 45, height: 45, borderRadius: 8, objectFit: 'cover', cursor: 'pointer' }}
                                    onClick={(e) => { e.stopPropagation(); setModalSrc(preuveUrl); }}
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PREUVE_ERROR_FALLBACK; }}
                                  />
                                ) : <span className="muted">-</span>}
                              </td>
                            )}
                            <td className="muted">{formattedDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'agrandissement photo / reçu */}
      {modalSrc && (
        <div className="modal-overlay show" style={{ display: 'flex' }} onClick={() => setModalSrc(null)}>
          <span className="modal-close">&times;</span>
          <img src={modalSrc} alt="Agrandissement" />
        </div>
      )}
    </>
  );
};

export default Admin;
