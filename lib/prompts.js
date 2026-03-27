// ============================================================
// Photoshoot AI - BibliothÃ¨que des 13 prompts
// Format Imagen 3 Subject Customization : [1] = sujet de rÃ©fÃ©rence
// Chaque prompt gÃ©nÃ¨re des images individuelles prÃ©servant l'identitÃ©
// ============================================================

export const OBJECTIVES = [
  {
    id: 'linkedin-profile',
    label: 'Photo de profil LinkedIn',
    description: 'Confiance, crÃ©dibilitÃ©, intemporalitÃ©',
    color: '#6c40f3',
    prompts: [4, 11, 2],
  },
  {
    id: 'linkedin-posts',
    label: 'Posts LinkedIn incarnÃ©s',
    description: 'Naturel, proximitÃ©, crÃ©dibilitÃ© humaine',
    color: '#4f9aea',
    prompts: [3, 10, 8],
  },
  {
    id: 'about-page',
    label: 'Page "A propos" / Site web',
    description: 'CohÃ©rence, lisibilitÃ©, sÃ©rieux',
    color: '#feb06a',
    prompts: [9, 2, 11],
  },
  {
    id: 'senior-profile',
    label: 'Client exigeant / Profil senior',
    description: 'FidÃ©litÃ©, zÃ©ro artefact IA',
    color: '#ef4444',
    prompts: [5, 11, 4],
  },
  {
    id: 'corporate',
    label: 'Photo corporate fond couleur',
    description: 'Institutionnel, fond maÃ®trisÃ©',
    color: '#1e3a5f',
    prompts: [12, 5, 11],
  },
  {
    id: 'full-shooting',
    label: 'Shooting complet',
    description: 'Toutes les variantes (10 photos)',
    color: '#6c40f3',
    prompts: [1, 2, 3, 4, 5],
  },
];

// Base technique commune
const TECH_BASE = `The face, proportions and features must remain strictly identical to person [1] from the reference photo. No morphological modification. No idealization or artificial enhancement.

Strictly preserve the grain, texture and noise level of a full-frame camera sensor. Do not smooth the skin. Do not add artificial sharpness. Maintain a natural, slightly grainy photographic rendering.`;

const EXPRESSION_CALM = `Expression: calm positive mood, subtle good humor. No demonstrative smile. Micro-smile possible, composed gaze, relaxed. The emotion is readable without being performed.`;

const EXPRESSION_WARM = `Expression: subtle and natural good humor. No forced or demonstrative smile. Micro-smile possible, relaxed gaze, relaxed jaw. The emotion is perceptible without being performed. The subject appears comfortable, confident, serene.`;

const CAMERA_PORTRAIT = `Camera: professional full-frame camera rendering.
Recommended lenses: 50mm for natural portraits, 85mm for close-ups.
Realistic aperture (f/2 to f/2.8), natural depth of field.
No artificial blur. Realistic perspectives.`;

const CAMERA_WIDE = `Camera: professional full-frame camera rendering.
Recommended lenses: 35mm for environmental and movement scenes, 50mm for natural portraits, 85mm for close-ups.
Realistic aperture (f/1.8 to f/2.8), natural depth of field.`;

export const PROMPTS = {
  0: {
    id: 0,
    name: 'Analyse morphologique',
    category: 'Fondation',
    color: '#eab308',
    description: 'Analyse factuelle du visage - non utilisÃ© pour la gÃ©nÃ©ration Imagen 3.',
    prompt: `Morphological analysis prompt - not used with Imagen 3 Subject Customization.`
  },

  1: {
    id: 1,
    name: 'Lifestyle urbain',
    category: 'Lifestyle',
    color: '#4f9aea',
    description: 'SÃ©rie principale - clichÃ©s urbains naturels. Base du shooting.',
    prompt: `Professional lifestyle photograph of person [1] in a modern urban environment.

${TECH_BASE}

${EXPRESSION_WARM}

Posture: natural, relaxed but confident. No stiff or clichÃ© LinkedIn poses. The subject is simply present in the scene, not posing.

Setting: urban street or cafÃ© terrace, modern architecture in background. Relaxed professional context.

Clothing: casual professional, no formal suit or tie. Natural and coherent with a relaxed professional lifestyle.

${CAMERA_WIDE}
Lighting: natural light, soft, non-dramatic, moderate contrast. Realistic white balance, sober colors.

Overall style: professional lifestyle photography, credible, not staged, no visible AI artifacts. Single person only.`
  },

  2: {
    id: 2,
    name: 'Portrait lifestyle premium',
    category: 'Lifestyle',
    color: '#4f9aea',
    description: 'Portrait extÃ©rieur calme, rendu haut de gamme. IdÃ©al pour photo de profil.',
    prompt: `Premium lifestyle portrait of person [1] in a calm outdoor setting.

${TECH_BASE}

${EXPRESSION_CALM}

Posture: natural, stable, confident. The subject seems comfortable, not performing. No stereotypical LinkedIn poses.

Setting: outdoor portrait with very subtle urban or natural background, soft bokeh. Clean, editorial feel.

Clothing: casual professional, sober, no formal attire.

${CAMERA_PORTRAIT}
Lighting: natural or diffused, soft lateral light, moderate contrast. Neutral colors, realistic white balance.

Overall style: professional premium lifestyle portrait, credible, high-end, not staged, no visible AI artifacts. Single person only.`
  },

  3: {
    id: 3,
    name: 'CafÃ© et quotidien urbain',
    category: 'Lifestyle',
    color: '#22c55e',
    description: 'Lifestyle naturel, non posÃ©. IdÃ©al pour posts LinkedIn humanisÃ©s.',
    prompt: `Natural lifestyle photograph of person [1] in a cafÃ© or urban daily life context.

${TECH_BASE}

Expression: subtle good humor, natural ease. No forced or demonstrative smile. Micro-smile possible, calm gaze, relaxed attitude. The emotion is visible in the eyes and posture, not in an exaggerated facial expression.

Posture: natural, fluid, never stiff. The subject seems to simply live the scene, not pose for a photo. No clichÃ© LinkedIn postures.

Setting: seated at a cafÃ© terrace, or standing near a counter or coffee bar. Lively but blurred background. Warm ambient atmosphere.

Clothing: casual professional, no formal attire.

${CAMERA_WIDE}
Credible optical background blur, never artificial.
Lighting: natural or soft ambient light, moderate contrast. Sober colors, realistic white balance.

Overall style: professional lifestyle photography, human, credible, not staged, no visible AI artifacts. Single person only.`
  },

  4: {
    id: 4,
    name: 'Portrait premium fond sombre',
    category: 'Studio',
    color: '#6c40f3',
    description: 'Photo signature, fond noir/gris. Photo de profil LinkedIn premium.',
    prompt: `Premium studio portrait of person [1] against a dark background.

${TECH_BASE}

Expression: calm positive mood, quiet confidence. No wide smile. Micro-smile possible or warm neutral expression. Lively gaze, composed, never frozen. Perceptible good humor without demonstration.

Posture: stable, natural, confident. The subject is not "posing", just present. No stereotypical corporate portrait poses.

Setting: deep black or dark grey textured background. Soft, diffused studio lighting. Editorial atmosphere.

Clothing: casual professional, sober, no formal suit or tie.

${CAMERA_PORTRAIT}
Lighting: soft studio type (softbox or window light), natural transitions, controlled contrast. Sober colors, realistic white balance.

Overall style: high-end professional photographer portrait, natural, credible, no visible AI artifacts. Single person only.`
  },

  5: {
    id: 5,
    name: 'Ultra-safe minimal',
    category: 'Studio',
    color: '#ef4444',
    description: 'SÃ©curitÃ© maximale, zÃ©ro artefact IA. Pour clients exigeants.',
    prompt: `Ultra-realistic photographic variation of person [1] with maximum fidelity to the reference.

The face, proportions, features, age and base expression must remain strictly identical to person [1]. No morphological modification. No idealization. No excessive stylistic interpretation.

Strictly preserve the grain, texture and noise level of the input photo. Do not smooth the skin. Do not enhance sharpness. Do not modify skin texture. Respect natural imperfections.

Expression: subtle good humor, calm and natural. No demonstrative smile. Micro-variation of expression only (gaze, face relaxation). The emotion is perceptible without marked change.

Posture: identical or very close to the reference photo. No added poses. No artificial gestures.

Variations allowed only on: background (subtle urban exterior or neutral), very slight camera angle, soft natural light, framing (slight reframing only).

Clothing: strictly identical to the reference photo.

Camera: professional full-frame camera rendering.
Equivalent lens to the original photo or close (35mm to 50mm).
Realistic aperture, natural depth of field. No artificial blur. No cinematic effect. Realistic white balance.

Overall style: strictly realistic photography, faithful to the original, no visible AI artifacts. Single person only.`
  },

  6: {
    id: 6,
    name: 'Rue calme / Quartier rÃ©sidentiel',
    category: 'Environnement',
    color: '#92400e',
    description: 'Environnement calme, Ã©lÃ©gant. Pour consultants, fondateurs, profils seniors.',
    prompt: `Professional photograph of person [1] in a calm residential or semi-urban neighborhood.

${TECH_BASE}

Expression: calm and controlled good humor. No demonstrative smile. Micro-smile possible, relaxed gaze. The positivity is perceptible without being performed. The subject seems serene, at ease in the environment.

Posture: natural, relaxed but confident. No stiff or stereotypical poses. The subject is simply present in the scene.

Setting: quiet residential street, houses or discreet buildings in background. Clean facades, stone or light-colored walls. Peaceful atmosphere.

Clothing: casual professional, no formal attire.

${CAMERA_WIDE}
Lighting: soft natural light, light shadow or overcast sky. No dramatic lighting. Moderate contrast, soft transitions. Realistic white balance, sober colors.

Overall style: professional lifestyle photography, calm, elegant, human, credible, no visible AI artifacts. Single person only.`
  },

  7: {
    id: 7,
    name: 'Architecture moderne',
    category: 'Environnement',
    color: '#6b7280',
    description: 'Environnement architectural contemporain. Pour CTO, CEO B2B.',
    prompt: `Professional photograph of person [1] in a modern architectural environment.

${TECH_BASE}

Expression: calm confidence, subtle good humor. No wide smile. Micro-smile possible, relaxed gaze. The subject seems at ease in the space, never performing.

Posture: natural, stable, confident. Relaxed shoulders, straight but not rigid posture. No "corporate" or stereotypical LinkedIn pose.

Setting: modern glass or concrete facade, clean architectural lines but not dominant. Contemporary building, urban design elements.

Clothing: casual professional, contemporary, coherent with the architectural context.

${CAMERA_WIDE}
Lighting: diffuse natural light, overcast sky or soft shadow. Moderate contrast, soft transitions. Realistic white balance, sober colors.

Overall style: contemporary professional lifestyle photography, structured but human, credible, no visible AI artifacts. Single person only.`
  },

  8: {
    id: 8,
    name: 'Fin de journÃ©e / Golden hour',
    category: 'Environnement',
    color: '#f97316',
    description: 'LumiÃ¨re dorÃ©e, extÃ©rieur calme. Posts LinkedIn Ã  forte portÃ©e.',
    prompt: `Professional photograph of person [1] in natural late afternoon golden hour light.

${TECH_BASE}

Expression: subtle good humor, calm serenity. No wide or demonstrative smile. Micro-smile possible, relaxed gaze. Emotional warmth is perceptible without being performed.

Posture: natural, fluid, not stiff. No stereotypical poses. The subject is simply present in the light.

Setting: outdoor, golden lateral light, subtle urban or natural background. Warm, enveloping late afternoon atmosphere.

Clothing: casual professional, no formal attire.

${CAMERA_PORTRAIT}
Lighting: natural late afternoon light (golden hour), soft and diffuse. No exaggerated "cinematic" effect. Moderate contrast, progressive transitions. Realistic white balance, controlled warm tones (not orange).

Overall style: professional lifestyle photography, warm but sober, human, credible, no visible AI artifacts. Single person only.`
  },

  9: {
    id: 9,
    name: 'Fond brut et matiÃ¨res',
    category: 'Environnement',
    color: '#92400e',
    description: 'Pierre, bÃ©ton, bois. IdÃ©al pour page "A propos", profils conseil.',
    prompt: `Professional photograph of person [1] in front of natural textured backgrounds.

${TECH_BASE}

Expression: calm positive mood, natural presence. No wide smile. Micro-smile possible, composed gaze. Good humor is perceptible in the eyes and posture, not in an exaggerated facial expression.

Posture: stable, natural, confident. No stiff or stereotypical poses. The subject seems simply present in the space.

Setting: textured wall background - light stone, raw concrete, or natural wood. Visible texture but not dominant. Simple, clean lines.

Clothing: casual professional, sober, no formal attire.

${CAMERA_PORTRAIT}
Lighting: diffuse natural light, soft shadow or overcast sky. Moderate contrast, natural transitions. Realistic white balance, neutral colors.

Overall style: professional lifestyle photography, authentic, raw but elegant, human, no visible AI artifacts. Single person only.`
  },

  10: {
    id: 10,
    name: 'Mouvement naturel / Marche',
    category: 'Dynamique',
    color: '#22c55e',
    description: 'Dynamique maÃ®trisÃ©e. Posts incarnÃ©s, banniÃ¨res, profils opÃ©rationnels.',
    prompt: `Professional photograph of person [1] captured in natural walking movement.

${TECH_BASE}

Expression: subtle good humor, relaxed concentration. No demonstrative smile. Micro-smile possible, lively gaze. Energy is perceptible without theatrics.

Posture: fluid, natural, not stiff. The subject is in real motion, not a simulated pose. Relaxed arms and shoulders.

Setting: calm urban street, blurred background, sense of continuity and movement. Mid-stride or brief stop transition.

Clothing: casual professional, no formal attire.

${CAMERA_WIDE}
Sufficient shutter speed for a sharp subject (no motion blur).
Lighting: natural light, homogeneous. Moderate contrast, sober colors. Realistic white balance.

Overall style: professional lifestyle photography, dynamic but controlled, human, credible, no visible AI artifacts. Single person only.`
  },

  11: {
    id: 11,
    name: 'Minimal clair',
    category: 'Dynamique',
    color: '#6b7280',
    description: 'Fond clair, lisibilitÃ© maximale. Passe-partout LinkedIn, site, presse.',
    prompt: `Clean minimal portrait of person [1] in a bright, simple environment.

${TECH_BASE}

${EXPRESSION_CALM}

Posture: natural, stable, confident. No stereotypical or stiff poses. The subject is simply present.

Setting: light neutral background (off-white or very light grey), homogeneous lighting. Clean, bright, minimal atmosphere.

Clothing: casual professional, sober, no formal attire.

${CAMERA_PORTRAIT}
Lighting: diffuse and uniform (window or softbox type). No hard contrast. Neutral colors, realistic white balance.

Overall style: minimalist professional portrait, timeless, credible, no visible AI artifacts. Single person only.`
  },

  12: {
    id: 12,
    name: 'Corporate fond couleur',
    category: 'Corporate',
    color: '#1e3a5f',
    description: 'Portrait corporate fond couleur maÃ®trisÃ©. Dirigeants, finance/legal.',
    prompt: `Professional corporate portrait of person [1] for business use.

The face, proportions and features must remain strictly identical to person [1]. No morphological modification. No excessive idealization.

Strictly preserve the grain, texture and noise level of the input photo. Do not smooth the skin. Do not add artificial sharpness. Maintain a realistic and natural photographic rendering.

Expression: controlled and professional good humor. Slight micro-smile possible, confident gaze. No demonstrative smile.

Three-quarter (3/4) posture, calm and confident attitude.

Clothing: light blue shirt with a thin navy blue crew neck sweater. Professional, sober and corporate style. Coherent and non-aggressive colors.

Background: solid navy blue color (#13083A). Clean, uniform background, no visible texture.

Lighting: A soft main light illuminates the right side of the face (left on the photo). Light source color #D1ABFF. Controlled contrast, soft transitions, no dramatic effect.

Camera: professional full-frame camera rendering.
Equivalent 85mm lens. Realistic aperture (f/2 to f/2.8). Natural perspective. High resolution (4K equivalent quality).

Overall style: professional corporate portrait, clean, credible, no visible AI artifacts. Single person only.`
  },
};

/**
 * Retourne les prompts recommandÃ©s pour un objectif donnÃ©
 */
export function getPromptsForObjective(objectiveId) {
  const objective = OBJECTIVES.find(o => o.id === objectiveId);
  if (!objective) return [];
  return objective.prompts.map(id => PROMPTS[id]);
}
