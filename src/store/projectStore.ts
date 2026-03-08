import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SkknProject, WorkflowData, FormData, SkknSection, SkknMetadata } from '../types';

interface ProjectState extends SkknProject {
    setWorkflowData: (data: Partial<WorkflowData>) => void;
    setFormData: (data: Partial<FormData>) => void;
    updateSection: (id: string, content: string) => void;
    setAllSections: (sections: SkknSection[]) => void;
    importProject: (project: SkknProject) => void;
    resetProject: () => void;
    markAsSaved: () => void;
    lastSavedAt: number | null;
}

const defaultWorkflowData: WorkflowData = {
    userProblem: '',
    useAiInSolution: false,
    suggestedSolutions: [],
    chosenSolution: [],
    suggestedTopics: [],
    chosenTopic: [],
    customTopicStep2: '',
    province: '',
    customStructure: '',
};

const defaultFormData: FormData = {
    deTai: '',
    tenTacGia: '',
    chucVu: '',
    chuyenMon: '',
    capHoc: '',
    tenTruong: '',
    tinh: '',
    huyenThanhPho: '',
    namHoc: '',
    tongSoHS: 0,
    soBienPhap: 0,
};

const defaultMeta: SkknMetadata = {
    version: 2,
    exportedAt: new Date().toISOString(),
    userName: 'Giáo viên',
};

const initialState: Omit<ProjectState, 'setWorkflowData' | 'setFormData' | 'updateSection' | 'setAllSections' | 'importProject' | 'resetProject' | 'markAsSaved'> = {
    title: 'Bản thảo SKKN mới',
    workflowData: defaultWorkflowData,
    formData: defaultFormData,
    skknSections: [],
    currentView: 'generator', // Metadata copy, UI store will master this
    customTopicStep4: '',
    topicOverride: null,
    analysisResult: null,
    combinedTopics: [],
    _meta: defaultMeta,
    lastSavedAt: null,
};

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            ...initialState,
            setWorkflowData: (data) =>
                set((state) => ({
                    workflowData: { ...state.workflowData, ...data }
                })),
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData, ...data }
                })),
            updateSection: (id, content) =>
                set((state) => ({
                    skknSections: state.skknSections.map(s =>
                        s.id === id ? { ...s, content } : s
                    )
                })),
            setAllSections: (sections) => set({ skknSections: sections }),
            importProject: (project) =>
                set({ ...project, lastSavedAt: Date.now() }),
            resetProject: () => set({ ...initialState, lastSavedAt: Date.now() }),
            markAsSaved: () => set({ lastSavedAt: Date.now() }),
        }),
        {
            name: 'skkn-project-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Auto-save logic (debounced)
let saveTimeout: NodeJS.Timeout;
useProjectStore.subscribe((state, prevState) => {
    // Chỉ lưu nếu có thay đổi dữ liệu thực sự (không phải chỉ thay đổi timestamp lưu)
    if (JSON.stringify(state.workflowData) !== JSON.stringify(prevState.workflowData) ||
        JSON.stringify(state.formData) !== JSON.stringify(prevState.formData) ||
        JSON.stringify(state.skknSections) !== JSON.stringify(prevState.skknSections)) {

        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
            try {
                // Giả lập hoặc gọi Supabase thực tế ở đây
                console.log("Auto-saving to Supabase...");
                // const { supabase } = await import('@/lib/supabase/client');
                // await supabase.from('projects').upsert({...state});
                useProjectStore.getState().markAsSaved();
            } catch (error) {
                console.error("Failed to auto-save:", error);
            }
        }, 3000); // 3 seconds debounce
    }
});
