import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfessionalBio = async (name: string, title: string, company: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-lite';
    const prompt = `
      Buatkan deskripsi profesional singkat (maksimal 2 kalimat) dalam Bahasa Indonesia untuk kartu nama digital.
      Nama: ${name}
      Jabatan: ${title}
      Perusahaan: ${company}
      
      Tone: Profesional, inovatif, dan terpercaya. Fokus pada keahlian teknologi.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Profesional teknologi berdedikasi untuk memberikan solusi digital inovatif bagi pertumbuhan bisnis Anda.";
  }
};