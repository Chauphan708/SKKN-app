'use client';
import { universalAiAction } from '@/app/actions/ai-universal';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Hàm gọi AI để sinh ra danh sách mảng JSON
 * Đã hỗ trợ đa nhà cung cấp (Gemini, OpenAI, Claude) và API Key của người dùng
 */
export async function generateJsonArray<T>(prompt: string, isFast = true): Promise<T[]> {
    const { preferredProvider, providers, useUserKeys } = useSettingsStore.getState();

    // Lấy Key và Model từ cấu hình
    const config = providers[preferredProvider];
    const userKey = useUserKeys ? config?.apiKey : undefined;
    const model = config?.model;

    try {
        const results = await universalAiAction<T>(prompt, preferredProvider, userKey, model);

        // Ensure results is actually an array before returning
        if (!Array.isArray(results)) {
            console.warn("AI didn't return an array, fixing layout:", results);
            return [results] as unknown as T[];
        }

        return results;
    } catch (error) {
        console.error("AI client error:", error);
        // Throw meaningful error for toast
        throw error;
    }
}

/**
 * Hàm gọi AI theo kiểu Streaming (đổ chữ từ từ)
 * Chú ý: Đang sử dụng non-streaming server action cho tính ổn định
 */
export async function streamText(prompt: string, onChunk: (text: string) => void) {
    const { preferredProvider, providers, useUserKeys } = useSettingsStore.getState();
    const config = providers[preferredProvider];
    const userKey = useUserKeys ? config?.apiKey : undefined;
    const model = config?.model;

    try {
        // Tạm thời gọi wrapper chung
        const results = await universalAiAction<string>(prompt, preferredProvider, userKey, model);
        const text = Array.isArray(results) ? results.join('\n') : String(results);
        onChunk(text);
        return text;
    } catch (error) {
        throw error;
    }
}
