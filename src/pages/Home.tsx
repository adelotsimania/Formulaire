import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../assets/styles/home.css';

const Home = () => {
  useScrollReveal();

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero reveal" id="accueil">
        <div className="hero-text">
          <span className="eyebrow">Fikambanana Mpianatra SAVA - Antananarivo</span>
          <h1>Unis, on va plus loin. <em>Ensemble</em> pour la réussite.</h1>
          <p className="hero-lead">
            L'association des étudiants de la région SAVA à Antananarivo : entraide, formations et projets.
          </p>
          <div className="hero-cta">
            <Link to="/adhesion" className="btn">Devenir membre</Link>
            <a href="#services" className="btn btn-ghost">Voir nos formations</a>
          </div>
        </div>
      </section>

      {/* ================= POURQUOI NOUS CHOISIR ================= */}
      <section className="why reveal" id="apropos">
        <span className="eyebrow center">Qui sommes-nous</span>
        <h2>Une association, une famille SAVA</h2>

        <div className="cards">
          <div className="card item-reveal">
            <i className="fa-solid fa-people-roof" />
            <h3>Solidarité</h3>
            <p>Un réseau soudé pour réussir vos études à Tana.</p>
          </div>
          <div className="card item-reveal">
            <i className="fa-solid fa-chalkboard-user" />
            <h3>Formations</h3>
            <p>Des formations ciblées et un accompagnement sur mesure.</p>
          </div>
          <div className="card item-reveal">
            <i className="fa-solid fa-hands-helping" />
            <h3>Racines</h3>
            <p>Un pont permanent avec notre chère région SAVA.</p>
          </div>
        </div>
      </section>

      {/* ================= PARCOURS ================= */}
      <section className="parcours reveal" id="parcours">
        <span className="eyebrow center">Le parcours d'un membre</span>
        <h2>De l'adhésion à la promotion</h2>

        <div className="timeline">
          <div className="step item-reveal">
            <div className="step-marker"><i className="fa-solid fa-pen" /></div>
            <h3>Adhésion</h3>
            <p>Rejoignez la communauté.</p>
          </div>
          <div className="step item-reveal">
            <div className="step-marker"><i className="fa-solid fa-book-open" /></div>
            <h3>Accueil</h3>
            <p>Intégrez le réseau et l'encadrement.</p>
          </div>
          <div className="step item-reveal">
            <div className="step-marker"><i className="fa-solid fa-bus" /></div>
            <h3>Formation</h3>
            <p>Développez vos compétences.</p>
          </div>
          <div className="step item-reveal">
            <div className="step-marker"><i className="fa-solid fa-comments" /></div>
            <h3>Soutenance</h3>
            <p>Validez vos acquis linguistiques.</p>
          </div>
          <div className="step item-reveal">
            <div className="step-marker"><i className="fa-solid fa-award" /></div>
            <h3>Promotion</h3>
            <p>Réussissez votre parcours.</p>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="services reveal" id="services">
        <span className="eyebrow center">Nos formations</span>
        <h2>Nos formations, un même encadrement</h2>
        <div className="cards">
          <div className="card item-reveal">
            <i className="fa-solid fa-book" />
            <h3>Encadrement</h3>
            <p>Soutien académique et mentorat par les anciens.</p>
          </div>
          <div className="card item-reveal">
            <i className="fa-solid fa-language" />
            <h3>Langues</h3>
            <p>Ateliers pratiques et préparation au niveau A2 en anglais.</p>
          </div>
          <div className="card item-reveal">
            <i className="fa-solid fa-laptop-code" />
            <h3>Informatique</h3>
            <p>Initiation à la bureautique et programmation, pas à pas.</p>
          </div>
        </div>
      </section>

      {/* ================= CTA ORIENTATION ================= */}
      <section className="cta-block reveal">
        <h2>Orientation Scolaire et Professionnelle</h2>
        <p>Trouvez la voie qui correspond à vos ambitions selon votre série du Baccalauréat.</p>
        <Link to="/orientation" className="cta-button">
          Orientation <i className="fa-solid fa-arrow-right" />
        </Link>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="contact reveal" id="contact">
        <span className="eyebrow center">Contact</span>
        <h2>Contactez-nous</h2>

        <div className="contact-box">
          <div className="item-reveal">
            <i className="fa-solid fa-location-dot" />
            <p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=FIMPISAVA+Ambohipo+Ambadiky+BNI+Antananarivo"
                target="_blank"
                rel="noopener noreferrer"
              >
                FIMPISAVA<br />
                Ambohipo, Ambadiky BNI
              </a>
            </p>
          </div>

          <div className="item-reveal">
            <i className="fa-solid fa-phone" />
            <p><a href="tel:+261322604930">032 26 049 30</a></p>
          </div>

          <div className="item-reveal">
            <i className="fa-solid fa-envelope" />
            <p><a href="mailto:fimpisava@gmail.com">fimpisava@gmail.com</a></p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
