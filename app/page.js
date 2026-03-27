'use client';

import { useState, useRef, useCallback } from 'react';

// ============================================================
// Data - Objectifs & Prompts (sous-ensemble côté client)
// ============================================================
const OBJECTIVES = [
  {
    id: 'linkedin-profile',
    label: 'Photo de profil LinkedIn',
    description: 'Confiance, crédibilité, intemporalité',
    color: '#6c40f3',
    prompts: [
      { id: 4, name: 'Portrait premium fond sombre', color: '#6c40f3', desc: 'Photo signature, fond noir/gris' },
      { id: 11, name: 'Minimal clair', color: '#6b7280', desc: 'Passe-partout, zéro risque' },
      { id: 2, name: 'Portrait lifestyle premium', color: '#4f9aea', desc: 'Plus humain, moins institutionnel' },
    ],
  },
  {
    id: 'linkedin-posts',
    label: 'Posts LinkedIn incarnés',
    description: 'Naturel, proximité, crédibilité humaine',
    color: '#4f9aea',
    prompts: [
      { id: 3, name: 'Café et quotidien urbain', color: '#22c55e', desc: 'Ultra humain, non posé' },
      { id: 10, name: 'Mouvement naturel', color: '#22c55e', desc: 'Dynamique calme' },
      { id: 8, name: 'Golden hour', color: '#f97316', desc: 'Chaleur maîtrisée' },
    ],
  },
  {
    id: 'about-page',
    label: 'Page "À propos" / Site web',
    description: 'Cohérence, lisibilité, sérieux',
    color: '#feb06a',
    prompts: [
      { id: 9, name: 'Fond brut et matières', color: '#92400e', desc: 'Authentique, solide' },
      { id: 2, name: 'Portrait lifestyle premium', color: '#4f9aea', desc: 'Équilibre image / humain' },
      { id: 11, name: 'Minimal clair', color: '#6b7280', desc: 'Très clean' },
    ],
  },
  {
    id: 'senior-profile',
    label: 'Client exigeant / Profil senior',
    description: 'Fidélité, zéro artefact IA',
    color: '#ef4444',
    prompts: [
      { id: 5, name: 'Ultra-safe minimal', color: '#ef4444', desc: 'Sécurité maximale' },
      { id: 11, name: 'Minimal clair', color: '#6b7280', desc: 'Très stable' },
      { id: 4, name: 'Portrait premium fond sombre', color: '#6c40f3', desc: 'Si le visage s\'y prête' },
    ],
  },
  {
    id: 'corporate',
    label: 'Photo corporate fond couleur',
    description: 'Institutionnel, fond maîtrisé',
    color: '#1e3a5f',
    prompts: [
      { id: 12, name: 'Corporate fond couleur', color: '#1e3a5f', desc: 'Contextes formels, dirigeants' },
      { id: 5, name: 'Ultra-safe minimal', color: '#ef4444', desc: 'Pas besoin de fond couleur' },
      { id: 11, name: 'Minimal clair', color: '#6b7280', desc: 'Alternative sobre' },
    ],
  },
  {
    id: 'full-shooting',
    label: 'Shooting complet',
    description: 'Toutes les variantes (10 photos)',
    color: '#6c40f3',
    prompts: [
      { id: 1, name: 'Lifestyle urbain', color: '#4f9aea', desc: 'Série principale (4 photos)' },
      { id: 2, name: 'Portrait lifestyle premium', color: '#4f9aea', desc: 'Photo de profil' },
      { id: 3, name: 'Café et quotidien', color: '#22c55e', desc: 'Posts et quotidien' },
      { id: 4, name: 'Portrait premium fond sombre', color: '#6c40f3', desc: 'Photo signature' },
      { id: 5, name: 'Ultra-safe minimal', color: '#ef4444', desc: 'Correction si nécessaire' },
    ],
  },
];

const STEPS = ['Photo', 'Objectif', 'Génération', 'Résultats'];

// ============================================================
// Composant principal
// ============================================================
export default function PhotoshootApp() {
  const [step, setStep] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [selectedObjective, setSelectedObjective] = useState(null);
  // analyse morphologique désactivée (Gemini travaille directement depuis l'image)
  const [generating, setGenerating] = useState(false);
  const [promptStatuses, setPromptStatuses] = useState({});
  const [results, setResults] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);
  const fileInputRef = useRef(null);

  // Convertir un fichier image en base64
  // Pour les formats non supportés par le navigateur (HEIC), on envoie le fichier brut
  // et le serveur se charge de la conversion
  const convertToBase64 = useCallback((file) => {
    const objectUrl = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawBase64 = ev.target.result.split(',')[1];

      // Tenter de charger l'image dans le navigateur
      const img = new Image();
      img.onload = () => {
        // Le navigateur arrive à décoder l'image : on la convertit en JPEG via canvas
        try {
          const canvas = document.createElement('canvas');
          const maxSize = 2048;
          let w = img.width;
          let h = img.height;
          if (w > maxSize || h > maxSize) {
            const ratio = Math.min(maxSize / w, maxSize / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          setImageBase64(jpegDataUrl.split(',')[1]);
          setImagePreview(objectUrl);
        } catch {
          // Fallback : envoyer tel quel
          setImageBase64(rawBase64);
          setImagePreview(objectUrl);
        }
      };
      img.onerror = () => {
        // Le navigateur ne supporte pas ce format (ex: HEIC sur Chrome desktop)
        // On envoie les bytes bruts, le serveur convertira
        setImagePreview(null);
        setImageBase64(rawBase64);
      };
      img.src = objectUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  // Gestion du changement de fichier
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    convertToBase64(file);
  }, [convertToBase64]);

  // Gestion du drag & drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    convertToBase64(file);
  }, [convertToBase64]);

  // Passer directement à l'étape objectif (plus d'analyse GPT)
  const handleContinue = () => {
    if (!imageBase64) return;
    setStep(1);
  };

  // Générer les images pour tous les prompts de l'objectif
  const handleGenerate = async () => {
    if (!selectedObjective || !imageBase64) return;

    const objective = OBJECTIVES.find(o => o.id === selectedObjective);
    if (!objective) return;

    setStep(2);
    setGenerating(true);
    setResults({});

    // Générer séquentiellement pour éviter les limites de débit
    for (const prompt of objective.prompts) {
      setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'loading' }));

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId: prompt.id,
            imageBase64,
          }),
        });
        const data = await res.json();

        if (data.error) {
          setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'error' }));
          console.error(`Prompt ${prompt.id} error:`, data.error);
        } else {
          setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'done' }));
          setResults(prev => ({ ...prev, [prompt.id]: data.images }));
        }
      } catch (err) {
        setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'error' }));
        console.error(`Prompt ${prompt.id} error:`, err);
      }
    }

    setGenerating(false);
    setStep(3);
  };

  // Télécharger une image
  const downloadImage = (dataUrl, name) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${name}.png`;
    a.click();
  };

  // Télécharger toutes les images
  const downloadAll = () => {
    Object.entries(results).forEach(([promptId, images]) => {
      const prompt = OBJECTIVES.find(o => o.id === selectedObjective)
        ?.prompts.find(p => p.id === parseInt(promptId));
      images.forEach((img, i) => {
        setTimeout(() => {
          downloadImage(img, `photoshoot-${prompt?.name || promptId}-${i + 1}`);
        }, i * 200);
      });
    });
  };

  // Recommencer
  const handleReset = () => {
    setStep(0);
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    setSelectedObjective(null);
    setPromptStatuses({});
    setResults({});
  };

  const objective = OBJECTIVES.find(o => o.id === selectedObjective);

  return (
    <>
      {/* Barre tricolore haut */}
      <div className="tricolor-bar">
        <span /><span /><span />
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <a className="nav-logo" href="#" onClick={handleReset}>
            Photoshoot <span className="a-orange">AI</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {step > 0 && (
              <button className="btn btn--ghost" onClick={handleReset} style={{ fontSize: '13px', padding: '8px 16px' }}>
                Nouveau shooting
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main>
        {/* Hero + Stepper */}
        <section className="section section--hero section-glow">
          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div className="animate-hero">
              <div className="badge" style={{ marginBottom: '24px' }}>
                <span className="badge-dot" />
                Propulsé par Gemini
              </div>
              <h1 style={{ marginBottom: '16px' }}>
                Vos photos <em>professionnelles</em>,{' '}
                générées par IA
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: '0 auto 40px', fontSize: '18px' }}>
                Importez votre photo, choisissez un objectif, recevez vos clichés en quelques minutes.
                Chaque image préserve votre identité et le grain naturel d'un appareil professionnel.
              </p>
            </div>

            {/* Stepper */}
            <div className="stepper">
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`stepper-step ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
                    <div className="stepper-number">
                      {i < step ? '\u2713' : i + 1}
                    </div>
                    <span>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className="stepper-line" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Étape 0 : Import de la photo */}
        {step === 0 && (
          <section className="section animate-fade">
            <div className="container" style={{ maxWidth: '640px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>
                Importez votre <em>photo</em>
              </h2>

              <label
                htmlFor="photo-upload"
                className={`upload-zone ${(imagePreview || imageBase64) ? 'has-image' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Aperçu de votre photo" className="upload-preview" />
                ) : imageBase64 ? (
                  <div className="upload-heic-placeholder">
                    <div className="upload-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p style={{ color: 'var(--text)', fontWeight: 500, marginBottom: '8px', margin: '0 auto' }}>
                      {imageFile?.name || 'Photo chargée'}
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '8px auto 0' }}>
                      Photo prête pour l'analyse
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p style={{ color: 'var(--text)', fontWeight: 500, marginBottom: '8px', margin: '0 auto' }}>
                      Cliquez ou glissez votre photo ici
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '8px auto 0' }}>
                      Tous les formats acceptés - Photo de face ou trois-quarts
                    </p>
                  </>
                )}
                <input
                  id="photo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {(imagePreview || imageBase64) && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    className="btn btn--primary btn--large"
                    onClick={handleContinue}
                  >
                    'Choisir l\'objectif'
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Étape 1 : Choix de l'objectif */}
        {step === 1 && (
          <section className="section animate-fade">
            <div className="container container--wide">
              <h2 style={{ textAlign: 'center', marginBottom: '12px' }}>
                Quel est votre <em>objectif</em> ?
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '0 auto 40px', fontSize: '16px' }}>
                Chaque objectif active un ensemble de styles optimisés pour l'usage visé.
              </p>

              <div className="objectives-grid">
                {OBJECTIVES.map((obj) => (
                  <div
                    key={obj.id}
                    className={`objective-card ${selectedObjective === obj.id ? 'selected' : ''}`}
                    onClick={() => setSelectedObjective(obj.id)}
                  >
                    <div className="objective-dot" style={{ backgroundColor: obj.color }} />
                    <h3>{obj.label}</h3>
                    <p>{obj.description}</p>
                    <p style={{ fontSize: '13px', color: 'var(--accent)', marginTop: '8px' }}>
                      {obj.prompts.length} style{obj.prompts.length > 1 ? 's' : ''} → {obj.prompts.length * 2} photos
                    </p>
                  </div>
                ))}
              </div>

              {selectedObjective && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <button
                    className="btn btn--orange btn--large"
                    onClick={handleGenerate}
                  >
                    Lancer la génération ({objective?.prompts.length * 2} photos)
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Étapes 2 et 3 : Génération et résultats */}
        {(step === 2 || step === 3) && objective && (
          <section className="section animate-fade">
            <div className="container" style={{ maxWidth: '720px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>
                {step === 2 ? (
                  <>Génération <em>en cours</em>...</>
                ) : (
                  <>Vos photos sont <em>prêtes</em></>
                )}
              </h2>

              {/* Liste des statuts par style */}
              <div className="prompt-list">
                {objective.prompts.map((prompt) => {
                  const status = promptStatuses[prompt.id] || 'pending';
                  const statusLabels = {
                    pending: 'En attente',
                    loading: 'Génération...',
                    done: '4 photos',
                    error: 'Erreur',
                  };
                  return (
                    <div key={prompt.id} className="prompt-card">
                      <div className="prompt-info">
                        <div className="prompt-color-dot" style={{ backgroundColor: prompt.color }} />
                        <div className="prompt-meta">
                          <h4>{prompt.name}</h4>
                          <p>{prompt.desc}</p>
                        </div>
                      </div>
                      <div className={`prompt-status ${status}`}>
                        {status === 'loading' && <span className="spinner" style={{ width: 14, height: 14, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />}
                        {statusLabels[status]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Résultats */}
              {Object.keys(results).length > 0 && (
                <div className="results-section">
                  <div className="divider" style={{ margin: '32px 0' }} />

                  {step === 3 && (
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <button className="btn btn--primary btn--large" onClick={downloadAll}>
                        Télécharger toutes les photos
                      </button>
                    </div>
                  )}

                  {objective.prompts.map((prompt) => {
                    const images = results[prompt.id];
                    if (!images || images.length === 0) return null;
                    return (
                      <div key={prompt.id} className="results-group">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="prompt-color-dot" style={{ backgroundColor: prompt.color }} />
                          {prompt.name}
                        </h3>
                        <div className="results-grid">
                          {images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`${prompt.name} - variante ${i + 1}`}
                              className="result-image"
                              onClick={() => setLightboxImage(img)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Pied de page */}
      <div className="divider" />
      <footer className="footer">
        <div className="container">
          <p>
            Photoshoot AI - Propulsé par Google Gemini
          </p>
        </div>
      </footer>

      {/* Barre tricolore bas */}
      <div className="tricolor-bar">
        <span /><span /><span />
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Aperçu en grand" />
        </div>
      )}
    </>
  );
}
