import { v2 } from '@google-cloud/translate';

// Use the v2 API client
const translateClient = process.env.GOOGLE_CLOUD_PROJECT 
  ? new v2.Translate({ projectId: process.env.GOOGLE_CLOUD_PROJECT }) 
  : null;

/**
 * Translates a given text into the target language using Google Cloud Translation API.
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!translateClient) {
    return `[${targetLanguage}] ${text}`;
  }

  try {
    const [translation] = await translateClient.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Fallback to original text on error
  }
}
