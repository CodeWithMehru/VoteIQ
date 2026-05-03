import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SYSTEM_INSTRUCTION = `You are the official VoteIQ Civic Assistant. Your job is to guide citizens through the election timeline: 1. Registration, 2. ID Verification, 3. Finding a Booth, 4. Using the EVM. Keep answers highly interactive, short, and educational.`;

export async function getChatResponse(message: string): Promise<string> {
  try {
    if (!genAI) {
      throw new Error('Gemini API key is missing. Please configure it in .env.local');
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
