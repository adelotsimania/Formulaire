import { useSearchParams } from 'react-router-dom';

import '../assets/styles/pages/confirmation.css'; 

const Confirmation = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  let title = "C'est enregistré !";
  let text = 'Merci, votre demande a bien été prise en compte par FIMPISAVA.';

  if (type === 'adhesion') {
    title = 'Adhésion enregistrée !';
    text = "Merci d'avoir rejoint FIMPISAVA. Votre adhésion a bien été enregistrée dans notre système.";
  } else if (type === 'formation') {
    title = 'Inscription enregistrée !';
    text = 'Merci, votre inscription aux formations a bien été enregistrée. Nous vous recontacterons prochainement.';
  }

  return (
    <main className="confirmation-page">
      <div className="confirmation-card">
        <div className="check-icon">
          <i className="fa-solid fa-check" />
        </div>

        <h1>{title}</h1>
        <p>{text}</p>

        <div className="close-note">
          <i className="fa-regular fa-circle-check" />
          Vous pouvez fermer cette page en toute sécurité, ou revenir à l'accueil.
        </div>
      </div>
    </main>
  );
};

export default Confirmation;
