import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SkknProject, WorkflowData, FormData, SkknSection, SkknMetadata } from '../types';

interface WorkflowState extends SkknProject {
    // Actions
    setWorkflowData: (data: Partial<WorkflowData>) => void;
    setFormData: (data: Partial<FormData>) => void;
    updateSection: (id: string, content: string) => void;
    setAllSections: (sections: SkknSection[]) => void;
    setCurrentView: (view: string) => void;

    // Full reset/import
    importProject: (project: SkknProject) => void;
    resetProject: () => void;

    // Triggers for syncing with Supabase (mock for now)
    lastSavedAt: number | null;
    markAsSaved: () => void;
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

const initialState: Omit<WorkflowState, 'setWorkflowData' | 'setFormData' | 'updateSection' | 'setAllSections' | 'setCurrentView' | 'importProject' | 'resetProject' | 'markAsSaved'> = {
    title: 'Bản thảo SKKN mới',
    workflowData: defaultWorkflowData,
    formData: defaultFormData,
    skknSections: [],
    currentView: 'generator',
    customTopicStep4: '',
    topicOverride: null,
    analysisResult: null,
    combinedTopics: [],
    _meta: defaultMeta,
    lastSavedAt: null,
};

export const useWorkflowStore = create<WorkflowState>()(
    persist(
        (set, get) => ({
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

            setCurrentView: (view) => set({ currentView: view }),

            importProject: (project) =>
                set({ ...project, lastSavedAt: Date.now() }),

            resetProject: () => set({ ...initialState, lastSavedAt: Date.now() }),

            markAsSaved: () => set({ lastSavedAt: Date.now() }),
        }),
        {
            name: 'skkn-workflow-storage', // Tên key trong localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);
