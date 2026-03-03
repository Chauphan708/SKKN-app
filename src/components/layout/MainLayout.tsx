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
