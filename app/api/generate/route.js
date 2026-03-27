import { generateImages, ensureJpeg, getSubjectDescription } from '../../../lib/vertex-ai';
import { PROMPTS } from '../../../lib/prompts';
import { NextResponse } from 'next/server';

export const maxDuration = 120; // 2 min timeout pour la gÃ©nÃ©ration

export async function POST(request) {
  try {
    const { promptId, imageBase64, subjectDescription } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image requise' }, { status: 400 });
    }

    const prompt = PROMPTS[promptId];
    if (!prompt) {
      return NextResponse.json({ error: `Prompt ${promptId} introuvable` }, { status: 400 });
    }

    if (!process.env.GOOGLE_PROJECT_ID) {
      return NextResponse.json({ error: 'GOOGLE_PROJECT_ID non configurÃ©' }, { status: 500 });
    }

    // Convertir en JPEG (gÃ¨re HEIC, PNG, WebP, etc.)
    const jpegBase64 = await ensureJpeg(imageBase64);

    // Utiliser la description passÃ©e par le client ou en gÃ©nÃ©rer une Ã  la volÃ©e
    let description = subjectDescription;
    if (!description && process.env.OPENAI_API_KEY) {
      description = await getSubjectDescription(jpegBase64, process.env.OPENAI_API_KEY);
      console.log('GPT subject description:', description);
    }
    if (!description) {
      description = 'a person';
    }

    // Imagen 3 Customization avec SUBJECT_TYPE_PERSON
    // Le prompt utilise [1] pour rÃ©fÃ©rencer le sujet
    const images = await generateImages(prompt.prompt, jpegBase64, description, 2);

    return NextResponse.json({
      promptId: prompt.id,
      promptName: prompt.name,
      images: images.map((img) => `data:${img.mimeType};base64,${img.data}`),
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
