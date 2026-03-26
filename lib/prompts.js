// ============================================================
// Photoshoot AI - Bibliothèque des 13 prompts
// Chaque prompt préserve l'identité du visage et le grain naturel
// ============================================================

export const OBJECTIVES = [
  {
    id: 'linkedin-profile',
    label: 'Photo de profil LinkedIn',
    description: 'Confiance, crédibilité, intemporalité',
    color: '#6c40f3',
    prompts: [4, 11, 2],
  },
  {
    id: 'linkedin-posts',
    label: 'Posts LinkedIn incarnés',
    description: 'Naturel, proximité, crédibilité humaine',
    color: '#4f9aea',
    prompts: [3, 10, 8],
  },
  {
    id: 'about-page',
    label: 'Page "A propos" / Site web',
    description: 'Cohérence, lisibilité, sérieux',
    color: '#feb06a',
    prompts: [9, 2, 11],
  },
  {
    id: 'senior-profile',
    label: 'Client exigeant / Profil senior',
    description: 'Fidélité, zéro artefact IA',
    color: '#ef4444',
    prompts: [5, 11, 4],
  },
  {
    id: 'corporate',
    label: 'Photo corporate fond couleur',
    description: 'Institutionnel, fond maîtrisé',
    color: '#1e3a5f',
    prompts: [12, 5, 11],
  },
  {
    id: 'full-shooting',
    label: 'Shooting complet',
    description: 'Toutes les variantes (16 à 20 photos)',
    color: '#6c40f3',
    prompts: [1, 2, 3, 4, 5],
  },
];

// Base technique commune à tous les prompts
const TECH_BASE = `Le visage, les proportions et les traits doivent rester strictement identiques a ceux de la photo source. Aucune modification morphologique. Aucune idealisation ou embellissement artificiel.

Preserver strictement le grain, la texture et le niveau de bruit de la photo d'entree. Ne pas lisser la peau. Ne pas ajouter de nettete artificielle. Conserver un rendu photographique naturel, legerement granuleux, coherent avec un capteur plein format.`;

const EXPRESSION_CALM = `Expression : calme positif, bonne humeur discrete. Pas de sourire demonstratif. Micro-sourire possible, regard pose, detendu. L'emotion est lisible sans etre jouee.`;

const EXPRESSION_WARM = `Expression : bonne humeur subtile et naturelle. Pas de sourire force ni demonstratif. Micro-sourire possible, regard detendu, machoire relachee. L'emotion est perceptible sans etre jouee. Le sujet semble a l'aise, confiant, serein.`;

const CAMERA_PORTRAIT = `Camera : rendu appareil photo professionnel plein format.
Objectifs recommandes : 50 mm pour les portraits naturels, 85 mm pour les plans serres.
Ouverture realiste (f/2 a f/2.8), profondeur de champ naturelle.
Aucun flou artificiel. Perspectives realistes.`;

const CAMERA_WIDE = `Camera : rendu appareil photo professionnel plein format.
Objectifs recommandes : 35 mm pour les scenes en mouvement et environnementales, 50 mm pour les portraits naturels, 85 mm pour les plans serres.
Ouverture realiste (f/1.8 a f/2.8), profondeur de champ naturelle.`;

export const PROMPTS = {
  0: {
    id: 0,
    name: 'Analyse morphologique',
    category: 'Fondation',
    color: '#eab308',
    description: 'Analyse factuelle du visage en 12 sections - fondation de tous les prompts suivants.',
    prompt: `Analyse cette photo de maniere strictement factuelle et descriptive. Decris uniquement la personne visible, jamais le decor, l'arriere-plan, les vetements ou l'eclairage.

Aucune interpretation psychologique ou sociale. Aucun embellissement. Aucune idealisation. Ne pas corriger les asymetries, imperfections ou particularites. Ne rien inventer : tout doit etre strictement observable.

Structure l'analyse en 12 sections :
1. Morphologie generale (corpulence, carrure, proportions globales)
2. Forme du visage (ovale, carre, rond, allonge, triangulaire, etc.)
3. Peau (teint, texture, imperfections visibles, rides, taches)
4. Yeux (forme, taille, couleur, espacement, paupières)
5. Sourcils (epaisseur, forme, couleur, symetrie)
6. Nez (taille, forme, largeur, profil)
7. Bouche et levres (taille, forme, epaisseur, symetrie)
8. Oreilles (visibilite, taille relative, forme)
9. Cheveux (couleur, texture, longueur, coiffure, densité, implantation)
10. Pilosite faciale (barbe, moustache, favoris - etat actuel)
11. Expression neutre (position naturelle des traits au repos)
12. Signes distinctifs (cicatrices, grains de beaute, asymetries notables)`
  },

  1: {
    id: 1,
    name: 'Lifestyle urbain',
    category: 'Lifestyle',
    color: '#4f9aea',
    description: 'Série principale - 4 clichés urbains naturels. Base du shooting.',
    prompt: `A partir de la photo fournie, cree une serie de 4 photos professionnelles coherentes du meme individu.

${TECH_BASE}

${EXPRESSION_WARM}

Posture : naturelle, relachee mais assuree. Aucune pose figee ou cliche de photo LinkedIn. Le sujet ne pose pas, il est simplement present dans la scene.

Scene 1 : marche tranquille dans une rue urbaine moderne, regard legerement hors camera.
Scene 2 : debout pres d'un cafe en terrasse, posture ouverte, attitude detendue.
Scene 3 : appuye contre un mur clair en pierre ou beton, expression calme et reflechie.
Scene 4 : plan mi-buste face camera, decor urbain discret, arriere-plan legerement floute.

Tenue : libre et coherente avec un contexte lifestyle professionnel decontracte. Aucune tenue formelle ou costume-cravate.

${CAMERA_WIDE}
Lumiere : lumiere naturelle, douce, non dramatique, contraste modere. Balance des blancs realiste, couleurs sobres.

Style global : photographie lifestyle professionnelle, credible, non mise en scene, sans effet IA visible.`
  },

  2: {
    id: 2,
    name: 'Portrait lifestyle premium',
    category: 'Lifestyle',
    color: '#4f9aea',
    description: 'Portrait extérieur calme, rendu haut de gamme. Idéal pour photo de profil.',
    prompt: `A partir de la photo fournie, cree une serie de 4 photos professionnelles du meme individu, avec une approche portrait lifestyle premium.

${TECH_BASE}

${EXPRESSION_CALM}

Posture : naturelle, stable, assuree. Le sujet semble confortable dans la situation, pas en representation. Aucune pose LinkedIn stereotypee.

Scene 1 : portrait debout en exterieur, arriere-plan urbain ou naturel tres discret, regard hors camera.
Scene 2 : plan poitrine face camera, environnement floute, lumiere douce.
Scene 3 : portrait trois-quarts, regard legerement detourne, ambiance editoriale.
Scene 4 : portrait serre, arriere-plan neutre, expression calme et confiante.

Tenue : libre, sobre, coherente avec un contexte professionnel decontracte. Aucune tenue formelle.

${CAMERA_PORTRAIT}
Lumiere : naturelle ou diffuse, laterale douce, contraste modere. Couleurs neutres, balance des blancs realiste.

Style global : portrait lifestyle professionnel, credible, haut de gamme, non mis en scene, sans effet IA visible.`
  },

  3: {
    id: 3,
    name: 'Café et quotidien urbain',
    category: 'Lifestyle',
    color: '#22c55e',
    description: 'Lifestyle naturel, non posé. Idéal pour posts LinkedIn humanisés.',
    prompt: `A partir de la photo fournie, cree une serie de 4 photos professionnelles du meme individu dans un contexte cafe ou quotidien urbain.

${TECH_BASE}

Expression : bonne humeur discrete, aisance naturelle. Pas de sourire force ni demonstratif. Micro-sourire possible, regard calme, attitude detendue. L'emotion est visible dans le regard et la posture, pas dans une mimique.

Posture : naturelle, fluide, jamais figee. Le sujet semble simplement vivre la scene, pas poser pour une photo. Aucune posture cliche de photo LinkedIn.

Scene 1 : assis en terrasse de cafe, regard legerement hors camera, ambiance vivante mais floutee.
Scene 2 : debout a proximite d'une table ou d'un comptoir, posture ouverte, attitude detendue.
Scene 3 : marche lente dans une rue adjacente au cafe, regard calme, mouvement naturel.
Scene 4 : portrait mi-corps, environnement cafe floute, lumiere douce laterale.

Tenue : libre, coherente avec un contexte lifestyle professionnel decontracte. Aucune tenue formelle.

${CAMERA_WIDE}
Flou d'arriere-plan optique credible, jamais artificiel.
Lumiere : lumiere naturelle ou ambiante douce, contraste modere. Couleurs sobres, balance des blancs realiste.

Style global : photographie lifestyle professionnelle, humaine, credible, non mise en scene, sans effet IA visible.`
  },

  4: {
    id: 4,
    name: 'Portrait premium fond sombre',
    category: 'Studio',
    color: '#6c40f3',
    description: 'Photo signature, fond noir/gris. Photo de profil LinkedIn premium.',
    prompt: `A partir de la photo fournie, cree une serie de 4 portraits professionnels du meme individu, avec une approche portrait photographe haut de gamme.

${TECH_BASE}

Expression : calme positif, confiance tranquille. Pas de sourire large. Micro-sourire possible ou expression neutre chaleureuse. Regard vivant, pose, jamais fige. Bonne humeur perceptible sans demonstration.

Posture : stable, naturelle, assuree. Le sujet ne "pose" pas, il est simplement present. Aucune posture stereotypee de portrait corporate.

Scene 1 : portrait face camera, fond noir profond, eclairage doux et diffus.
Scene 2 : portrait trois-quarts, fond gris fonce texture, lumiere laterale douce.
Scene 3 : portrait leger de profil, fond sombre neutre, ambiance editoriale.
Scene 4 : portrait serre, fond sombre, contraste modere, regard calme.

Tenue : libre, sobre, coherente avec un contexte professionnel decontracte. Aucune tenue formelle ou costume-cravate.

${CAMERA_PORTRAIT}
Lumiere : type studio doux (softbox ou fenetre), transitions naturelles, contraste maitrise. Couleurs sobres, balance des blancs realiste.

Style global : portrait photographe professionnel haut de gamme, naturel, credible, sans effet IA visible.`
  },

  5: {
    id: 5,
    name: 'Ultra-safe minimal',
    category: 'Studio',
    color: '#ef4444',
    description: 'Sécurité maximale, zéro artefact IA. Pour clients exigeants.',
    prompt: `A partir de la photo fournie, cree une serie de 4 variations photographiques tres proches du meme individu.

Le visage, les proportions, les traits, l'age et l'expression de base doivent rester strictement identiques a la photo source. Aucune modification morphologique. Aucune idealisation. Aucune interpretation stylistique excessive.

Preserver strictement le grain, la texture et le niveau de bruit de la photo d'entree. Ne pas lisser la peau. Ne pas ameliorer la nettete. Ne pas modifier la texture de la peau. Respecter les imperfections naturelles.

Expression : bonne humeur subtile, calme et naturelle. Pas de sourire demonstratif. Micro-variation d'expression uniquement (regard, detente du visage). L'emotion est perceptible sans changement marque.

Posture : identique ou tres proche de la photo source. Aucune pose ajoutee. Aucun geste artificiel.

Variations autorisees uniquement sur : l'arriere-plan (exterieur urbain discret ou neutre), l'angle camera tres leger, la lumiere naturelle douce, le cadrage (leger recadrage uniquement).

Scene 1 : arriere-plan urbain floute discret.
Scene 2 : arriere-plan exterieur neutre, lumiere naturelle.
Scene 3 : arriere-plan sombre ou gris doux, rendu portrait.
Scene 4 : arriere-plan clair minimal, lumiere homogene.

Tenue : strictement identique a la photo source.

Camera : rendu appareil photo professionnel plein format.
Objectif equivalent a celui de la photo d'origine ou proche (35 mm a 50 mm).
Ouverture realiste, profondeur de champ naturelle. Aucun flou artificiel. Aucun effet cinematique. Balance des blancs realiste.

Style global : photographie strictement realiste, fidele a la photo d'origine, sans effet IA visible.`
  },

  6: {
    id: 6,
    name: 'Rue calme / Quartier résidentiel',
    category: 'Environnement',
    color: '#92400e',
    description: 'Environnement calme, élégant. Pour consultants, fondateurs, profils seniors.',
    prompt: `A partir de la photo fournie, cree une serie de 4 photos professionnelles coherentes du meme individu dans un quartier calme, residentiel ou semi-urbain.

${TECH_BASE}

Expression : bonne humeur calme et maitrisee. Pas de sourire demonstratif. Micro-sourire possible, regard detendu. La positivite est perceptible sans etre jouee. Le sujet semble serein, a l'aise dans l'environnement.

Posture : naturelle, relachee mais assuree. Aucune pose figee ou stereotypee. Le sujet ne pose pas, il est simplement present dans la scene.

Scene 1 : marche lente dans une rue residentielle calme, maisons ou immeubles discrets en arriere-plan.
Scene 2 : debout pres d'une facade claire (pierre, enduit, brique), posture ouverte.
Scene 3 : appuye legerement contre un mur ou une rambarde, regard hors camera, attitude sereine.
Scene 4 : portrait mi-buste face camera, arriere-plan residentiel floute, ambiance paisible.

Tenue : libre, coherente avec un contexte lifestyle professionnel decontracte. Aucune tenue formelle.

${CAMERA_WIDE}
Lumiere : lumiere naturelle douce, ombre legere ou ciel couvert. Pas de lumiere dramatique. Contraste modere, transitions douces. Balance des blancs realiste, couleurs sobres.

Style global : photographie lifestyle professionnelle, calme, elegante, humaine, credible, sans effet IA visible.`
  },

  7: {
    id: 7,
    name: 'Architecture moderne',
    category: 'Environnement',
    color: '#6b7280',
    description: 'Environnement architectural contemporain. Pour CTO, CEO B2B.',
    prompt: `A partir de la photo fournie, cree une serie de 4 photos professionnelles coherentes du meme individu dans un environnement architectural moderne.

${TECH_BASE}

Expression : calme confiant, bonne humeur subtile. Pas de sourire large. Micro-sourire possible, regard detendu. Le sujet semble a l'aise dans l'espace, jamais en representation.

Posture : naturelle, stable, assuree. Epaules relachees, posture droite mais non rigide. Aucune pose "corporate" ou LinkedIn stereotypee.

Scene 1 : debout devant une facade moderne en verre ou beton, lignes architecturales nettes mais non dominantes.
Scene 2 : marche lente le long d'un batiment contemporain, regard legerement hors camera.
Scene 3 : portrait trois-quarts, arriere-plan graphique floute, lignes verticales ou horizontales discretes.
Scene 4 : plan mi-buste face camera, decor architectural minimal, profondeur de champ naturelle.

Tenue : libre, contemporaine, coherente avec un contexte professionnel decontracte. Les vetements doivent dialoguer avec l'architecture sans la dominer.

${CAMERA_WIDE}
Lumiere : lumiere naturelle diffuse, ciel couvert ou ombre douce. Contraste modere, transitions douces. Balance des blancs realiste, couleurs sobres.

Style global : photographie lifestyle professionnelle contemporaine, structuree mais humaine, credible, sans effet IA visible.`
  },

  8: {
    id: 8,
    name: 'Fin de journée / Golden hour',
    category: 'Environnement',
    color: '#f97316',
    description: 'Lumière dorée, extérieur calme. Posts LinkedIn à forte portée.',
    prompt: `A partir de la photo fournie, cree une serie de 4 photos professionnelles coherentes du meme individu, prises en lumiere naturelle de fin de journee.

${TECH_BASE}

Expression : bonne humeur subtile, serenite calme. Pas de sourire large ou demonstratif. Micro-sourire possible, regard detendu. La chaleur emotionnelle est perceptible sans etre jouee.

Posture : naturelle, fluide, non figee. Aucune pose stereotypee. Le sujet ne pose pas, il est simplement present dans la lumiere.

Scene 1 : marche lente en exterieur, lumiere doree laterale, arriere-plan urbain ou naturel discret.
Scene 2 : portrait trois-quarts, regard hors camera, lumiere de fin de journee enveloppante.
Scene 3 : plan mi-buste face camera, lumiere douce rasante, decor floute.
Scene 4 : portrait serre, arriere-plan tres doux, lumiere chaude naturelle.

Tenue : libre, coherente avec un contexte lifestyle professionnel decontracte. Aucune tenue formelle.

${CAMERA_PORTRAIT}
Lumiere : lumiere naturelle de fin de journee (golden hour), douce et diffuse. Pas d'effet "cinematic" exagere. Contraste modere, transitions progressives. Balance des blancs realiste, tons chauds maitrises (pas oranges).

Style global : photographie lifestyle professionnelle, chaleureuse mais sobre, humaine, credible, sans effet IA visible.`
  },

  9: {
    id: 9,
    name: 'Fond brut et matières',
    category: 'Environnement',
    color: '#92400e',
    description: 'Pierre, béton, bois. Idéal pour page "A propos", profils conseil.',
    prompt: `A partir de la photo fournie, cree une serie de 4 photos professionnelles coherentes du meme individu devant des fonds textures naturels.

${TECH_BASE}

Expression : calme positif, presence naturelle. Pas de sourire large. Micro-sourire possible, regard pose. La bonne humeur est perceptible dans le regard et la posture, pas dans une mimique.

Posture : stable, naturelle, assuree. Aucune pose figee ou stereotypee. Le sujet semble simplement present dans l'espace.

Scene 1 : debout devant un mur en pierre claire, texture visible mais non dominante.
Scene 2 : appuye legerement contre un mur en beton brut, lignes simples.
Scene 3 : portrait trois-quarts devant un fond en bois ou materiau naturel.
Scene 4 : portrait serre, texture floutee en arriere-plan, separation douce du sujet.

Tenue : libre, sobre, coherente avec un contexte lifestyle professionnel decontracte. Aucune tenue formelle.

${CAMERA_PORTRAIT}
Lumiere : lumiere naturelle diffuse, ombre douce ou ciel couvert. Contraste modere, transitions naturelles. Balance des blancs realiste, couleurs neutres.

Style global : photographie lifestyle professionnelle, authentique, brute mais elegante, humaine, sans effet IA visible.`
  },

  10: {
    id: 10,
    name: 'Mouvement naturel / Marche',
    category: 'Dynamique',
    color: '#22c55e',
    description: 'Dynamique maîtrisée. Posts incarnés, bannières, profils opérationnels.',
    prompt: `A partir de la photo fournie, cree une serie de 4 photos professionnelles coherentes du meme individu, capturees en mouvement naturel.

${TECH_BASE}

Expression : bonne humeur subtile, concentration detendue. Pas de sourire demonstratif. Micro-sourire possible, regard vivant. L'energie est perceptible sans theatralisation.

Posture : fluide, naturelle, non figee. Le sujet est en deplacement reel, pas en pose simulee. Bras et epaules detendus.

Scene 1 : marche lente dans une rue urbaine calme, regard legerement hors camera.
Scene 2 : pas arrete brievement (transition de mouvement), posture ouverte.
Scene 3 : marche de profil leger, arriere-plan urbain floute, sensation de continuite.
Scene 4 : arret naturel en fin de deplacement, plan mi-buste, regard calme.

Tenue : libre, coherente avec un contexte lifestyle professionnel decontracte. Aucune tenue formelle.

${CAMERA_WIDE}
Vitesse d'obturation suffisante pour un sujet net (pas de flou de bouge).
Lumiere : lumiere naturelle, homogene. Contraste modere, couleurs sobres. Balance des blancs realiste.

Style global : photographie lifestyle professionnelle, dynamique mais maitrisee, humaine, credible, sans effet IA visible.`
  },

  11: {
    id: 11,
    name: 'Minimal clair',
    category: 'Dynamique',
    color: '#6b7280',
    description: 'Fond clair, lisibilité maximale. Passe-partout LinkedIn, site, presse.',
    prompt: `A partir de la photo fournie, cree une serie de 4 portraits professionnels coherents du meme individu, dans un environnement tres simple et lumineux.

${TECH_BASE}

${EXPRESSION_CALM}

Posture : naturelle, stable, assuree. Aucune pose stereotypee ou figee. Le sujet ne pose pas, il est simplement present.

Scene 1 : fond clair neutre (blanc casse ou gris tres clair), lumiere homogene.
Scene 2 : fond clair legerement texture, ambiance douce.
Scene 3 : exterieur tres discret, arriere-plan clair floute.
Scene 4 : portrait serre, fond clair uniforme.

Tenue : libre, sobre, coherente avec un contexte lifestyle professionnel decontracte. Aucune tenue formelle.

${CAMERA_PORTRAIT}
Lumiere : lumiere diffuse et uniforme (type fenetre ou softbox). Pas de contraste dur. Couleurs neutres, balance des blancs realiste.

Style global : portrait professionnel minimaliste, intemporel, credible, sans effet IA visible.`
  },

  12: {
    id: 12,
    name: 'Corporate fond couleur',
    category: 'Corporate',
    color: '#1e3a5f',
    description: 'Portrait corporate fond couleur maîtrisé. Dirigeants, finance/legal.',
    prompt: `A partir de la photo fournie, genere un portrait professionnel destine a un usage corporate.

Le visage, les proportions et les traits doivent rester strictement identiques a la photo source. Aucune modification morphologique. Aucune idealisation excessive.

Preserver strictement le grain, la texture et le niveau de bruit de la photo d'entree. Ne pas lisser la peau. Ne pas ajouter de nettete artificielle. Conserver un rendu photographique realiste et naturel.

Expression : bonne humeur maitrisee et professionnelle. Micro-sourire leger possible, regard confiant. Pas de sourire demonstratif.

Posture en trois-quarts (3/4), attitude calme et assuree.

Tenue : chemise bleu ciel avec un pull fin bleu marine a col rond. Style professionnel, sobre et corporate. Couleurs coherentes et non agressives.

Fond : couleur unie bleu marine (#13083A). Fond propre, uniforme, sans texture visible.

Eclairage : Un eclairage principal doux eclaire la partie droite du visage (gauche sur la photo). Source lumineuse de couleur #D1ABFF. Contraste maitrise, transitions douces, aucun effet dramatique.

Camera : rendu appareil photo professionnel plein format.
Objectif equivalent 85 mm. Ouverture realiste (f/2 a f/2.8). Perspective naturelle. Resolution elevee (qualite equivalente 4K).

Style global : portrait corporate professionnel, propre, credible, sans effet IA visible.`
  },
};

/**
 * Retourne les prompts recommandés pour un objectif donné
 */
export function getPromptsForObjective(objectiveId) {
  const objective = OBJECTIVES.find(o => o.id === objectiveId);
  if (!objective) return [];
  return objective.prompts.map(id => PROMPTS[id]);
}

/**
 * Enrichit un prompt avec la description morphologique du sujet
 */
export function enrichPrompt(promptText, subjectDescription) {
  if (!subjectDescription) return promptText;
  return `${promptText}\n\nDescription morphologique du sujet (reference) :\n${subjectDescription}`;
}
