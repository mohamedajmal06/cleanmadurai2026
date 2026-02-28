import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface WasteAnalysis {
  isWaste: boolean;
  wasteType: string;
  confidence: number;
  urgency: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface DeadAnimalAnalysis {
  isDeadAnimal: boolean;
  animalType?: string;
  urgency: 'Low' | 'Medium' | 'High';
  confidence: number;
  description: string;
}

export async function analyzeWasteImage(base64Image: string): Promise<WasteAnalysis> {
  const model = "gemini-3-flash-preview";
  const prompt = `Analyze this image for a waste management platform. 
  1. Is there garbage or waste visible?
  2. What type of waste is it? (plastic, organic, mixed, construction, etc.)
  3. How urgent is the cleanup? (Low, Medium, High)
  4. Provide a brief description.
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] || base64Image } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isWaste: { type: Type.BOOLEAN },
          wasteType: { type: Type.STRING },
          urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING }
        },
        required: ["isWaste", "wasteType", "urgency", "confidence", "description"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeDeadAnimalImage(base64Image: string): Promise<DeadAnimalAnalysis> {
  const model = "gemini-3-flash-preview";
  const prompt = `Analyze this image for a public hygiene platform.
  1. Is there a dead animal visible?
  2. What type of animal is it? (dog, cat, cow, bird, etc.)
  3. How urgent is the removal? (Low, Medium, High)
  4. Provide a brief description.
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] || base64Image } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isDeadAnimal: { type: Type.BOOLEAN },
          animalType: { type: Type.STRING },
          urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING }
        },
        required: ["isDeadAnimal", "urgency", "confidence", "description"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function verifyCleanup(beforeImage: string, afterImage: string): Promise<{ verified: boolean; score: number; feedback: string }> {
  const model = "gemini-3-flash-preview";
  const prompt = `Compare these two images: 'Before' (first) and 'After' (second) cleanup.
  Has the waste been cleared? 
  Give a cleanliness score from 0 to 100.
  Provide feedback.
  Return JSON.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: beforeImage.split(',')[1] || beforeImage } },
          { inlineData: { mimeType: "image/jpeg", data: afterImage.split(',')[1] || afterImage } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verified: { type: Type.BOOLEAN },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        },
        required: ["verified", "score", "feedback"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function chatWithAI(message: string, context: any[] = []) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are the Clean Madurai AI Assistant. 
      Help users report waste, track complaints, and learn about waste disposal in Madurai.
      Be professional, helpful, and encouraging. 
      Madurai is one of the oldest cities in India, and we want to make it the cleanest.
      If asked about reporting, explain that they can upload a photo and the AI will verify it.
      If asked about disposal, suggest segregation (organic vs inorganic).`
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
