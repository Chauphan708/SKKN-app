'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const getModels = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && process.env.NODE_ENV === 'production') {
        console.error('GEMINI_API_KEY is not configured');
        // Không throw nữa để tránh sập render, chỉ trả về model lỗi khi gọi thực tế
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

export async function generateAction<T>(prompt: string, isFast = true): Promise<T[]> {
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
        return parseJsonResponse<T>(text);
    } catch (error) {
        console.error("Server Action Error (Gemini):", error);
        throw new Error(error instanceof Error ? error.message : "Không thể kết nối đến Trợ lý AI từ máy chủ. Vui lòng thử lại sau.");
    }
}

export async function streamAction(prompt: string) {
    // Note: Streaming over Server Actions requires specific handling (like AI SDK or custom ReadableStream)
    // For now, we provide a non-streaming version or use a standard response
    try {
        const { model } = getModels();
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Server Action Error (Gemini Stream):", error);
        throw new Error("Lỗi khi sinh nội dung từ máy chủ.");
    }
}
