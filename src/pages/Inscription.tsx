import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCameraCapture } from '../hooks/useCameraCapture';
import { API_URL } from '../services/config';

const REGEX_PATTERNS: Record<string, RegExp> = {
  nom: /^[a-zA-Zà-ÿÀ-Ÿ\s'-]{2,}$/,
  prenom: /^[a-zA-Zà-ÿÀ-Ÿ\s'-]{2,}$/,
  region: /^[a-zA-Zà-ÿÀ-Ÿ\s'-]{2,}$/,
  district: /^[a-zA-Zà-ÿÀ-Ÿ\s'-]{2,}$/,
  province: /^[a-zA-Zà-ÿÀ-Ÿ\s'-]{2,}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  tel: /^(?:03[23478]|020)[0-9\s.-]{7,}$/,
  adresse: /^.{3,}$/,
};

const PROVINCES = ['Antananarivo', 'Toamasina', 'Mahajanga', 'Toliara', 'Antsiranana', 'Fianarantsoa'];
const LANGUES = ['Français', 'Anglais', 'Allemand', 'Mandarin', 'Espagnol', 'Italien', 'Russe'];

interface FormValues {
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  adresse: string;
  province: string;
  region: string;
  district: string;
  sexe: string;
}

const initialValues: FormValues = {
  nom: '', prenom: '', email: '', tel: '', adresse: '',
  province: '', region: '', district: '', sexe: '',
};

// Portage direct de fileToBase64() dans Inscription.js
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const Inscription = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [langues, setLangues] = useState<string[]>([]);
  const [informatique, setInformatique] = useState(false);
  const [formationsError, setFormationsError] = useState(false);

  const [photoError, setPhotoError] = useState(false);
  const { videoRef, canvasRef, photoData, cameraActive, startCamera, capturePhoto, retakePhoto } = useCameraCapture();

  const [preuvePaiement, setPreuvePaiement] = useState<File | null>(null);
  const [preuveError, setPreuveError] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const validateField = (field: keyof FormValues): boolean => {
    const value = values[field].trim();
    const pattern = REGEX_PATTERNS[field];
    const isValid = Boolean(value) && (!pattern || pattern.test(value));
    setErrors((prev) => ({ ...prev, [field]: !isValid }));
    return isValid;
  };

  const validateFields = (fields: (keyof FormValues)[]): boolean => {
    let allValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) allValid = false;
    });
    return allValid;
  };

  const validatePhotoStep = (): boolean => {
    const isValid = Boolean(photoData);
    setPhotoError(!isValid);
    return isValid;
  };

  const validateFormationsStep = (): boolean => {
    const isValid = langues.length > 0 || informatique;
    setFormationsError(!isValid);
    return isValid;
  };

  const toggleLangue = (langue: string) => {
    setLangues((prev) => (prev.includes(langue) ? prev.filter((l) => l !== langue) : [...prev, langue]));
    setFormationsError(false);
  };

  const validatePaymentStep = (): boolean => {
    const isValid = preuvePaiement !== null;
    setPreuveError(!isValid);
    return isValid;
  };

  const goNext = () => {
    let stepIsValid = true;

    if (step === 1) {
      stepIsValid = validateFields(['nom', 'prenom', 'email', 'tel', 'adresse']) && validatePhotoStep();
    } else if (step === 2) {
      stepIsValid = validateFields(['province', 'region', 'district', 'sexe']);
    } else if (step === 3) {
      stepIsValid = validateFormationsStep();
    }

    if (stepIsValid) setStep((s) => s + 1);
  };

  const goPrev = () => setStep((s) => s - 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const step1Valid = validateFields(['nom', 'prenom', 'email', 'tel', 'adresse']) && validatePhotoStep();
    const step2Valid = validateFields(['province', 'region', 'district', 'sexe']);
    const step3Valid = validateFormationsStep();
    const step4Valid = validatePaymentStep();

    if (!step1Valid) { setStep(1); return; }
    if (!step2Valid) { setStep(2); return; }
    if (!step3Valid) { setStep(3); return; }
    if (!step4Valid) { setStep(4); return; }

    // Gardes-fous répliqués depuis Inscription.js (redondants avec les validations
    // ci-dessus, mais je les garde pour rester fidèle au comportement d'origine)
    if (!photoData) {
      setMessage({ text: 'Veuillez prendre une photo avec la caméra avant de valider !', isError: true });
      return;
    }
    if (!preuvePaiement) {
      setMessage({ text: 'Veuillez joindre une image du reçu de versement avant de valider !', isError: true });
      return;
    }

    setSubmitting(true);

    try {
      const preuvePaiementBase64 = await fileToBase64(preuvePaiement);

      const formations = [...langues];
      if (informatique) formations.push('Informatique');

      const payload = {
        nom: values.nom.trim(),
        prenom: values.prenom.trim(),
        email: values.email.trim(),
        tel: values.tel.trim(),
        adresse: values.adresse.trim(),
        province: values.province.trim(),
        region: values.region.trim(),
        district: values.district.trim(),
        sexe: values.sexe,
        photoData,
        photo: photoData,
        preuvePaiement: preuvePaiementBase64,
        preuveVersement: preuvePaiementBase64,
        formations,
      };

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        navigate('/confirmation?type=formation');
      } else {
        setMessage({ text: result.error || 'Une erreur est survenue lors de l\'enregistrement.', isError: true });
      }
    } catch {
      setMessage({ text: "Impossible de contacter le serveur. Vérifiez que 'node server.js' est bien démarré.", isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="page-intro">
        <span className="eyebrow">FIMPISAVA</span>
        <h1>Formulaire d'inscription</h1>
        <p>Quelques informations suffisent pour vous inscrire à FIMPISAVA et accéder à nos formations.</p>
      </div>

      {message && (
        <div
          id="message-box"
          style={{
            display: 'block',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: 500,
            background: message.isError ? '#fdecea' : '#e6f4ea',
            color: message.isError ? '#b3261e' : '#0d47a1',
          }}
        >
          {message.text}
        </div>
      )}

      <form id="inscription-form" className="form" noValidate onSubmit={handleSubmit}>

        {/* ===== ÉTAPE 1 : Infos personnelles ===== */}
        <fieldset className={`block block-1 form-step ${step === 1 ? 'active' : ''}`}>
          <legend><span className="step-no">01</span> Informations personnelles</legend>

          <div className="grid">
            <div className="input-box">
              <label htmlFor="nom">Nom <span className="required-star">*</span></label>
              <input
                type="text" id="nom" className={errors.nom ? 'input-error' : ''}
                value={values.nom} onChange={(e) => handleChange('nom', e.target.value)}
              />
              {errors.nom && <span className="error-text" style={{ display: 'block' }}>Veuillez entrer un nom valide (au moins 2 lettres).</span>}
            </div>

            <div className="input-box">
              <label htmlFor="prenom">Prénom <span className="required-star">*</span></label>
              <input
                type="text" id="prenom" className={errors.prenom ? 'input-error' : ''}
                value={values.prenom} onChange={(e) => handleChange('prenom', e.target.value)}
              />
              {errors.prenom && <span className="error-text" style={{ display: 'block' }}>Veuillez entrer un prénom valide (au moins 2 lettres).</span>}
            </div>

            <div className="input-box">
              <label htmlFor="email">Email <span className="required-star">*</span></label>
              <input
                type="email" id="email" placeholder="exemple@gmail.com" className={errors.email ? 'input-error' : ''}
                value={values.email} onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email && <span className="error-text" style={{ display: 'block' }}>Veuillez entrer une adresse email valide (ex: nom@domaine.com).</span>}
            </div>

            <div className="input-box">
              <label htmlFor="tel">Téléphone <span className="required-star">*</span></label>
              <input
                type="tel" id="tel" placeholder="03X XX XXX XX" className={errors.tel ? 'input-error' : ''}
                value={values.tel} onChange={(e) => handleChange('tel', e.target.value)}
              />
              {errors.tel && <span className="error-text" style={{ display: 'block' }}>Format de téléphone invalide (ex: 034 12 345 67).</span>}
            </div>

            <div className="input-box full">
              <label htmlFor="adresse">Adresse à Antananarivo <span className="required-star">*</span></label>
              <input
                type="text" id="adresse" placeholder="Ex : Ankatso" className={errors.adresse ? 'input-error' : ''}
                value={values.adresse} onChange={(e) => handleChange('adresse', e.target.value)}
              />
              {errors.adresse && <span className="error-text" style={{ display: 'block' }}>Veuillez indiquer une adresse valide.</span>}
            </div>
          </div>

          <div className={`input-box full ${photoError ? 'input-error' : ''}`}>
            <label>Photo de profil <span className="required-star">*</span></label>

            <div className="camera-container">
              {!cameraActive && !photoData && (
                <button type="button" className="btn-camera" onClick={startCamera}>
                  <i className="fa-solid fa-camera" /> Activer la caméra
                </button>
              )}

              <video
                ref={videoRef} className="camera-video" autoPlay playsInline
                style={{ display: cameraActive ? 'block' : 'none' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {photoData && <img src={photoData} className="camera-preview" alt="Photo capturée" />}

              {cameraActive && (
                <div className="camera-actions" style={{ display: 'flex' }}>
                  <button type="button" className="btn-camera" onClick={capturePhoto}>
                    <i className="fa-solid fa-circle-dot" /> Prendre la photo
                  </button>
                </div>
              )}
              {photoData && (
                <div className="camera-actions" style={{ display: 'flex' }}>
                  <button type="button" className="btn-camera btn-camera-secondary" onClick={retakePhoto}>
                    <i className="fa-solid fa-rotate-right" /> Refaire
                  </button>
                </div>
              )}
            </div>
            {photoError && <span className="error-text" style={{ display: 'block' }}>Veuillez prendre une photo.</span>}
          </div>

          <div className="step-nav">
            <span />
            <button type="button" className="btn-next" onClick={goNext}>Suivant <i className="fa-solid fa-arrow-right" /></button>
          </div>
        </fieldset>

        {/* ===== ÉTAPE 2 : Origine géographique ===== */}
        <fieldset className={`block block-2 form-step ${step === 2 ? 'active' : ''}`}>
          <legend><span className="step-no">02</span> Origine géographique</legend>

          <div className="grid">
            <div className="input-box">
              <label htmlFor="province">Province <span className="required-star">*</span></label>
              <input
                list="province-list" id="province" placeholder="Choisir..." className={errors.province ? 'input-error' : ''}
                value={values.province} onChange={(e) => handleChange('province', e.target.value)}
              />
              <datalist id="province-list">
                {PROVINCES.map((p) => <option key={p} value={p} />)}
              </datalist>
              {errors.province && <span className="error-text" style={{ display: 'block' }}>Veuillez sélectionner une province.</span>}
            </div>

            <div className="input-box">
              <label htmlFor="region">Région d'origine <span className="required-star">*</span></label>
              <input
                type="text" id="region" placeholder="Ex : SAVA" className={errors.region ? 'input-error' : ''}
                value={values.region} onChange={(e) => handleChange('region', e.target.value)}
              />
              {errors.region && <span className="error-text" style={{ display: 'block' }}>Veuillez préciser votre région.</span>}
            </div>

            <div className="input-box">
              <label htmlFor="district">District <span className="required-star">*</span></label>
              <input
                type="text" id="district" placeholder="Ex : Sambava" className={errors.district ? 'input-error' : ''}
                value={values.district} onChange={(e) => handleChange('district', e.target.value)}
              />
              {errors.district && <span className="error-text" style={{ display: 'block' }}>Veuillez indiquer votre district.</span>}
            </div>

            <div className="input-box">
              <label htmlFor="sexe">Sexe <span className="required-star">*</span></label>
              <select
                id="sexe" className={errors.sexe ? 'input-error' : ''}
                value={values.sexe} onChange={(e) => handleChange('sexe', e.target.value)}
              >
                <option value="" disabled>Sélectionner...</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              {errors.sexe && <span className="error-text" style={{ display: 'block' }}>Veuillez choisir votre sexe.</span>}
            </div>
          </div>

          <div className="step-nav">
            <button type="button" className="btn-prev" onClick={goPrev}><i className="fa-solid fa-arrow-left" /> Précédent</button>
            <button type="button" className="btn-next" onClick={goNext}>Suivant <i className="fa-solid fa-arrow-right" /></button>
          </div>
        </fieldset>

        {/* ===== ÉTAPE 3 : Formations souhaitées ===== */}
        <fieldset className={`block block-3 form-step ${step === 3 ? 'active' : ''}`}>
          <legend><span className="step-no">03</span> Formations souhaitées</legend>
          <p className="block-hint">Sélectionnez <strong>2 langues max</strong>. L'informatique peut être ajoutée en 3ᵉ option.</p>

          <div className={`checkbox-group ${formationsError ? 'checkbox-group-error' : ''}`}>
            <p><strong>Langues (2 max) <span className="required-star">*</span> :</strong></p>
            <div className="checkbox">
              {LANGUES.map((langue) => (
                <label key={langue}>
                  <input
                    type="checkbox"
                    checked={langues.includes(langue)}
                    disabled={langues.length >= 2 && !langues.includes(langue)}
                    onChange={() => toggleLangue(langue)}
                  /> {langue}
                </label>
              ))}
            </div>

            <hr style={{ margin: '15px 0', border: 0, borderTop: '1px solid #e0e0e0' }} />

            <p><strong>Option informatique :</strong></p>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox" checked={informatique}
                  onChange={(e) => { setInformatique(e.target.checked); setFormationsError(false); }}
                /> Informatique
              </label>
            </div>

            {formationsError && <span className="error-text" style={{ display: 'block' }}>Veuillez choisir au moins une option de formation.</span>}
          </div>

          <div className="step-nav">
            <button type="button" className="btn-prev" onClick={goPrev}><i className="fa-solid fa-arrow-left" /> Précédent</button>
            <button type="button" className="btn-next" onClick={goNext}>Suivant <i className="fa-solid fa-arrow-right" /></button>
          </div>
        </fieldset>

        {/* ===== ÉTAPE 4 : Mode de paiement ===== */}
        <fieldset className={`block block-4 form-step ${step === 4 ? 'active' : ''}`}>
          <legend><span className="step-no">04</span> Mode de paiement</legend>

          <div className="payment-info">
            <p><strong>Frais de formation (par semestre) :</strong></p>
            <ul>
              <li>Étudiants originaires de la région <strong>SAVA</strong> : <strong>10 000 Ar</strong></li>
              <li>Étudiants des autres régions : <strong>15 000 Ar</strong></li>
            </ul>
            <p>Veuillez effectuer le versement au numéro :<br />
              <span className="payment-number">032 26 049 39</span>
            </p>
            <p>Une fois le paiement effectué, téléversez une capture d'écran ou une photo du reçu de versement ci-dessous.</p>
          </div>

          <div className="input-box full">
            <label htmlFor="preuve-paiement">Reçu de versement <span className="required-star">*</span></label>
            <input
              type="file" id="preuve-paiement" accept="image/*" capture="environment"
              className={preuveError ? 'input-error' : ''}
              onChange={(e) => { setPreuvePaiement(e.target.files?.[0] ?? null); setPreuveError(false); }}
            />
            {preuveError && <span className="error-text" style={{ display: 'block' }}>Veuillez joindre une image du reçu de versement.</span>}
          </div>

          <div className="step-nav">
            <button type="button" className="btn-prev" onClick={goPrev}><i className="fa-solid fa-arrow-left" /> Précédent</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Envoi en cours...' : "S'inscrire"}</button>
          </div>
        </fieldset>

      </form>
    </main>
  );
};

export default Inscription;
