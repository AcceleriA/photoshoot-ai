import { generateImages } from '../../../lib/vertex-ai';
import { PROMPTS, enrichPrompt } from '../../../lib/prompts';
import { NextResponse } from 'next/server';

export const maxDuration = 120;

export async function POST(request) {
  try {
    const { promptId, imageBase64, subjectDescription } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image requise' }, { status: 400 });
    }

    const prompt = PROMPTS[promptId];
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt ' + promptId + ' introuvable' }, { status: 400 });
    }

    if (!process.env.GOOGLE_PROJECT_ID) {
      return NextResponse.json({ error: 'GOOGLE_PROJECT_ID non configure' }, { status: 500 });
    }

    const fullPrompt = enrichPrompt(prompt.prompt, subjectDescription);

    const images = await generateImages(
      fullPrompt,
      imageBase64,
      subjectDescription || 'person',
      4
    );

    return NextResponse.json({
      promptId: prompt.id,
      promptName: prompt.name,
      images: images.map(img => 'data:image/png;base64,' + img),
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
