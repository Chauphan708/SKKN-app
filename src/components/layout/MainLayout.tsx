'use client';

import React from 'react';
import styles from './MainLayout.module.css';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import ErrorBoundary from '../ErrorBoundary';
import { Toaster } from 'sonner';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
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
