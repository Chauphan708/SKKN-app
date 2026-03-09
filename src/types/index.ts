export interface UserProblem {
    problemDescription: string;
}

export interface SuggestedSolution {
    id: string;
    content: string;
}

export interface SuggestedTopic {
    id: string;
    content: string;
}

export interface WorkflowData {
    userProblem: string;
    useAiInSolution: boolean;
    suggestedSolutions: string[];
    chosenSolution: string[];
    suggestedTopics: string[];
    chosenTopic: string[];
    customTopicStep2: string;
    province: string;
    customStructure: string;
}

export interface FormData {
    deTai: string;
    tenTacGia: string;
    chucVu: string;
    chuyenMon: string;
    capHoc: string;
    tenTruong: string;
    tinh: string;
    huyenThanhPho: string;
    namHoc: string;
    tongSoHS: number;
    soBienPhap: number;
}

export interface SkknSection {
    id: string;
    title: string;
    content: string;
    isCustom?: boolean;
}

export interface SkknMetadata {
    version: number;
    exportedAt: string;
    userName: string;
}

export type ProviderType = 'gemini' | 'openai' | 'claude';

export interface AiInstruction {
    id: string;
    title: string;
    content: string;
}

export interface AiSettings {
    providers: {
        gemini?: { apiKey: string; model: string };
        openai?: { apiKey: string; model: string };
        claude?: { apiKey: string; model: string };
    };
    preferredProvider: ProviderType;
    useUserKeys: boolean;
    taskInstructions: Record<string, string>; // e.g., { "step1-solutions": "...", "step4-detail": "..." }
    instructionBank: AiInstruction[];
}

export interface SkknProject {
    // ... existing fields
    id?: string;
    user_id?: string;
    title: string;
    workflowData: WorkflowData;
    formData: FormData;
    skknSections: SkknSection[];
    currentView: string;
    customTopicStep4: string;
    topicOverride: string | null;
    analysisResult: string | null;
    combinedTopics: string[];
    _meta: SkknMetadata;
}

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}
