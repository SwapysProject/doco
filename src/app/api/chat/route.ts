// app/api/chat/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- THIS IS THE NEW, IMPROVED PROMPT SECTION ---
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  // This is the core instruction for the AI's behavior
  systemInstruction: `Your task is to act as a professional medical assistant that gives structured and practical medical advice based on the condition or symptoms provided.

Instructions:
- The user input will be short, like: "Sachin has a cold", "Ravi is fine", or "Anita was bitten by a snake".
- Analyze the condition and only include relevant medical guidance.
- Structure your response using the following **sections**, but only include them if necessary:

  1. First Aid – Include only if immediate help is needed.
  2. Immediate Treatment – Mention if the condition requires prompt attention.
  3. Recommended Medicines – Only list medicines when applicable.
  4. Restrictions or Precautions – Include if lifestyle or activity limitations are needed.
  5. Additional Notes – Only add if there are important warnings, watch-outs, or advice to see a doctor.

Guidelines:
- If the user says someone is “fine” or there's no issue, reply briefly with no unnecessary suggestions.
- If the issue is mild (like cold or cough), respond with only relevant sections (e.g., medicines and precautions).
- If the condition is severe (e.g., snake bite, seizure), include **all sections** from First Aid to Additional Notes.
- Use bullet points or numbered lists for clarity.
- Do **not** refer to yourself, your sources, or give disclaimers. Just provide the medical solution.


`,
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
});
// --- END OF PROMPT SECTION ---

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json() as { message: string, history: Content[] };

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Now, we start the chat with just the conversation history.
    // The system instruction is already part of the model.
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const aiResponse = response.text();

    return NextResponse.json({ reply: aiResponse });

  } catch (error) {
    console.error("[GEMINI_API_ERROR] A critical error occurred:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred while contacting the AI model.' },
      { status: 500 }
    );
  }
}