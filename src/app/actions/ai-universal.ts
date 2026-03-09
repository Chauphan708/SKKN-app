'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ActionResult } from '@/types';

/**
 * Helper to clean and parse JSON from AI response
 */
function parseJsonResponse<T>(text: string): T[] {
    try {
        // Remove markdown code blocks if present (```json or ```)
        const cleanedText = text
            .replace(/```json\n?|```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanedText);

        // If it's already an array, return it
        if (Array.isArray(parsed)) return parsed as T[];

        // If it's an object, try to find an array property
        if (typeof parsed === 'object' && parsed !== null) {
            const keys = Object.keys(parsed);
            for (const key of keys) {
                if (Array.isArray(parsed[key])) return parsed[key] as T[];
            }
            // If it's just a single object, wrap it in an array
            return [parsed] as unknown as T[];
        }

        return [] as T[];
    } catch (error) {
        console.error("JSON Parse Error:", error, "Original text:", text);
        // If we can't parse but it looks like a list of strings, try manual split
        if (text.includes('\n') || text.includes(',')) {
            return text.split(/[,\n]/).map(s => s.trim()).filter(Boolean) as unknown as T[];
        }
        throw new Error("Không thể xử lý dữ liệu từ AI. Định dạng trả về không hợp lệ.");
    }
}

export async function universalAiAction<T>(
    prompt: string,
    provider: 'gemini' | 'openai' | 'claude',
    userApiKey?: string,
    modelName?: string
): Promise<ActionResult<T[]>> {
    const apiKey = userApiKey || process.env[`${provider.toUpperCase()}_API_KEY`];

    if (!apiKey) {
        return {
            success: false,
            error: `Chưa có API Key cho ${provider}. Vui lòng kiểm tra lại trong phần Cấu hình.`
        };
    }

    try {
        let resultData: T[] = [];

        if (provider === 'gemini') {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                }
            });

            const text = result.response.text();
            resultData = parseJsonResponse<T>(text);
        } else if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelName || "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are a helpful assistant that always responds with valid JSON arrays." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                return {
                    success: false,
                    error: `OpenAI Error: ${errorData.error?.message || response.statusText}`
                };
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            if (!content) return { success: false, error: "OpenAI không trả về nội dung." };

            resultData = parseJsonResponse<T>(content);
        } else if (provider === 'claude') {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: modelName || "claude-3-5-sonnet-20241022",
                    max_tokens: 4096,
                    messages: [{ role: "user", content: prompt + "\n\nIMPORTANT: Response must be a valid JSON array only." }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                return {
                    success: false,
                    error: `Claude Error: ${errorData.error?.message || response.statusText}`
                };
            }

            const data = await response.json();
            const text = data.content[0].text;
            resultData = parseJsonResponse<T>(text);
        } else {
            return { success: false, error: "Provider không hợp lệ." };
        }

        return { success: true, data: resultData };

    } catch (error) {
        console.error(`Error with ${provider}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : `Lỗi khi gọi AI (${provider}). Vui lòng thử lại sau.`
        };
    }
}
