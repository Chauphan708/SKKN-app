'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ActionResult } from '@/types';

const getModels = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && process.env.NODE_ENV === 'production') {
        console.error('GEMINI_API_KEY is not configured');
    }
    const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const fastModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    return { model, fastModel };
};

/**
 * Helper to clean and parse JSON from AI response
 */
function parseJsonResponse<T>(text: string): T[] {
    try {
        const cleanedText = text
            .replace(/```json\n?|```\n?/g, '')
            .trim();
        const parsed = JSON.parse(cleanedText);
        if (Array.isArray(parsed)) return parsed as T[];
        if (typeof parsed === 'object' && parsed !== null) {
            const keys = Object.keys(parsed);
            for (const key of keys) {
                if (Array.isArray(parsed[key])) return parsed[key] as T[];
            }
            return [parsed] as unknown as T[];
        }
        return [] as T[];
    } catch (error) {
        console.error("JSON Parse Error (Gemini):", error, "Original text:", text);
        throw new Error("Dữ liệu AI không hợp lệ. Vui lòng thử lại.");
    }
}

export async function generateAction<T>(prompt: string, isFast = true): Promise<ActionResult<T[]>> {
    try {
        const { model, fastModel } = getModels();
        const selectedModel = isFast ? fastModel : model;

        const result = await selectedModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const text = result.response.text();
        const data = parseJsonResponse<T>(text);
        return { success: true, data };
    } catch (error) {
        console.error("Server Action Error (Gemini):", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Không thể kết nối đến Trợ lý AI từ máy chủ. Vui lòng thử lại sau."
        };
    }
}

export async function streamAction(prompt: string): Promise<ActionResult<string>> {
    try {
        const { model } = getModels();
        const result = await model.generateContent(prompt);
        return { success: true, data: result.response.text() };
    } catch (error) {
        console.error("Server Action Error (Gemini Stream):", error);
        return {
            success: false,
            error: "Lỗi khi sinh nội dung từ máy chủ."
        };
    }
}
