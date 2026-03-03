import { GoogleGenerativeAI } from '@google/generative-ai';

// Lấy API key từ biến môi trường
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'placeholder-key';
const genAI = new GoogleGenerativeAI(apiKey);

// Model chuẩn cho việc sinh văn bản chất lượng cao và đa dạng
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const fastModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Phân tích lỗi API và dịch ra tiếng Việt thân thiện
 */
const handleApiError = (error: any) => {
    console.error("Lỗi khi kết nối Gemini API:", error);

    const errString = String(error);
    if (errString.includes('429') || errString.includes('quota')) {
        return new Error("Đã hết luợt gọi AI miễn phí (Quota Exceeded). Vui lòng chờ 1 phút hoặc thử lại sau.");
    }
    if (errString.includes('503') || errString.includes('timeout')) {
        return new Error("Hệ thống AI đang quá tải. Vui lòng nhấn nút thử lại.");
    }
    if (apiKey === 'placeholder-key' || !apiKey) {
        return new Error("Chưa cấu hình API Key. Vui lòng nhập API Key để dùng.");
    }

    return new Error("Không thể kết nối đến Trợ lý AI lúc này. Vui lòng thử lại sau.");
};

/**
 * Hàm gọi AI để sinh ra danh sách mảng JSON (ví dụ gọi 5 giải pháp, 3 tên đề tài)
 */
export async function generateJsonArray<T>(prompt: string, isFast = true): Promise<T[]> {
    try {
        const selectedModel = isFast ? fastModel : model;

        // Ép AI luôn trả về định dạng mảng JSON
        const fullPrompt = `${prompt}\n\nLƯU Ý QUAN TRỌNG: Bạn chỉ được phép trả lời bằng một mảng JSON thuần túy (không bọc trong markdown \`\`\`json, không có diễn giải nào khác). Ví dụ: ["item 1", "item 2"]`;

        const result = await selectedModel.generateContent(fullPrompt);
        const text = result.response.text();

        // Dọn dẹp markdown nếu AI lỡ trả về markdown ```json
        const cleanJsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        return JSON.parse(cleanJsonText) as T[];
    } catch (error) {
        throw handleApiError(error);
    }
}

/**
 * Hàm gọi AI theo kiểu Streaming (đổ chữ từ từ)
 */
export async function streamText(prompt: string, onChunk: (text: string) => void) {
    try {
        const result = await model.generateContentStream(prompt);

        let fullText = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            onChunk(fullText); // Gọi callback truyền đoạn văn bản gộp liên tục
        }

        return fullText;
    } catch (error) {
        throw handleApiError(error);
    }
}
