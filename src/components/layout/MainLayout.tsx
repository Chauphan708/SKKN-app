'use client';

import React from 'react';
import styles from './MainLayout.module.css';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import ErrorBoundary from '../ErrorBoundary';
import { Toaster } from 'sonner';
import { useProjectStore } from '@/store/projectStore';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);

        // Auto-save logic (debounced) - moved from store to avoid SSR issues
        let saveTimeout: NodeJS.Timeout;
        const unsubscribe = useProjectStore.subscribe((state, prevState) => {
            if (JSON.stringify(state.workflowData) !== JSON.stringify(prevState.workflowData) ||
                JSON.stringify(state.formData) !== JSON.stringify(prevState.formData) ||
                JSON.stringify(state.skknSections) !== JSON.stringify(prevState.skknSections)) {

                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(async () => {
                    try {
                        console.log("Auto-saving project data...");
                        useProjectStore.getState().markAsSaved();
                    } catch (error) {
                        console.error("Failed to auto-save:", error);
                    }
                }, 3000);
            }
        });

        return () => {
            unsubscribe();
            clearTimeout(saveTimeout);
        };
    }, []);

    if (!mounted) {
        return <div className={styles.layout} style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.mainWrapper}>
                <Header />
                <main className={styles.mainContent}>
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </main>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
};
