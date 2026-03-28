// ============================================================
// Photoshoot AI - 13 Prompt Library
// Each prompt preserves face identity and natural skin grain
// All prompts in English for optimal Gemini image generation
//
// NOTE: Global identity rules (face, hands, skin, body type)
// are in vertex-ai.js systemInstruction. TECH_BASE here is a
// lightweight per-prompt reminder — NOT the full ruleset.
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
    description: 'Toutes les variantes',
    color: '#6c40f3',
    prompts: [1, 2, 3, 4, 5],
  },
];

// ============================================================
// TECH_BASE — Lightweight per-prompt identity reminder
// Full rules are in systemInstruction (vertex-ai.js).
// This adds prompt-level anchoring without duplicating tokens.
// ============================================================
const TECH_BASE = `Use the attached photo(s) as the SOLE identity reference. The face and all recognizable characteristics must remain strictly identical. No morphological modification. No idealization. Preserve the person's actual body type and proportions.

Strictly preserve the grain, texture, and noise level of the input photo. Maintain a natural photographic rendering, slightly grainy, consistent with a full-frame sensor.`;

const EXPRESSION_CALM = `Expression: calm positivity, quiet confidence. No demonstrative smile. Subtle micro-smile possible, steady gaze, relaxed. The emotion is readable without being performed.`;

const EXPRESSION_WARM = `Expression: subtle and natural warmth. No forced or demonstrative smile. Subtle micro-smile possible, relaxed gaze, relaxed jaw. The emotion is perceptible without being performed. The subject appears comfortable, confident, serene.`;

const CAMERA_PORTRAIT = `Camera: professional full-frame camera rendering.
Recommended lenses: 50mm for natural portraits, 85mm for tight shots.
Realistic aperture (f/2 to f/2.8), natural depth of field.
No artificial blur. Realistic perspectives.`;

const CAMERA_WIDE = `Camera: professional full-frame camera rendering.
Recommended lenses: 35mm for movement and environmental scenes, 50mm for natural portraits, 85mm for tight shots.
Realistic aperture (f/1.8 to f/2.8), natural depth of field.`;

export const PROMPTS = {
  0: {
    id: 0,
    name: 'Analyse morphologique',
    category: 'Fondation',
    color: '#eab308',
    description: 'Analyse factuelle du visage en 12 sections.',
    prompt: `Analyze this photo in a strictly factual and descriptive manner. Describe only the visible person, never the background, setting, clothing, or lighting.

No psychological or social interpretation. No embellishment. No idealization. Do not correct asymmetries, imperfections, or particularities. Do not invent anything: everything must be strictly observable.

Structure the analysis in 12 sections:
1. General morphology (body type, build, overall proportions)
2. Face shape (oval, square, round, elongated, triangular, etc.)
3. Skin (complexion, texture, visible imperfections, wrinkles, spots)
4. Eyes (shape, size, color, spacing, eyelids)
5. Eyebrows (thickness, shape, color, symmetry)
6. Nose (size, shape, width, profile)
7. Mouth and lips (size, shape, thickness, symmetry)
8. Ears (visibility, relative size, shape)
9. Hair (color, texture, length, hairstyle, density, hairline)
10. Facial hair (beard, mustache, sideburns - current state)
11. Neutral expression (natural position of features at rest)
12. Distinctive signs (scars, moles, notable asymmetries)`
  },

  1: {
    id: 1,
    name: 'Lifestyle urbain',
    category: 'Lifestyle',
    color: '#4f9aea',
    description: 'Série principale - 4 clichés urbains naturels.',
    prompt: `Using the attached photo as identity reference, create a series of 4 consistent professional photos of this exact same individual.

${TECH_BASE}

${EXPRESSION_WARM}

Posture: natural, relaxed but confident. No stiff poses or LinkedIn photo clichés. The subject is not posing, they are simply present in the scene.

Scene 1: casual walk in a modern urban street, gaze slightly off-camera.
Scene 2: standing near a café terrace, open posture, relaxed attitude.
Scene 3: leaning against a light-colored stone or concrete wall, calm and thoughtful expression.
Scene 4: mid-bust shot facing camera, subtle urban backdrop, slightly blurred background.

Outfit: casual professional lifestyle attire. No formal suit or tie.

${CAMERA_WIDE}
Lighting: natural, soft, non-dramatic light, moderate contrast. Realistic white balance, muted colors.

Overall style: professional lifestyle photography, believable, unstaged, no visible AI artifacts.`
  },

  2: {
    id: 2,
    name: 'Portrait lifestyle premium',
    category: 'Lifestyle',
    color: '#4f9aea',
    description: 'Portrait extérieur calme, rendu haut de gamme.',
    prompt: `Using the attached photo as identity reference, create a series of 4 professional photos of this exact same individual, with a premium lifestyle portrait approach.

${TECH_BASE}

${EXPRESSION_CALM}

Posture: natural, stable, confident. The subject appears comfortable in the situation, not performing. No stereotypical LinkedIn pose.

Scene 1: standing portrait outdoors, very subtle urban or natural backdrop, gaze off-camera.
Scene 2: chest-level shot facing camera, blurred environment, soft light.
Scene 3: three-quarter portrait, gaze slightly averted, editorial feel.
Scene 4: tight portrait, neutral background, calm and confident expression.

Outfit: casual, understated, consistent with a relaxed professional context. No formal attire.

${CAMERA_PORTRAIT}
Lighting: natural or diffused, soft lateral light, moderate contrast. Neutral colors, realistic white balance.

Overall style: professional lifestyle portrait, believable, high-end, unstaged, no visible AI artifacts.`
  },

  3: {
    id: 3,
    name: 'Café et quotidien urbain',
    category: 'Lifestyle',
    color: '#22c55e',
    description: 'Lifestyle naturel, non posé. Posts LinkedIn humanisés.',
    prompt: `Using the attached photo as identity reference, create a series of 4 professional photos of this exact same individual in a café or urban daily life context.

${TECH_BASE}

Expression: quiet warmth, natural ease. No forced or demonstrative smile. Subtle micro-smile possible, calm gaze, relaxed attitude. The emotion is visible in the eyes and posture, not in an exaggerated facial expression.

Posture: natural, fluid, never stiff. The subject appears to simply be living the scene, not posing for a photo. No LinkedIn photo cliché poses.

Scene 1: seated at a café terrace, gaze slightly off-camera, lively but blurred ambiance.
Scene 2: standing near a table or counter, open posture, relaxed attitude.
Scene 3: slow walk in a street adjacent to the café, calm gaze, natural movement.
Scene 4: mid-body portrait, blurred café environment, soft lateral light.

Outfit: casual professional lifestyle attire. No formal clothing.

${CAMERA_WIDE}
Believable optical background blur, never artificial.
Lighting: natural or soft ambient light, moderate contrast. Muted colors, realistic white balance.

Overall style: professional lifestyle photography, human, believable, unstaged, no visible AI artifacts.`
  },

  4: {
    id: 4,
    name: 'Portrait premium fond sombre',
    category: 'Studio',
    color: '#6c40f3',
    description: 'Photo signature, fond noir/gris. Photo de profil premium.',
    prompt: `Using the attached photo as identity reference, create a series of 4 professional portraits of this exact same individual, with a high-end photographer portrait approach.

${TECH_BASE}

Expression: calm positivity, quiet confidence. No wide smile. Subtle micro-smile possible or warm neutral expression. Lively gaze, steady, never frozen. Quiet warmth perceptible without demonstration.

Posture: stable, natural, confident. The subject is not "posing," they are simply present. No stereotypical corporate portrait postures.

Scene 1: portrait facing camera, deep black background, soft diffused lighting.
Scene 2: three-quarter portrait, dark textured gray background, soft lateral light.
Scene 3: slight profile portrait, dark neutral background, editorial feel.
Scene 4: tight portrait, dark background, moderate contrast, calm gaze.

Outfit: casual, understated, consistent with a relaxed professional context. No formal suit or tie.

${CAMERA_PORTRAIT}
Lighting: soft studio type (softbox or window), natural transitions, controlled contrast. Muted colors, realistic white balance.

Overall style: high-end professional photographer portrait, natural, believable, no visible AI artifacts.`
  },

  5: {
    id: 5,
    name: 'Ultra-safe minimal',
    category: 'Studio',
    color: '#ef4444',
    description: 'Sécurité maximale, zéro artefact IA. Clients exigeants.',
    prompt: `Using the attached photo as identity reference, create a series of 4 very close photographic variations of this exact same individual.

${TECH_BASE}

Do not smooth the skin. Do not enhance sharpness. Do not modify skin texture. Respect natural imperfections.

Expression: subtle warmth, calm and natural. No demonstrative smile. Only micro-variations in expression (gaze, facial relaxation). The emotion is perceptible without marked change.

Posture: identical or very close to the source photo. No added poses. No artificial gestures.

Allowed variations only on: background (subtle outdoor urban or neutral), very slight camera angle, soft natural light, framing (slight reframing only).

Scene 1: blurred subtle urban background.
Scene 2: neutral outdoor background, natural light.
Scene 3: dark or soft gray background, portrait rendering.
Scene 4: minimal light background, even lighting.

Outfit: strictly identical to the source photo.

Camera: professional full-frame camera rendering.
Lens equivalent to the original photo or close (35mm to 50mm).
Realistic aperture, natural depth of field. No artificial blur. No cinematic effects. Realistic white balance.

Overall style: strictly realistic photography, faithful to the original photo, no visible AI artifacts.`
  },

  6: {
    id: 6,
    name: 'Rue calme / Quartier résidentiel',
    category: 'Environnement',
    color: '#92400e',
    description: 'Environnement calme, élégant. Consultants, fondateurs.',
    prompt: `Using the attached photo as identity reference, create a series of 4 consistent professional photos of this exact same individual in a calm, residential or semi-urban neighborhood.

${TECH_BASE}

Expression: calm and controlled warmth. No demonstrative smile. Subtle micro-smile possible, relaxed gaze. Positivity is perceptible without being performed. The subject appears serene, at ease in the environment.

Posture: natural, relaxed but confident. No stiff or stereotypical poses. The subject is not posing, they are simply present in the scene.

Scene 1: slow walk in a calm residential street, houses or discreet buildings in the background.
Scene 2: standing near a light-colored facade (stone, plaster, brick), open posture.
Scene 3: leaning slightly against a wall or railing, gaze off-camera, serene attitude.
Scene 4: mid-bust portrait facing camera, blurred residential background, peaceful ambiance.

Outfit: casual professional lifestyle attire. No formal clothing.

${CAMERA_WIDE}
Lighting: soft natural light, gentle shadow or overcast sky. No dramatic lighting. Moderate contrast, smooth transitions. Realistic white balance, muted colors.

Overall style: professional lifestyle photography, calm, elegant, human, believable, no visible AI artifacts.`
  },

  7: {
    id: 7,
    name: 'Architecture moderne',
    category: 'Environnement',
    color: '#6b7280',
    description: 'Environnement architectural contemporain. CTO, CEO B2B.',
    prompt: `Using the attached photo as identity reference, create a series of 4 consistent professional photos of this exact same individual in a modern architectural environment.

${TECH_BASE}

Expression: calm confidence, subtle warmth. No wide smile. Subtle micro-smile possible, relaxed gaze. The subject appears at ease in the space, never performing.

Posture: natural, stable, confident. Relaxed shoulders, straight but not rigid posture. No "corporate" or stereotypical LinkedIn pose.

Scene 1: standing in front of a modern glass or concrete facade, clean architectural lines but not dominant.
Scene 2: slow walk along a contemporary building, gaze slightly off-camera.
Scene 3: three-quarter portrait, blurred graphic background, subtle vertical or horizontal lines.
Scene 4: mid-bust shot facing camera, minimal architectural backdrop, natural depth of field.

Outfit: contemporary, casual, consistent with a relaxed professional context. Clothing should complement the architecture without dominating it.

${CAMERA_WIDE}
Lighting: diffused natural light, overcast sky or soft shade. Moderate contrast, smooth transitions. Realistic white balance, muted colors.

Overall style: contemporary professional lifestyle photography, structured yet human, believable, no visible AI artifacts.`
  },

  8: {
    id: 8,
    name: 'Fin de journée / Golden hour',
    category: 'Environnement',
    color: '#f97316',
    description: 'Lumière dorée, extérieur calme. Posts LinkedIn impact.',
    prompt: `Using the attached photo as identity reference, create a series of 4 consistent professional photos of this exact same individual, shot in natural late afternoon light.

${TECH_BASE}

Expression: subtle warmth, calm serenity. No wide or demonstrative smile. Subtle micro-smile possible, relaxed gaze. The emotional warmth is perceptible without being performed.

Posture: natural, fluid, not stiff. No stereotypical poses. The subject is not posing, they are simply present in the light.

Scene 1: slow walk outdoors, golden lateral light, subtle urban or natural backdrop.
Scene 2: three-quarter portrait, gaze off-camera, enveloping late afternoon light.
Scene 3: mid-bust shot facing camera, soft grazing light, blurred backdrop.
Scene 4: tight portrait, very soft background, natural warm light.

Outfit: casual professional lifestyle attire. No formal clothing.

${CAMERA_PORTRAIT}
Lighting: natural late afternoon light (golden hour), soft and diffused. No exaggerated "cinematic" effects. Moderate contrast, gradual transitions. Realistic white balance, warm tones kept in check (not orange).

Overall style: professional lifestyle photography, warm yet understated, human, believable, no visible AI artifacts.`
  },

  9: {
    id: 9,
    name: 'Fond brut et matières',
    category: 'Environnement',
    color: '#92400e',
    description: 'Pierre, béton, bois. Page "A propos", profils conseil.',
    prompt: `Using the attached photo as identity reference, create a series of 4 consistent professional photos of this exact same individual in front of natural textured backgrounds.

${TECH_BASE}

Expression: calm positivity, natural presence. No wide smile. Subtle micro-smile possible, steady gaze. Warmth is perceptible in the eyes and posture, not in an exaggerated facial expression.

Posture: stable, natural, confident. No stiff or stereotypical poses. The subject appears simply present in the space.

Scene 1: standing in front of a light stone wall, visible texture but not dominant.
Scene 2: leaning slightly against a raw concrete wall, clean lines.
Scene 3: three-quarter portrait in front of a wood or natural material background.
Scene 4: tight portrait, blurred texture in background, soft subject separation.

Outfit: casual, understated, consistent with a relaxed professional context. No formal attire.

${CAMERA_PORTRAIT}
Lighting: diffused natural light, soft shadow or overcast sky. Moderate contrast, natural transitions. Realistic white balance, neutral colors.

Overall style: professional lifestyle photography, authentic, raw yet elegant, human, no visible AI artifacts.`
  },

  10: {
    id: 10,
    name: 'Mouvement naturel / Marche',
    category: 'Dynamique',
    color: '#22c55e',
    description: 'Dynamique maîtrisée. Posts incarnés, bannières.',
    prompt: `Using the attached photo as identity reference, create a series of 4 consistent professional photos of this exact same individual, captured in natural movement.

${TECH_BASE}

Expression: subtle warmth, relaxed focus. No demonstrative smile. Subtle micro-smile possible, lively gaze. The energy is perceptible without theatrics.

Posture: fluid, natural, not stiff. The subject is in real motion, not a simulated pose. Arms and shoulders relaxed.

Scene 1: slow walk in a calm urban street, gaze slightly off-camera.
Scene 2: brief stopped step (movement transition), open posture.
Scene 3: slight profile walk, blurred urban background, sense of continuity.
Scene 4: natural stop at end of movement, mid-bust shot, calm gaze.

Outfit: casual professional lifestyle attire. No formal clothing.

${CAMERA_WIDE}
Sufficient shutter speed for a sharp subject (no motion blur).
Lighting: natural, even light. Moderate contrast, muted colors. Realistic white balance.

Overall style: professional lifestyle photography, dynamic yet controlled, human, believable, no visible AI artifacts.`
  },

  11: {
    id: 11,
    name: 'Minimal clair',
    category: 'Dynamique',
    color: '#6b7280',
    description: 'Fond clair, lisibilité maximale. LinkedIn, site, presse.',
    prompt: `Using the attached photo as identity reference, create a series of 4 consistent professional portraits of this exact same individual, in a very simple and bright environment.

${TECH_BASE}

${EXPRESSION_CALM}

Posture: natural, stable, confident. No stereotypical or stiff poses. The subject is not posing, they are simply present.

Scene 1: neutral light background (off-white or very light gray), even lighting.
Scene 2: slightly textured light background, soft ambiance.
Scene 3: very subtle outdoor, blurred light backdrop.
Scene 4: tight portrait, uniform light background.

Outfit: casual, understated, consistent with a relaxed professional context. No formal attire.

${CAMERA_PORTRAIT}
Lighting: diffused and uniform light (window or softbox type). No harsh contrast. Neutral colors, realistic white balance.

Overall style: minimalist professional portrait, timeless, believable, no visible AI artifacts.`
  },

  12: {
    id: 12,
    name: 'Corporate fond couleur',
    category: 'Corporate',
    color: '#1e3a5f',
    description: 'Portrait corporate fond couleur maîtrisé. Dirigeants.',
    prompt: `Using the attached photo as identity reference, generate a professional portrait for corporate use of this exact same individual.

${TECH_BASE}

Expression: controlled and professional warmth. Slight micro-smile possible, confident gaze. No demonstrative smile.

Posture in three-quarter (3/4) angle, calm and confident attitude.

Outfit: light blue shirt with a thin navy blue crew-neck sweater. Professional, understated, and corporate style. Consistent and non-aggressive colors.

Background: solid navy blue (#13083A). Clean, uniform background, no visible texture.

Lighting: a soft key light illuminates the right side of the face (left in the photo). Light source color #D1ABFF. Controlled contrast, smooth transitions, no dramatic effects.

Camera: professional full-frame camera rendering.
85mm equivalent lens. Realistic aperture (f/2 to f/2.8). Natural perspective. High resolution (4K equivalent quality).

Overall style: professional corporate portrait, clean, believable, no visible AI artifacts.`
  },
};

/**
 * Returns enriched objectives with full prompt metadata
 * Single source of truth — used by both API config and frontend
 */
export function getEnrichedObjectives(sampleCount = 2) {
  return OBJECTIVES.map(obj => ({
    ...obj,
    prompts: obj.prompts.map(id => ({
      id,
      name: PROMPTS[id].name,
      color: PROMPTS[id].color,
      desc: PROMPTS[id].description,
    })),
    totalPhotos: obj.prompts.length * sampleCount,
  }));
}

/**
 * Returns recommended prompts for a given objective
 */
export function getPromptsForObjective(objectiveId) {
  const objective = OBJECTIVES.find(o => o.id === objectiveId);
  if (!objective) return [];
  return objective.prompts.map(id => PROMPTS[id]);
}

/**
 * Enriches a prompt with the subject's morphological description
 */
export function enrichPrompt(promptText, subjectDescription) {
  if (!subjectDescription) return promptText;
  return `${promptText}\n\nSubject morphological description (identity reference):\n${subjectDescription}`;
}
