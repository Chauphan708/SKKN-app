import { create } from 'zustand';

interface UIState {
    currentView: string;
    setCurrentView: (view: string) => void;
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    currentView: 'generator',
    setCurrentView: (view) => set({ currentView: view }),
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
    theme: 'light', // Theme initialized in component to avoid mismatch
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            localStorage.setItem('theme', newTheme);
        }
        return { theme: newTheme };
    }),
}));
