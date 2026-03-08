'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: In a real app, you might want to install 'openai' and '@anthropic-ai/sdk'
// For this environment, we'll demonstrate using fetch for OpenAI and Claude to avoid installing new deps,
// while keeping Gemini as is.

export async function universalAiAction<T>(
    prompt: string,
    provider: 'gemini' | 'openai' | 'claude',
    userApiKey?: string,
    modelName?: string
): Promise<T[]> {
    const apiKey = userApiKey || process.env[`${provider.toUpperCase()}_API_KEY`];

    if (!apiKey) {
        throw new Error(`Chưa có API Key cho ${provider}. Vui lòng kiểm tra lại.`);
    }

    try {
        if (provider === 'gemini') {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            return JSON.parse(result.response.text()) as T[];
        }

        if (provider === 'openai') {
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
            const data = await response.json();
            const content = data.choices[0].message.content;
            const parsed = JSON.parse(content);
            // OpenAI often wraps in an object, we need to extract the array if T is an array
            return (Array.isArray(parsed) ? parsed : Object.values(parsed)[0]) as T[];
        }

        if (provider === 'claude') {
            // Anthropic Claude API Example using fetch
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
                    messages: [{ role: "user", content: prompt + "\n\nResponse must be a valid JSON array only." }]
                })
            });
            const data = await response.json();
            const text = data.content[0].text;
            // Claude usually requires more cleanup or a specific prompt
            return JSON.parse(text) as T[];
        }

        throw new Error("Provider không hợp lệ.");
    } catch (error) {
        console.error(`Error with ${provider}:`, error);
        throw new Error(`Lỗi khi gọi AI (${provider}). Vui lòng thử lại sau.`);
    }
}
