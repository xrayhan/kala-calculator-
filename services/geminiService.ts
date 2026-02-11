
import { GoogleGenAI } from "@google/genai";

// Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) to initialize the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const explainCalculation = async (expression: string, result: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the calculation ${expression} = ${result} in simple terms. If it's a financial or mathematical concept, provide context.`
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate an explanation at this time.";
  }
};

export const summarizeNotes = async (content: string) => {
  if (!content.trim()) return "The note is empty.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following notes and highlight any key numbers or figures mentioned: \n\n ${content}`
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error summarizing notes.";
  }
};
