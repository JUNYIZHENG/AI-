
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWelcomeMessage = async (name: string, company: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一名爱普生萝卜会议系统的智能助手。请为参会人 ${name}（来自 ${company}）生成一段简短、专业且热情的欢迎语（不超过50字）。欢迎参加“轻彩破界 智胜未来：2026 爱普生喷墨打印机合作伙伴大会”。`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "欢迎参加爱普生年度盛会！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "欢迎参加“轻彩破界 智胜未来”爱普生合作伙伴大会，祝您参会愉快！";
  }
};
