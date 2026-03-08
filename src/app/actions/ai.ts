'use server';

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('GEMINI_API_KEY is not configured');
    }
}

const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const fastModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateAction<T>(prompt: string, isFast = true): Promise<T[]> {
    try {
        const selectedModel = isFast ? fastModel : model;

        // Use JSON response mode for reliability
        const result = await selectedModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const text = result.response.text();
        return JSON.parse(text) as T[];
    } catch (error) {
        console.error("Server Action Error (Gemini):", error);
        throw new Error("Không thể kết nối đến Trợ lý AI từ máy chủ. Vui lòng thử lại sau.");
    }
}

export async function streamAction(prompt: string) {
    // Note: Streaming over Server Actions requires specific handling (like AI SDK or custom ReadableStream)
    // For now, we provide a non-streaming version or use a standard response
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Server Action Error (Gemini Stream):", error);
        throw new Error("Lỗi khi sinh nội dung từ máy chủ.");
    }
}
