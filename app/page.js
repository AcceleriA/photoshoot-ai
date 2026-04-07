'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
// heic2any accède à window au chargement — import dynamique pour éviter le crash SSR
// L'import réel se fait dans processFile() via : const { default: heic2any } = await import('heic2any');

const STEPS = ['Photos', 'Objectif', 'Génération', 'Résultats'];

// ============================================================
// Sécurité : types MIME autorisés et taille max par fichier
// ============================================================
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 Mo par fichier
const ALLOWED_DATA_URL_PREFIXES = ['data:image/jpeg;', 'data:image/png;', 'data:image/webp;'];

function isAllowedFile(file) {
  const nameLC = file.name.toLowerCase();
  const extOk = ALLOWED_EXTENSIONS.some(ext => nameLC.endsWith(ext));
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.type) || file.type === '';
  return (extOk || mimeOk) && file.size <= MAX_FILE_SIZE;
}

function isHeicFile(file) {
  const nameLC = file.name.toLowerCase();
  return nameLC.endsWith('.heic') || nameLC.endsWith('.heif') ||
    file.type === 'image/heic' || file.type === 'image/heif';
}

function isValidDataUrl(url) {
  return ALLOWED_DATA_URL_PREFIXES.some(prefix => url.startsWith(prefix));
}

// ============================================================
// Composant principal
// ============================================================
export default function ProfilShotApp() {
  const [step, setStep] = useState(0);

  // Multi-images : array de { id, file, preview, base64 }
  const [images, setImages] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [promptStatuses, setPromptStatuses] = useState({});
  const [promptErrors, setPromptErrors] = useState({});
  const [results, setResults] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const abortRef = useRef(null);
  const completionSentRef = useRef(false);

  // Notify parent (acceleria.co) when generation completes
  useEffect(() => {
    if (step === 3 && Object.keys(results).length > 0 && !completionSentRef.current) {
      const totalPhotos = Object.values(results).reduce((sum, imgs) => sum + imgs.length, 0);
      if (totalPhotos > 0) {
        completionSentRef.current = true;
        try {
          window.parent.postMessage({
            type: 'tool-completion',
            payload: {
              photosGenerated: totalPhotos,
              objective: selectedObjective?.label || null,
              completedAt: new Date().toISOString(),
            },
          }, 'https://www.acceleria.co');
        } catch (_) { /* not embedded */ }
      }
    }
  }, [step, results, selectedObjective]);

  // Config chargée depuis /api/config (source unique de vérité)
  const [objectives, setObjectives] = useState([]);
  const [sampleCount, setSampleCount] = useState(2);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Charger la config au montage
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setObjectives(data.objectives || []);
        setSampleCount(data.sampleCount || 2);
        setConfigLoaded(true);
      })
      .catch(err => {
        console.error('Config load error:', err);
        setConfigLoaded(true); // Afficher quand même l'UI
      });
  }, []);

  // ============================================================
  // Gestion des images (multi-upload avec nettoyage mémoire)
  // ============================================================

  // Convertir un Blob en base64 JPEG via canvas (redim max 2048px)
  const blobToJpegBase64 = useCallback((blob) => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        URL.revokeObjectURL(objectUrl);
        resolve({ preview: null, base64: null });
      }, 15000);

      img.onload = () => {
        clearTimeout(timeout);
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
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({ preview: objectUrl, base64: jpegDataUrl.split(',')[1] });
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve({ preview: null, base64: null });
        }
      };
      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        resolve({ preview: null, base64: null });
      };
      img.src = objectUrl;
    });
  }, []);

  // Convertir un fichier en base64 et l'ajouter à la liste
  const processFile = useCallback(async (file) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setIsProcessing(true);

    try {
      // 1) Tenter la conversion directe via canvas (fonctionne pour JPEG, PNG, WebP, et HEIC sur Safari)
      let result = await blobToJpegBase64(file);

      // 2) Si le navigateur n'a pas pu decoder (HEIC sur Chrome/Firefox), convertir via heic2any
      if (!result.base64 && isHeicFile(file)) {
        try {
          const { default: heic2any } = await import('heic2any');
          const jpegBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
          const converted = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob;
          result = await blobToJpegBase64(converted);
        } catch (heicErr) {
          console.error('HEIC conversion failed:', heicErr);
        }
      }

      // 3) Ajouter l'image (compressée ou fallback raw)
      if (result.base64) {
        setImages(prev => [...prev, { id, file, preview: result.preview, base64: result.base64 }]);
      } else {
        // Dernier recours : base64 brut (sera probablement trop gros)
        const reader = new FileReader();
        reader.onload = (ev) => {
          const rawBase64 = ev.target.result.split(',')[1];
          setImages(prev => [...prev, { id, file, preview: null, base64: rawBase64 }]);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('processFile error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [blobToJpegBase64]);

  // Supprimer une image + libérer l'URL en mémoire
  const removeImage = useCallback((id) => {
    setImages(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  // Nettoyage global au démontage
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Gestion du changement de fichier (multi-select)
  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (isAllowedFile(file)) {
        processFile(file);
      }
    });
    // Reset input pour pouvoir re-sélectionner les mêmes fichiers
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [processFile]);

  // Gestion du drag & drop (multi-fichier)
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    files.forEach(file => {
      if (isAllowedFile(file)) {
        processFile(file);
      }
    });
  }, [processFile]);

  // Passer à l'étape objectif
  const handleContinue = () => {
    if (images.length === 0) return;
    setStep(1);
  };

  // ============================================================
  // Génération
  // ============================================================

  const handleGenerate = async () => {
    if (!selectedObjective || images.length === 0) return;

    const objective = objectives.find(o => o.id === selectedObjective);
    if (!objective) return;

    // Annuler toute génération précédente en cours
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStep(2);
    setGenerating(true);
    setResults({});
    setPromptErrors({});
    setPromptStatuses({});

    const imagesBase64 = images.map(img => img.base64);
    const jpegReady = images.every(img => img.preview !== null);

    // Vérifier la taille totale du payload (limite Vercel ~4.5MB)
    const totalBase64Chars = imagesBase64.reduce((sum, b64) => sum + (b64?.length || 0), 0);
    const estimatedPayloadMB = (totalBase64Chars * 0.75) / (1024 * 1024);
    if (estimatedPayloadMB > 4) {
      setGenerating(false);
      setStep(1);
      alert(`Les images totalisent ~${estimatedPayloadMB.toFixed(1)} Mo, ce qui dépasse la limite serveur (4 Mo). Essayez avec moins de photos ou des photos plus légères (JPEG au lieu de HEIC).`);
      return;
    }

    let successCount = 0;

    // Générer séquentiellement pour éviter les limites de débit
    for (const prompt of objective.prompts) {
      // Vérifier si l'utilisateur a annulé
      if (controller.signal.aborted) break;

      setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'loading' }));

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId: prompt.id,
            imagesBase64,
            jpegReady,
            sampleCount,
          }),
          signal: controller.signal,
        });

        // Gestion du rate limit 429
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After');
          const waitSec = retryAfter ? parseInt(retryAfter, 10) : 60;
          setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'error' }));
          setPromptErrors(prev => ({
            ...prev,
            [prompt.id]: `Limite atteinte. Réessayez dans ${waitSec}s.`,
          }));
          continue;
        }

        const data = await res.json();

        if (data.error) {
          setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'error' }));
          setPromptErrors(prev => ({ ...prev, [prompt.id]: data.error }));
        } else {
          const safeImages = (data.images || []).filter(url => isValidDataUrl(url));
          setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'done' }));
          setResults(prev => ({ ...prev, [prompt.id]: safeImages }));
          if (safeImages.length > 0) successCount++;
          if (data.warnings) {
            setPromptErrors(prev => ({
              ...prev,
              [prompt.id]: `${data.generated}/${data.requested} photos générées`,
            }));
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') break;
        setPromptStatuses(prev => ({ ...prev, [prompt.id]: 'error' }));
        setPromptErrors(prev => ({
          ...prev,
          [prompt.id]: 'Erreur réseau. Vérifiez votre connexion.',
        }));
        console.error(`Prompt ${prompt.id} error:`, err);
      }
    }

    setGenerating(false);

    // Si tous les prompts ont échoué, rester sur step 2 avec message visible
    // sinon passer aux résultats
    if (successCount === 0 && !controller.signal.aborted) {
      setPromptStatuses(prev => ({ ...prev, _allFailed: true }));
    }
    setStep(3);
  };

  // ============================================================
  // Téléchargements
  // ============================================================

  const downloadImage = (dataUrl, name) => {
    try {
      // Convert data URL to blob for reliable cross-browser/iframe download
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${name}.png`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: open in new tab so user can long-press/save
      window.open(dataUrl, '_blank');
    }
  };

  const downloadAll = () => {
    const objective = objectives.find(o => o.id === selectedObjective);
    if (!objective) return;

    let delay = 0;
    Object.entries(results).forEach(([promptId, imgs]) => {
      const prompt = objective.prompts.find(p => p.id === parseInt(promptId));
      if (!Array.isArray(imgs)) return;
      imgs.forEach((img, i) => {
        setTimeout(() => {
          try {
            downloadImage(img, `photoshoot-${prompt?.name || promptId}-${i + 1}`);
          } catch (err) {
            console.error(`Download failed for ${promptId}-${i}:`, err);
          }
        }, delay);
        delay += 200;
      });
    });
  };

  // ============================================================
  // Reset
  // ============================================================

  const handleReset = () => {
    // Annuler toute génération en cours
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    // Libérer les URLs en mémoire
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    setStep(0);
    setImages([]);
    setSelectedObjective(null);
    setGenerating(false);
    setPromptStatuses({});
    setPromptErrors({});
    setResults({});
  };

  const objective = objectives.find(o => o.id === selectedObjective);

  // Compteur total de photos pour l'objectif sélectionné
  const totalPhotos = objective ? objective.prompts.length * sampleCount : 0;

  // ============================================================
  // Render
  // ============================================================

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
            Profil<span className="a-orange">Shot</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {step > 0 && (
              <button className="btn btn--ghost" onClick={handleReset} style={{ fontSize: '13px', padding: '8px 16px' }}>
                Nouvelle session
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
                Génération IA avancée
              </div>
              <h1 style={{ marginBottom: '16px' }}>
                Vos photos <em>professionnelles</em>,{' '}
                générées par IA
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: '0 auto 40px', fontSize: '18px' }}>
                Importez vos photos, choisissez un objectif, recevez vos clichés en quelques minutes.
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

        {/* Étape 0 : Import des photos */}
        {step === 0 && (
          <section className="section animate-fade">
            <div className="container" style={{ maxWidth: '720px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '12px' }}>
                Importez vos <em>photos</em>
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '0 auto 32px', fontSize: '15px' }}>
                Ajoutez 1 à 5 photos de référence. Plus vous en fournissez, meilleure sera la préservation d'identité.
              </p>

              {/* Zone d'upload */}
              <label
                htmlFor="photo-upload"
                className={`upload-zone ${images.length > 0 ? 'has-image' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={images.length > 0 ? { padding: '24px' } : {}}
              >
                {images.length > 0 ? (
                  <div style={{ width: '100%' }}>
                    {/* Grille de previews */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`,
                      gap: '12px',
                      marginBottom: '16px',
                    }}>
                      {images.map((img) => (
                        <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-card)' }}>
                          {img.preview ? (
                            <img src={img.preview} alt={img.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '8px', textAlign: 'center' }}>
                              {img.file.name}
                            </div>
                          )}
                          {/* Bouton supprimer */}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(img.id); }}
                            style={{
                              position: 'absolute', top: '4px', right: '4px',
                              width: '22px', height: '22px', borderRadius: '50%',
                              background: 'rgba(0,0,0,0.7)', color: '#fff',
                              border: 'none', cursor: 'pointer', fontSize: '13px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              lineHeight: 1,
                            }}
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                    {images.length < 5 && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                        Cliquez ou glissez pour ajouter ({5 - images.length} restante{5 - images.length > 1 ? 's' : ''})
                      </p>
                    )}
                    {images.length >= 5 && (
                      <p style={{ fontSize: '13px', color: 'var(--accent)', textAlign: 'center', margin: 0 }}>
                        Maximum atteint (5 photos)
                      </p>
                    )}
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
                      Cliquez ou glissez vos photos ici
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '8px auto 0' }}>
                      Tous les formats acceptés - Photos de face ou trois-quarts - Jusqu'à 5 photos
                    </p>
                  </>
                )}
                <input
                  id="photo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={images.length >= 5}
                />
              </label>

              {images.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    className="btn btn--primary btn--large"
                    onClick={handleContinue}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Traitement en cours...' : 'Choisir l\'objectif'}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Étape 1 : Choix de l'objectif */}
        {step === 1 && configLoaded && (
          <section className="section animate-fade">
            <div className="container container--wide">
              <h2 style={{ textAlign: 'center', marginBottom: '12px' }}>
                Quel est votre <em>objectif</em> ?
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '0 auto 40px', fontSize: '16px' }}>
                Chaque objectif active un ensemble de styles optimisés pour l'usage visé.
              </p>

              <div className="objectives-grid">
                {objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={`objective-card ${selectedObjective === obj.id ? 'selected' : ''}`}
                    onClick={() => setSelectedObjective(obj.id)}
                  >
                    <div className="objective-dot" style={{ backgroundColor: obj.color }} />
                    <h3>{obj.label}</h3>
                    <p>{obj.description}</p>
                    <p style={{ fontSize: '13px', color: 'var(--accent)', marginTop: '8px' }}>
                      {obj.prompts.length} style{obj.prompts.length > 1 ? 's' : ''} → {obj.totalPhotos} photos
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
                    Lancer la génération ({totalPhotos} photos)
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
                  const errorMsg = promptErrors[prompt.id];
                  const promptImages = results[prompt.id];
                  const statusLabels = {
                    pending: 'En attente',
                    loading: 'Génération...',
                    done: `${promptImages?.length || sampleCount} photo${(promptImages?.length || sampleCount) > 1 ? 's' : ''}`,
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
                      <div style={{ textAlign: 'right' }}>
                        <div className={`prompt-status ${status}`}>
                          {status === 'loading' && <span className="spinner" style={{ width: 14, height: 14, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />}
                          {statusLabels[status]}
                        </div>
                        {/* Message d'erreur détaillé */}
                        {errorMsg && status === 'error' && (
                          <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0', maxWidth: '280px' }}>
                            {errorMsg}
                          </p>
                        )}
                        {/* Warning (génération partielle) */}
                        {errorMsg && status === 'done' && (
                          <p style={{ fontSize: '12px', color: '#f59e0b', margin: '4px 0 0' }}>
                            {errorMsg}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message si toutes les générations ont échoué */}
              {step === 3 && Object.keys(results).length === 0 && promptStatuses._allFailed && (
                <div style={{ textAlign: 'center', marginTop: '32px', padding: '24px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <p style={{ color: '#ef4444', fontSize: '16px', margin: '0 0 12px' }}>
                    Toutes les generations ont echoue.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 16px' }}>
                    Verifiez votre connexion ou essayez avec d'autres photos.
                  </p>
                  <button className="btn btn--primary" onClick={handleReset}>
                    Recommencer
                  </button>
                </div>
              )}

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
                    const promptImages = results[prompt.id];
                    if (!promptImages || promptImages.length === 0) return null;
                    return (
                      <div key={prompt.id} className="results-group">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="prompt-color-dot" style={{ backgroundColor: prompt.color }} />
                          {prompt.name}
                        </h3>
                        <div className="results-grid">
                          {promptImages.map((img, i) => (
                            <div key={i} className="result-image-wrapper" style={{ position: 'relative' }}>
                              <img
                                src={img}
                                alt={`${prompt.name} - variante ${i + 1}`}
                                className="result-image"
                                onClick={() => setLightboxImage(img)}
                                style={{ cursor: 'pointer' }}
                              />
                              <button
                                className="result-download-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadImage(img, `profilshot-${prompt.name || promptId}-${i + 1}`);
                                }}
                                title="Télécharger cette photo"
                                style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  right: '8px',
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  border: 'none',
                                  background: 'rgba(0,0,0,0.65)',
                                  backdropFilter: 'blur(8px)',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.85)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              </button>
                            </div>
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
            ProfilShot par AcceleriA
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(lightboxImage, `profilshot-${Date.now()}`);
            }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              zIndex: 1001,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Télécharger
          </button>
        </div>
      )}
    </>
  );
}
