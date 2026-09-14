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
          <span className="eyebrow">Fikambanana Mpianatra SAVA — Antananarivo</span>
          <h1>Unis, on va plus loin. <em>Ensemble</em> pour la réussite.</h1>
          <p className="hero-lead">
            FIMPISAVA rassemble les étudiants originaires de la région SAVA à Antananarivo.
            Une association qui organise des formations, un encadrement solidaire entre membres,
            et des activités qui gardent le lien avec notre région.
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
            <h3>Solidarité entre membres</h3>
            <p>FIMPISAVA accueille les étudiants originaires de la région SAVA arrivant à Antananarivo et les accompagne tout au long de leur parcours.</p>
          </div>
          <div className="card item-reveal">
            <i className="fa-solid fa-chalkboard-user" />
            <h3>Formations de qualité</h3>
            <p>Des formations en langues et en informatique animées par des membres et intervenants qualifiés.</p>
          </div>
          <div className="card item-reveal">
            <i className="fa-solid fa-hands-helping" />
            <h3>Racines &amp; entraide</h3>
            <p>Garder le lien avec la région SAVA à travers des activités, des échanges et une communauté soudée.</p>
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
            <p>Un accueil personnalisé pour chaque nouvel étudiant originaire de la région SAVA.</p>
          </div>
          <div className="step item-reveal">
            <div className="step-marker"><i className="fa-solid fa-book-open" /></div>
            <h3>Formations</h3>
            <p><strong>Langues et Informatique, cours préparatoires</strong> avec un encadrement suivi tout au long de l'année.</p>
          </div>
          <div className="step item-reveal">
            <div className="step-marker"><i className="fa-solid fa-bus" /></div>
            <h3>Excursion</h3>
            <p>Des sorties associatives pour renforcer les liens entre membres.</p>
          </div>
          <div className="step item-reveal">
            <div className="step-marker"><i className="fa-solid fa-comments" /></div>
            <h3>Soutenance A2</h3>
            <p>Une évaluation orale en anglais pour valider les acquis de la formation.</p>
          </div>
          <div className="step item-reveal">
            <div className="step-marker"><i className="fa-solid fa-award" /></div>
            <h3>Sortie de promotion</h3>
            <p>Une célébration collective pour marquer la réussite de chaque promotion.</p>
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
            <h3>Cours préparatoire</h3>
            <p>Afin d'accompagner les bacheliers souhaitant intégrer l'Université d'Antananarivo</p>
          </div>
          <div className="card item-reveal">
            <i className="fa-solid fa-language" />
            <h3>Langues</h3>
            <p>Formation en langues pour préparer l'avenir des membres, avec une préparation dédiée au niveau A2 en anglais.</p>
          </div>
          <div className="card item-reveal">
            <i className="fa-solid fa-laptop-code" />
            <h3>Informatique</h3>
            <p>Initiation à l'informatique : bureautique et programmation, pas à pas.</p>
          </div>
        </div>
      </section>

      {/* ================= CTA ORIENTATION ================= */}
      <section className="cta-block reveal">
        <h2>Orientation Scolaire et Professionnelle</h2>
        <p>Trouvez la voie qui correspond à vos ambitions. Découvrez les filières accessibles selon votre série du Baccalauréat.</p>
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
