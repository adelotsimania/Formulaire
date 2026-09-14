type Domaine = 'litteraire' | 'scientifique' | 'technique' | 'toutes';
type Admission = 'concours' | 'test' | 'dossier';

interface SeriesCard {
  badge: string;
  title: string;
  description: string;
  items: string[];
  domaine: Domaine;
}

interface Filiere {
  title: string;
  series?: string;
  debouches: string;
}

interface FaculteCard {
  number: number;
  name: string;
  series: string;
  admission: Admission;
  domaine: Domaine;
  filieres: Filiere[];
}

const PRINCIPLES = [
  {
    icon: 'fa-compass',
    title: "Vos centres d'intérêt",
    text: "Une filière choisie par défaut, sans lien avec ce qui vous intéresse réellement, est la première cause d'échec en première année.",
  },
  {
    icon: 'fa-briefcase',
    title: 'Les débouchés',
    text: 'Renseignez-vous sur les métiers accessibles après chaque formation, pas seulement sur le nom de la filière.',
  },
  {
    icon: 'fa-scale-balanced',
    title: "Le rythme d'étude",
    text: 'Certaines filières demandent un travail régulier et intensif dès la première année : mieux vaut le savoir avant de vous inscrire.',
  },
];

const SERIES: SeriesCard[] = [
  {
    badge: 'A1 / A2', title: 'Séries littéraires', domaine: 'litteraire',
    description: 'Profil orienté langues, lettres et sciences humaines.',
    items: [
      'Faculté des Lettres et Sciences Humaines (FLSH)',
      'Faculté de Droit et de Sciences Politiques (FDSP)',
      'École Normale Supérieure (ENS), filières littéraires',
      "Institut de Civilisations / Musée d'Art et d'Archéologie (ICMAA)",
    ],
  },
  {
    badge: 'L', title: 'Série littéraire (L)', domaine: 'litteraire',
    description: 'Profil orienté droit, langues et sciences humaines.',
    items: [
      'Faculté de Droit et de Sciences Politiques (FDSP)',
      'Faculté des Lettres et Sciences Humaines (FLSH)',
      'École Normale Supérieure (ENS), filières littéraires',
      'ICMAA',
    ],
  },
  {
    badge: 'OSE', title: 'Série OSE', domaine: 'litteraire',
    description: 'Profil polyvalent, accès large aux filières générales.',
    items: [
      'Faculté de Droit et de Sciences Politiques (FDSP)',
      "Faculté d'Économie, de Gestion et de Sociologie (EGS)",
      'Faculté des Lettres et Sciences Humaines (FLSH)',
      'ENS, ICMAA',
    ],
  },
  {
    badge: 'C', title: 'Série scientifique (C)', domaine: 'scientifique',
    description: 'Profil orienté mathématiques et sciences physiques — accès le plus large.',
    items: [
      'Faculté des Sciences (tous portails, dont Maths-Info)',
      "École Supérieure Polytechnique d'Antananarivo (ESPA)",
      'Faculté de Médecine',
      'ESSA, ISTE, FDSP, EGS',
    ],
  },
  {
    badge: 'D', title: 'Série scientifique (D)', domaine: 'scientifique',
    description: 'Profil orienté sciences de la vie et de la terre.',
    items: [
      'Faculté de Médecine',
      'Faculté des Sciences (sauf portail Maths-Info)',
      'ESSA, ISTE, ESPA',
      'FDSP, EGS',
    ],
  },
  {
    badge: 'S', title: 'Série scientifique (S)', domaine: 'scientifique',
    description: 'Profil scientifique généraliste — accès à tous les portails.',
    items: [
      'Faculté des Sciences (tous portails)',
      'ESPA, Faculté de Médecine',
      'ESSA, ISTE, FDSP, EGS',
    ],
  },
  {
    badge: 'Tech. Agricole / Élevage', title: 'Bac technique agricole', domaine: 'technique',
    description: 'Profil orienté agronomie, élevage et environnement.',
    items: [
      'École Supérieure des Sciences Agronomiques (ESSA)',
      'Faculté de Médecine — Médecine Vétérinaire',
    ],
  },
  {
    badge: 'Bacs techniques (E, génie civil, électro, méca, info)', title: 'Technique industrielle & génie', domaine: 'technique',
    description: 'Profil orienté ingénierie, bâtiment et industrie.',
    items: [
      'ESPA (génie civil, électrique, chimique, géologique, hydraulique)',
      'Faculté des Sciences — portail Physique & Chimie, MIT',
    ],
  },
];

const FACULTES: FaculteCard[] = [
  {
    number: 1, name: 'Faculté de Droit et de Sciences Politiques (FDSP)', domaine: 'toutes', admission: 'concours',
    series: 'Toutes séries (A, C, D, S, L, OSE)',
    filieres: [
      { title: 'Droit', debouches: "Avocat, magistrat, juriste d'entreprise" },
      { title: 'Sciences Politiques', debouches: 'Diplomate, analyste politique, consultant en relations internationales' },
    ],
  },
  {
    number: 2, name: "Faculté d'Économie, de Gestion et de Sociologie (EGS)", domaine: 'toutes', admission: 'test',
    series: 'Priorité C, D, S, OSE — Série A accessible (Sociologie)',
    filieres: [
      { title: 'Économie', debouches: 'Économiste de la santé, analyste financier, conseiller en banque' },
      { title: 'Gestion', debouches: 'Comptable, responsable des ressources humaines, chef de produit marketing' },
      { title: 'Sociologie', debouches: "Chargé d'études sociales, consultant en développement, médiateur social" },
    ],
  },
  {
    number: 3, name: 'Faculté des Lettres et Sciences Humaines (FLSH)', domaine: 'litteraire', admission: 'concours',
    series: 'Séries A, L, OSE prioritaires — ouverte aux séries C, D, S',
    filieres: [
      { title: 'Études Françaises / Anglaises / Hispaniques / Germaniques / Russes', debouches: 'Traducteur, interprète, rédacteur web, enseignant' },
      { title: 'Malagasy', debouches: 'Enseignant, chercheur en linguistique, spécialiste en anthropologie' },
      { title: 'Histoire & Archéologie', debouches: 'Conservateur de musée, guide du patrimoine, chercheur' },
      { title: 'Géographie', debouches: "Cartographe, urbaniste, spécialiste en aménagement du territoire" },
      { title: 'Philosophie', debouches: "Enseignant, consultant en éthique, conseiller d'orientation" },
      { title: 'Communication', debouches: 'Journaliste, chargé de relations publiques, community manager' },
    ],
  },
  {
    number: 4, name: 'Faculté des Sciences', domaine: 'scientifique', admission: 'dossier',
    series: 'Selon portail — voir détail ci-dessous',
    filieres: [
      { title: 'Portail Physique & Chimie', series: 'C, D, S, Bac technique E (Génie Industriel)', debouches: 'Technicien en métrologie, contrôleur qualité industrielle, assistant de recherche en laboratoire énergétique' },
      { title: 'Mathématiques et Informatique (MI)', series: 'C, S uniquement', debouches: 'Data scientist, ingénieur algorithmique, modélisateur mathématique, enseignant-chercheur' },
      { title: 'Informatique et Technologie (MIT)', series: 'C, S, D et certains Bacs techniques', debouches: 'Développeur d\'applications, administrateur de bases de données, technicien réseau et sécurité informatique' },
      { title: 'Sciences de la Vie (Biologie)', series: 'C, D, S', debouches: 'Biologiste médical, responsable qualité agroalimentaire, gestionnaire de biotope' },
      { title: 'Sciences de la Terre et de l\'Environnement (Géologie)', series: 'C, D, S', debouches: 'Géologue minier, expert en risques naturels' },
    ],
  },
  {
    number: 5, name: 'Faculté de Médecine', domaine: 'scientifique', admission: 'dossier',
    series: 'Selon filière — voir détail ci-dessous',
    filieres: [
      { title: 'Médecine Vétérinaire', series: 'C, D, S et Bac technique agricole ou Techniques d\'Élevage', debouches: 'Médecin vétérinaire praticien, inspecteur sanitaire, cadre en nutrition animale' },
      { title: 'Médecine Humaine & Pharmacie', series: 'C, D, S', debouches: "Médecin généraliste, spécialiste, pharmacien d'officine, biologiste médical" },
      { title: 'Sciences Paramédicales & Maïeutique', series: 'C, D, S', debouches: 'Infirmier majeur, sage-femme, kinésithérapeute, technicien de laboratoire' },
    ],
  },
  {
    number: 6, name: "École Supérieure Polytechnique d'Antananarivo (ESPA – Vontovorona)", domaine: 'technique', admission: 'concours',
    series: 'Séries C, D, S et Bacs techniques (génie civil, électronique, mécanique, informatique)',
    filieres: [
      { title: 'Génie Civil et Naval', debouches: 'Ingénieur BTP, conducteur de travaux, concepteur de structures maritimes' },
      { title: 'Génie Électrique / Électronique / Télécommunications', debouches: 'Ingénieur réseau mobile, installateur de systèmes, automaticien' },
      { title: 'Génie Chimique et Procédés', debouches: "Ingénieur en traitement des eaux, responsable de production cosmétique" },
      { title: 'Génie Géologique / Minier / Pétrolier', debouches: 'Ingénieur de forage, expert en exploitation minière' },
      { title: 'Hydraulique', debouches: "Gestionnaire de réseaux d'eau potable, ingénieur en aménagements hydroagricoles" },
    ],
  },
  {
    number: 7, name: 'École Supérieure des Sciences Agronomiques (ESSA)', domaine: 'scientifique', admission: 'concours',
    series: 'Séries scientifiques C, D, S',
    filieres: [
      { title: 'Agriculture (Agronomie)', debouches: "Conseiller agricole, directeur d'exploitation agricole, expert en sécurité alimentaire" },
      { title: 'Élevage (Zootechnie)', debouches: "Responsable de ferme d'élevage, nutritionniste animalier" },
      { title: 'Foresterie et Environnement', debouches: 'Gestionnaire des forêts, consultant en impact environnemental' },
      { title: 'Industries Agroalimentaires', debouches: "Responsable de chaîne de production alimentaire, contrôleur d'hygiène" },
      { title: 'Génie Rural', debouches: "Concepteur d'infrastructures rurales et de systèmes d'irrigation" },
    ],
  },
  {
    number: 8, name: 'École Normale Supérieure (ENS)', domaine: 'toutes', admission: 'concours',
    series: 'Séries A, L, OSE (littéraires) — Séries C, D, S (scientifiques)',
    filieres: [
      { title: 'Formation des Enseignants (Lettres, Sciences, Langues)', debouches: "Enseignant certifié de lycée ou de collège, inspecteur de l'éducation nationale, concepteur de programmes scolaires" },
    ],
  },
  {
    number: 9, name: "Institut de Civilisations / Musée d'Art et d'Archéologie (ICMAA)", domaine: 'toutes', admission: 'dossier',
    series: 'Toutes séries (A, C, D, S, L, OSE)',
    filieres: [
      { title: 'Anthropologie et Archéologie', debouches: 'Chercheur, gestionnaire de sites culturels et touristiques, expert en patrimoine national' },
    ],
  },
  {
    number: 10, name: "Institut des Sciences et Techniques de l'Environnement (ISTE)", domaine: 'scientifique', admission: 'dossier',
    series: 'Séries scientifiques (C, D, S)',
    filieres: [
      { title: 'Gestion des Écosystèmes', debouches: 'Manager de projets de conservation, auditeur environnemental pour les entreprises' },
    ],
  },
];

const ADMISSION_META: Record<Admission, { icon: string; label: string }> = {
  concours: { icon: 'fa-file-signature', label: 'Concours' },
  test: { icon: 'fa-list-check', label: "Test d'accès" },
  dossier: { icon: 'fa-folder-open', label: 'Sélection des dossiers' },
};

const Orientation = () => {
  return (
    <main className="page orientation-page">

      {/* ================= HERO ================= */}
      <div className="page-intro">
        <span className="eyebrow">FIMPISAVA — Orientation</span>
        <h1>Bien choisir sa filière après le baccalauréat</h1>
        <p>
          Chaque année, beaucoup de nouveaux bacheliers hésitent entre plusieurs facultés ou écoles.
          Ce guide résume les grandes pistes selon votre série de bac, puis détaille chaque faculté, école
          et institut avec leurs filières et débouchés, pour vous aider à faire un choix plus éclairé
          avant la rentrée.
        </p>
      </div>

      {/* ================= PRINCIPES ================= */}
      <section className="principles-grid">
        {PRINCIPLES.map((p) => (
          <div className="principle-card" key={p.title}>
            <i className={`fa-solid ${p.icon}`} />
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </div>
        ))}
      </section>

      {/* ================= SERIES (vue rapide) ================= */}
      <section className="series-section">
        <h2>Pistes selon votre série de bac</h2>
        <p className="block-hint">
          Vue rapide et indicative. Le détail complet — filières précises et débouchés —
          se trouve juste en dessous, faculté par faculté.
        </p>

        <div className="series-grid">
          {SERIES.map((s) => (
            <article className={`series-card domaine-${s.domaine}`} key={s.badge}>
              <span className="series-badge">{s.badge}</span>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <ul>
                {s.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>

        <a
          href="https://www.univ-antananarivo.mg/orientation"
          target="_blank" rel="noopener" className="official-link"
        >
          <i className="fa-solid fa-arrow-up-right-from-square" />
          Faire le test d'orientation complet sur le site de l'Université d'Antananarivo
        </a>
      </section>

      {/* ================= DETAIL PAR FACULTE ================= */}
      <section className="detail-section">
        <h2>Détail par faculté, école et institut</h2>
        <p className="block-hint">
          Cliquez sur une faculté ou un institut pour voir ses filières et les métiers
          accessibles après le diplôme.
        </p>

        <div className="admission-legend">
          {(Object.keys(ADMISSION_META) as Admission[]).map((key) => (
            <span className={`admission-badge admission-${key}`} key={key}>
              <i className={`fa-solid ${ADMISSION_META[key].icon}`} /> {ADMISSION_META[key].label}
            </span>
          ))}
        </div>

        <div className="faculte-accordion">
          {FACULTES.map((f) => (
            <details className={`faculte-card domaine-${f.domaine}`} key={f.number}>
              <summary>
                <span className="faculte-name">{f.number}. {f.name}</span>
                <span className="faculte-series">{f.series}</span>
                <span className={`admission-badge admission-${f.admission}`}>
                  <i className={`fa-solid ${ADMISSION_META[f.admission].icon}`} /> {ADMISSION_META[f.admission].label}
                </span>
              </summary>
              <div className="filiere-list">
                {f.filieres.map((filiere) => (
                  <div className="filiere" key={filiere.title}>
                    <h4>
                      {filiere.title}
                      {filiere.series && <span className="filiere-series"> — {filiere.series}</span>}
                    </h4>
                    <p><i className="fa-solid fa-briefcase" /> {filiere.debouches}</p>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ================= CTA FIMPISAVA ================= */}
      <section className="cta-block">
        <h2>Quelle que soit votre filière, renforcez votre profil</h2>
        <p>
          Une bonne maîtrise des langues et des outils informatiques fait la différence dans
          n'importe quelle faculté ou école. FIMPISAVA propose des formations courtes pour
          démarrer l'année universitaire avec de meilleures bases.
        </p>
        <a href="/" className="cta-button">
          Découvrir nos formations <i className="fa-solid fa-arrow-right" />
        </a>
      </section>

    </main>
  );
};

export default Orientation;
