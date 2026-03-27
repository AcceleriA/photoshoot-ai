'use client';

import { useState, useRef, useCallback } from 'react';

// ============================================================
// Data - Objectives & Prompts (client-side subset)
// ============================================================
const OBJECTIVES = [
  {
    id: 'linkedin-profile',
    label: 'Photo de profil LinkedIn',
    description: 'Confiance, credibilite, intemporalite',
    color: '#6c40f3',
    prompts: [
      { id: 4, name: 'Portrait premium fond sombre', color: '#6c40f3', desc: 'Photo signature, fond noir/gris' },
      { id: 11, name: 'Minimal clair', color: '#6b7280', desc: 'Passe-partout, zero risque' },
      { id: 2, name: 'Portrait lifestyle premium', color: '#4f9aea', desc: 'Plus humain, moins institutionnel' },
    ],
  },
  {
    id: 'linkedin-posts',
    label: 'Posts LinkedIn incarnes',
    description: 'Naturel, proximite, credibilite humaine',
    color: '#4f9aea',
    prompts: [
      { id: 3, name: 'Cafe et quotidien urbain', color: '#22c55e', desc: 'Ultra humain, non pose' },
      { id: 10, name: 'Mouvement naturel', color: '#22c55e', desc: 'Dynamique calme' },
      { id: 8, name: 'Golden hour', color: '#f97316', desc: 'Chaleur maitrisee' },
    ],
  },
  {
    id: 'about-page',
    label: 'Page "A propos" / Site web',
    description: 'Coherence, lisibilite, serieux',
    color: '#feb06a',
    prompts: [
      { id: 9, name: 'Fond brut et matieres', color: '#92400e', desc: 'Authentique, solide' },
      { id: 2, name: 'Portrait lifestyle premium', color: '#4f9aea', desc: 'Equilibre image / humain' },
      { id: 11, name: 'Minimal clair', color: '#6b7280', desc: 'Tres clean' },
    ],
  },
  {
    id: 'senior-profile',
    label: 'Client exigeant / Profil senior',
    description: 'Fidelite, zero artefact IA',
    color: '#ef4444',
    prompts: [
      { id: 5, name: 'Ultra-safe minimal', color: '#ef4444', desc: 'Securite maximale' },
      { id: 11, name: 'Minimal clair', color: '#6b7280', desc: 'Tres stable' },
      { id: 4, name: 'Portrait premium fond sombre', color: '#6c40f3', desc: 'Si le visage s\'y prete' },
    ],
  },
  {
    id: 'corporate',
    label: 'Photo corporate fond couleur',
    description: 'Institutionnel, fond maitrise',
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
    description: 'Toutes les variantes (16 a 20 photos)',
    color: '#6c40f3',
    prompts: [
      { id: 1, name: 'Lifestyle urbain', color: '#4f9aea', desc: 'Serie principale (4 photos)' },
      { id: 2, name: 'Portrait lifestyle premium', color: '#4f9aea', desc: 'Photo de profil' },
      { id: 3, name: 'Cafe et quotidien', color: '#22c55e', desc: 'Posts et quotidien' },
      { id: 4, name: 'Portrait premium fond sombre', color: '#6c40f3', desc: 'Photo signature' },
      { id: 5, name: 'Ultra-safe minimal', color: '#ef4444', desc: 'Correction si necessaire' },
    ],
  },
];

const STEPS = ['Upload', 'Objectif', 'Generation', 'Resultats'];

// ============================================================
// Main App Component
// ============================================================
export default function PhotoshootApp() {
  const [step, setStep] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [promptStatuses, setPromptStatuses] = useState({});
  const [results, setResults] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);
  const fileInputRef = useRef(null);

  // Convertit toute image (y compris HEIC iPhone) en JPEG base64 via canvas
  const convertToJpegBase64 = useCallback((file) => {
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    const img = new Image();
    img.onload = () => {
      // Limiter a 2048px max pour eviter les problemes memoire
      const MAX_SIZE = 2048;
      let w = img.width;
      let h = img.height;
      if (w > MAX_SIZE || h > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / w, MAX_SIZE / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const base64 = jpegDataUrl.split(',')[1];
      setImageBase64(base64);
    };
    img.src = objectUrl;
  }, []);

  // Handle file upload
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    convertToJpegBase64(file);
  }, [convertToJpegBase64]);

  // Handle drag & drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setImageFile(file);
    convertToJpegBase64(file);
  }, [convertToJpegBase64]);

  // Analyze photo (morphological analysis)
  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);
      setStep(1);
    } catch (err) {
      alert('Erreur d\'analyse : ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate images for all prompts in the objective
  const handleGenerate = async () => {
    if (!selectedObjective || !imageBase64) return;

    const objective = OBJECTIVES.find(o => o.id === selectedObjective);
    if (!objective) return;

    setStep(2);
    setGenerating(true);
    setResults({});

    // Passer l'analyse morphologique COMPLETE a Gemini (pas juste la derniere ligne)
    const subjectDesc = analysis || '';

    // Generate sequentially to avoid rate limits
    for (const prompt of objective.prompts) {
      setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'loading' }));

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId: prompt.id,
            imageBase64,
            subjectDescription: subjectDesc,
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

  // Download single image
  const downloadImage = (dataUrl, name) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${name}.png`;
    a.click();
  };

  // Download all images
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

  // Reset
  const handleReset = () => {
    setStep(0);
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    setSelectedObjective(null);
    setAnalysis(null);
    setPromptStatuses({});
    setResults({});
  };

  const objective = OBJECTIVES.find(o => o.id === selectedObjective);

  return (
    <>
      {/* Tricolor bar top */}
      <div className="tricolor-bar">
        <span /><span /><span />
      </div>

      {/* Nav */}
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

      {/* Main */}
      <main>
        {/* Hero + Stepper */}
        <section className="section section--hero section-glow">
          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div className="animate-hero">
              <div className="badge" style={{ marginBottom: '24px' }}>
                <span className="badge-dot" />
                Propulse par Gemini Flash Image
              </div>
              <h1 style={{ marginBottom: '16px' }}>
                Vos photos <em>professionnelles</em>,{' '}
                generees par IA
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: '0 auto 40px', fontSize: '18px' }}>
                Uploadez votre photo, choisissez un objectif, recevez vos photos en quelques minutes.
                Chaque image preserve votre identite et le grain naturel d'un appareil professionnel.
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

        {/* Step 0: Upload */}
        {step === 0 && (
          <section className="section animate-fade">
            <div className="container" style={{ maxWidth: '640px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>
                Uploadez votre <em>photo</em>
              </h2>

              <label
                htmlFor="photo-upload"
                className={`upload-zone ${imagePreview ? 'has-image' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="upload-preview" />
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
                      JPG, PNG, WebP ou HEIC - Photo de face ou trois-quarts
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  id="photo-upload"
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {imagePreview && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    className="btn btn--primary btn--large"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <span className="spinner" />
                        Analyse en cours...
                      </>
                    ) : (
                      'Analyser le visage'
                    )}
                  </button>
                </div>
              )}

              {analysis && (
                <div className="analysis-box">
                  {analysis}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 1: Objective */}
        {step === 1 && (
          <section className="section animate-fade">
            <div className="container container--wide">
              <h2 style={{ textAlign: 'center', marginBottom: '12px' }}>
                Quel est votre <em>objectif</em> ?
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '0 auto 40px', fontSize: '16px' }}>
                Chaque objectif active un set de prompts optimise pour l'usage vise.
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
                      {obj.prompts.length} prompt{obj.prompts.length > 1 ? 's' : ''} -&gt; {obj.prompts.length * 4} photos
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
                    Lancer la generation ({objective?.prompts.length * 4} photos)
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 2: Generating */}
        {(step === 2 || step === 3) && objective && (
          <section className="section animate-fade">
            <div className="container" style={{ maxWidth: '720px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>
                {step === 2 ? (
                  <>Generation <em>en cours</em>...</>
                ) : (
                  <>Vos photos sont <em>pretes</em></>
                )}
              </h2>

              {/* Prompt status list */}
              <div className="prompt-list">
                {objective.prompts.map((prompt) => {
                  const status = promptStatuses[prompt.id] || 'pending';
                  const statusLabels = {
                    pending: 'En attente',
                    loading: 'Generation...',
                    done: '4 photos',
                    error: 'Erreur',
                  };
                  return (
                    <div key={prompt.id} className="prompt-card">
                      <div className="prompt-info">
                        <div className="prompt-color-dot" style={{ backgroundColor: prompt.color }} />
                        <div className="prompt-meta">
                          <h4>Prompt {prompt.id} - {prompt.name}</h4>
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

              {/* Results */}
              {Object.keys(results).length > 0 && (
                <div className="results-section">
                  <div className="divider" style={{ margin: '32px 0' }} />

                  {step === 3 && (
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <button className="btn btn--primary btn--large" onClick={downloadAll}>
                        Telecharger toutes les photos
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
                              alt={`${prompt.name} - ${i + 1}`}
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

      {/* Footer */}
      <div className="divider" />
      <footer className="footer">
        <div className="container">
          <p>
            Photoshoot AI - Propulse par Google Gemini Flash Image + GPT-5.4-nano
          </p>
        </div>
      </footer>

      {/* Tricolor bar bottom */}
      <div className="tricolor-bar">
        <span /><span /><span />
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Preview" />
        </div>
      )}
    </>
  );
}
