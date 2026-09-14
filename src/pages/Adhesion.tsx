import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCameraCapture } from '../hooks/useCameraCapture';
import { API_URL } from '../services/config';

const PROVINCES = ['Antsiranana', 'Antananarivo', 'Toamasina', 'Mahajanga', 'Toliara', 'Fianarantsoa'];

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
  filiere: string;
}

const initialValues: FormValues = {
  nom: '', prenom: '', email: '', tel: '', adresse: '',
  province: '', region: '', district: '', sexe: '', filiere: '',
};

const Adhesion = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [photoError, setPhotoError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const { videoRef, canvasRef, photoData, cameraActive, startCamera, capturePhoto, retakePhoto } = useCameraCapture();
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const firstErrorRef = useRef<HTMLElement | null>(null);

  // adhesion.js ne fait aucun scroll vers message-box sauf via messageBox.scrollIntoView
  useEffect(() => {
    if (message) messageBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message]);

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  // adhesion.js ne fait qu'une vérification "non vide" — pas de regex, contrairement à Inscription
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    let isValid = true;
    const newErrors: Partial<Record<keyof FormValues, boolean>> = {};
    firstErrorRef.current = null;

    (Object.keys(values) as (keyof FormValues)[]).forEach((field) => {
      if (!values[field].trim()) {
        isValid = false;
        newErrors[field] = true;
      }
    });

    if (!photoData) {
      isValid = false;
      setPhotoError(true);
    } else {
      setPhotoError(false);
    }

    setErrors(newErrors);

    if (!isValid) {
      requestAnimationFrame(() => {
        document.querySelector('.input-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setSubmitting(true);

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
      filiere: values.filiere.trim(),
      photoData,
      photo: photoData,
    };

    try {
      const response = await fetch(`${API_URL}/adhesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        navigate('/confirmation?type=adhesion');
      } else {
        setMessage({ text: result.error || 'Une erreur est survenue lors de l\'enregistrement.', isError: true });
      }
    } catch {
      setMessage({ text: 'Impossible de contacter le serveur. Vérifiez que votre serveur Node.js est démarré.', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="page-intro">
        <span className="eyebrow">FIMPISAVA</span>
        <h1>Formulaire d'adhésion</h1>
        <p>Quelques informations suffisent pour devenir membre de l'association FIMPISAVA.</p>
      </div>

      {message && (
        <div
          ref={messageBoxRef}
          id="message-box"
          style={{
            display: 'block',
            background: message.isError ? '#fdecea' : '#e6f4ea',
            color: message.isError ? '#b3261e' : '#1b4332',
          }}
        >
          {message.text}
        </div>
      )}

      <form id="adhesion-form" className="form" noValidate onSubmit={handleSubmit}>

        {/* ===== BLOCK 1 : Informations personnelles ===== */}
        <fieldset className="block block-1">
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
              {errors.email && <span className="error-text" style={{ display: 'block' }}>Veuillez entrer une adresse email valide.</span>}
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

          <div className={`input-box full ${photoError ? 'input-error' : ''}`} style={{ marginTop: '20px' }}>
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
        </fieldset>

        {/* ===== BLOCK 2 : Origine & études ===== */}
        <fieldset className="block block-2">
          <legend><span className="step-no">02</span> Origine géographique & Études</legend>

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

            <div className="input-box full">
              <label htmlFor="filiere">Filière / Mention d'étude <span className="required-star">*</span></label>
              <input
                type="text" id="filiere" placeholder="Ex : Informatique, Droit, Gestion, Economie..." className={errors.filiere ? 'input-error' : ''}
                value={values.filiere} onChange={(e) => handleChange('filiere', e.target.value)}
              />
              {errors.filiere && <span className="error-text" style={{ display: 'block' }}>Veuillez renseigner votre filière d'étude.</span>}
            </div>
          </div>
        </fieldset>

        <button type="submit" id="submit-btn" disabled={submitting}>
          {submitting ? 'Envoi en cours...' : "S'inscrire"}
        </button>
      </form>
    </main>
  );
};

export default Adhesion;
