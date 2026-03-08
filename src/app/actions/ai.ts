'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const getModels = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && process.env.NODE_ENV === 'production') {
        console.error('GEMINI_API_KEY is not configured');
        // Không throw nữa để tránh sập render, chỉ trả về model lỗi khi gọi thực tế
    }
    const genAI = new GoogleGenerativeAI(apiKey || '');
    return {
        model: genAI.getGenerativeModel({ model: "gemini-1.5-pro" }),
        fastModel: genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    };
};

export async function generateAction<T>(prompt: string, isFast = true): Promise<T[]> {
    try {
        const { model, fastModel } = getModels();
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
        const { model } = getModels();
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Server Action Error (Gemini Stream):", error);
        throw new Error("Lỗi khi sinh nội dung từ máy chủ.");
    }
}
