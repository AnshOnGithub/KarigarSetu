import { File } from 'expo-file-system';
import { config, providers } from '@/config';
import { getLanguageInfo } from '@/i18n/languages';
import type { Language } from '@/types';
import { createInteraction, outputText } from './gemini';

function audioMime(uri: string) {
  const extension = uri.split('.').pop()?.toLowerCase() ?? 'm4a';
  const mime = extension === 'wav' ? 'audio/wav' : extension === 'webm' ? 'audio/webm' : extension === 'mp3' ? 'audio/mp3' : 'audio/mp4';
  return { extension, mime };
}

/** Speech-to-text via Sarvam AI (paid, best Indic accuracy) or Gemini (free tier). */
export async function transcribe(audioUri: string, language: Language): Promise<string> {
  if (providers.speechToText === 'sarvam') return transcribeWithSarvam(audioUri, language);
  if (providers.speechToText === 'gemini') return transcribeWithGemini(audioUri, language);
  throw new Error('Speech to text is not configured.');
}

async function transcribeWithSarvam(audioUri: string, language: Language): Promise<string> {
  const { extension, mime } = audioMime(audioUri);
  const form = new FormData();
  form.append('file', { uri: audioUri, name: `voice.${extension}`, type: mime } as unknown as Blob);
  form.append('model', config.sarvamSttModel);
  form.append('language_code', getLanguageInfo(language).sttCode);

  const response = await fetch('https://api.sarvam.ai/speech-to-text', {
    method: 'POST',
    headers: { 'api-subscription-key': config.sarvamApiKey },
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Transcription failed (${response.status})`);
  }
  const json = (await response.json()) as { transcript?: string };
  return (json.transcript ?? '').trim();
}

async function transcribeWithGemini(audioUri: string, language: Language): Promise<string> {
  const { mime } = audioMime(audioUri);
  const languageName = getLanguageInfo(language).label;
  const response = await createInteraction({
    model: config.geminiTextModel,
    input: [
      {
        type: 'text',
        text:
          `Transcribe this voice note exactly as spoken. The speaker is an Indian artisan speaking mainly ${languageName}. ` +
          `Write it in ${languageName} script; keep English words as spoken. Return only the transcript, with no notes or quotes.`,
      },
      { type: 'audio', mime_type: mime, data: await new File(audioUri).base64() },
    ],
  }, { fallbackModels: config.geminiTextFallbackModels });
  return outputText(response);
}
