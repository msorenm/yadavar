
import { GoogleGenAI } from "@google/genai";
import { Check } from "../types";

// Always use the API key directly from process.env.API_KEY as per the library guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeChecks(checks: Check[]): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const checksSummary = checks.map(c => 
    `چک شماره ${c.checkNumber} به مبلغ ${c.amount} ریال با سررسید ${c.dueDate} (${c.status})`
  ).join('\n');

  const prompt = `
    شما یک تحلیلگر مالی هوشمند هستید. لیست چک‌های زیر را بررسی کنید و یک گزارش کوتاه مدیریتی به زبان فارسی ارائه دهید.
    موارد مهم شامل: چک‌های نزدیک به سررسید، مجموع بدهی‌های بحرانی و پیشنهادهایی برای مدیریت نقدینگی.
    
    لیست چک‌ها:
    ${checksSummary}
  `;

  try {
    // Calling generateContent with both model name and prompt directly.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "شما دستیار هوشمند سیستم مدیریت چک تیسا هستید. صمیمی، حرفه‌ای و دقیق پاسخ دهید.",
      }
    });
    // Extracting text output using the .text property as defined in the GenerateContentResponse object.
    return response.text || "خطا در تحلیل هوشمند.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "در حال حاضر امکان تحلیل هوشمند وجود ندارد.";
  }
}
