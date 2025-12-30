
import { GoogleGenAI, Type } from "@google/genai";
import { UserContext, TripRequest, AnalyzedTrip, CostMagnitude, Complexity, RecommendationStatus } from "../types";

/**
 * Limpia la respuesta del modelo extrayendo solo el bloque JSON.
 */
function cleanJsonResponse(text: string): string {
  if (!text) return "[]";
  
  let cleaned = text.replace(/```json\n?|```/g, "").trim();
  
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  
  if (firstBracket !== -1 && lastBracket !== -1) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }
  
  return cleaned;
}

export async function analyzeTrips(context: UserContext, trips: TripRequest[]): Promise<AnalyzedTrip[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Actúa como MetaTourist, el Arquitecto de Realidades y Planificador Maestro.
    Transforma estos deseos en un manifiesto detallado para un viajero en ${context.originCountry}.
    
    Contexto Financiero:
    - Ahorro mensual: ${context.monthlySavings} ${context.currency}
    - Semilla inicial: ${context.initialSavings} ${context.currency}
    
    Destinos:
    ${JSON.stringify(trips)}

    INSTRUCCIONES CRÍTICAS:
    1. Organiza cronológicamente (0-11) según la factibilidad financiera basada en el ahorro acumulado mes a mes.
    2. Calcula costos realistas para vuelos (desde ${context.originCountry}), estadía, comida y extras.
    3. Describe la experiencia de forma inspiradora y sensorial.
    4. Proporciona exactamente 4 lugares turísticos icónicos por destino.
    5. Devuelve EXCLUSIVAMENTE un array JSON que cumpla con el esquema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Cambiado a Flash para máxima velocidad
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, // Deshabilitado para reducir latencia
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              isInternational: { type: Type.BOOLEAN },
              costMagnitude: { type: Type.STRING, enum: Object.values(CostMagnitude) },
              estimatedCostRange: {
                type: Type.OBJECT,
                properties: {
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER }
                },
                required: ["min", "max"]
              },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  flight: { type: Type.NUMBER },
                  stay: { type: Type.NUMBER },
                  food: { type: Type.NUMBER },
                  attractions: { type: Type.NUMBER }
                },
                required: ["flight", "stay", "food", "attractions"]
              },
              touristPlaces: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              seasonalLevel: { type: Type.STRING, enum: ["alta", "media", "baja"] },
              complexity: { type: Type.STRING, enum: Object.values(Complexity) },
              seasonality: { type: Type.STRING },
              experienceDescription: { type: Type.STRING },
              recommendation: { type: Type.STRING, enum: Object.values(RecommendationStatus) },
              reasoning: { type: Type.STRING },
              plannedMonth: { type: Type.NUMBER }
            },
            required: ["id", "name", "isInternational", "costMagnitude", "estimatedCostRange", "breakdown", "touristPlaces", "seasonalLevel", "complexity", "seasonality", "experienceDescription", "recommendation", "reasoning", "plannedMonth"]
          }
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("El cosmos devolvió una señal vacía.");
    }

    const cleanedText = cleanJsonResponse(textOutput);
    let rawResults;
    try {
      rawResults = JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error("Error al descifrar el manifiesto.");
    }
    
    return rawResults.map((result: any) => {
      const original = trips.find(t => t.id === result.id);
      return {
        ...original,
        ...result
      };
    });
  } catch (error: any) {
    console.error("AnalyzeTrips Error:", error);
    throw error;
  }
}

export async function generateDestinationImage(destinationName: string): Promise<string | undefined> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Travel editorial photography of ${destinationName}. Professional cinematic lighting, ultra-high definition 8k, National Geographic style, breathtaking landscape.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        imageConfig: { aspectRatio: "16:9" }
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (err) {
    return undefined;
  }
}
