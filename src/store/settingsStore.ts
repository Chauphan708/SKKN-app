import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AiSettings, ProviderType, AiInstruction } from '../types';

interface SettingsState extends AiSettings {
    setApiKey: (provider: ProviderType, key: string) => void;
    setModel: (provider: ProviderType, model: string) => void;
    setPreferredProvider: (provider: ProviderType) => void;
    setUseUserKeys: (use: boolean) => void;
    setTaskInstruction: (taskId: string, instruction: string) => void;
    saveToBank: (instruction: Omit<AiInstruction, 'id'>) => void;
    removeFromBank: (id: string) => void;
}

const defaultSettings: AiSettings = {
    providers: {
        gemini: { apiKey: '', model: 'gemini-1.5-flash' },
        openai: { apiKey: '', model: 'gpt-4o-mini' },
        claude: { apiKey: '', model: 'claude-3-5-sonnet-latest' },
    },
    preferredProvider: 'gemini',
    useUserKeys: false,
    taskInstructions: {},
    instructionBank: [],
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,
            setApiKey: (provider, key) =>
                set((state) => ({
                    providers: {
                        ...state.providers,
                        [provider]: { ...state.providers[provider], apiKey: key },
                    },
                })),
            setModel: (provider, model) =>
                set((state) => ({
                    providers: {
                        ...state.providers,
                        [provider]: { ...state.providers[provider], model: model },
                    },
                })),
            setPreferredProvider: (provider) => set({ preferredProvider: provider }),
            setUseUserKeys: (use) => set({ useUserKeys: use }),
            setTaskInstruction: (taskId, instruction) =>
                set((state) => ({
                    taskInstructions: {
                        ...state.taskInstructions,
                        [taskId]: instruction,
                    },
                })),
            saveToBank: (instruction) =>
                set((state) => ({
                    instructionBank: [
                        ...state.instructionBank,
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            title: instruction.title,
                            content: instruction.content
                        },
                    ],
                })),
            removeFromBank: (id) =>
                set((state) => ({
                    instructionBank: state.instructionBank.filter((i) => i.id !== id),
                })),
        }),
        {
            name: 'skkn-settings-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
