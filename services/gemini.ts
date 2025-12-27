import { GoogleGenAI } from "@google/genai";
import { Check } from "../types";

/**
 * دریافت ایمن کلید API
 * در لایه Vite، این مقدار در زمان بیلد جایگزین می‌شود.
 */
const getApiKey = (): string => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

export async function analyzeChecks(checks: Check[]): Promise<string> {
  const API_KEY = getApiKey();

  if (!API_KEY) {
    return "⚠️ هشدار: کلید API تنظیم نشده است. بخش تحلیل هوشمند غیرفعال است.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
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

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "شما دستیار هوشمند سیستم مدیریت چک تیسا هستید. صمیمی، حرفه‌ای و دقیق پاسخ دهید.",
      }
    });

    return response.text || "تحلیلی دریافت نشد.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "در حال حاضر امکان تحلیل هوشمند وجود ندارد. وضعیت اتصال یا کلید API را بررسی کنید.";
  }
}