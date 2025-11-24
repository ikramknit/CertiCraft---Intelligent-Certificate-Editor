import { GoogleGenAI, Type } from "@google/genai";
import { CertificateData } from "../types";

export const extractCertificateData = async (
  base64Image: string
): Promise<CertificateData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Clean the base64 string if it contains the prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  const prompt = `
    Analyze this certificate image carefully. Extract the text details to recreate it.
    
    Specific fields to find:
    1. University Name (English and Hindi if available).
    2. Candidate/Student Name (Usually in bold/caps in the center).
    3. Degree/Course Name (e.g., Master of Computer Application).
    4. Division/Class (e.g., First Division).
    5. Year of passing or award.
    6. Date and Place text (usually bottom left).
    7. Name of the Vice Chancellor (bottom right signature area).
    
    If a field is missing, make a reasonable guess based on context or leave it as "Unknown".
    Return the data in a strict JSON structure.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            universityNameHindi: { type: Type.STRING },
            universityNameEnglish: { type: Type.STRING },
            studentName: { type: Type.STRING },
            courseName: { type: Type.STRING },
            division: { type: Type.STRING },
            year: { type: Type.STRING },
            date: { type: Type.STRING },
            viceChancellorName: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from Gemini");
    }

    return JSON.parse(text) as CertificateData;
  } catch (error) {
    console.error("Error extracting certificate data:", error);
    throw error;
  }
};