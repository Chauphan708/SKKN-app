'use client';

import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import {
    Lightbulb,
    ListTree,
    PenTool,
    FileCheck2,
    Paperclip,
    Download,
    Moon,
    Sun
} from 'lucide-react';

export const Sidebar = () => {
    const { currentView } = useWorkflowStore();
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Xử lý bật tắt Dark Mode
    useEffect(() => {
        // Lấy config từ LocalStorage ra khi tải trang mới
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const getIsActive = (stepView: string, id: number) => {
        if (currentView === 'generator') return stepView === 'step1';
        return currentView === stepView;
    };

    const steps = [
        { id: 1, view: 'step1', title: 'Nghiên cứu & Đề tài', icon: Lightbulb },
        { id: 2, view: 'step2', title: 'Cấu trúc SKKN', icon: ListTree },
        { id: 3, view: 'step3', title: 'Tạo phần chung', icon: PenTool },
        { id: 4, view: 'step4', title: 'Phân tích & Biện pháp', icon: FileCheck2 },
        { id: 5, view: 'step5', title: 'Tạo phụ lục minh chứng', icon: Paperclip },
        { id: 6, view: 'step6', title: 'Tải SK về máy', icon: Download },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <Lightbulb size={24} color="var(--primary)" />
                </div>
                <span className={styles.logoText}>Trợ lý SKKN</span>
            </div>

            <nav className={styles.nav}>
                {steps.map((step) => {
                    const Icon = step.icon;
                    const isActive = getIsActive(step.view, step.id);
                    return (
                        <div
                            key={step.id}
                            className={`${styles.step} ${isActive ? styles.active : ''}`}
                        >
                            <div className={styles.stepNumber}>{step.id}</div>
                            <span className={styles.stepTitle}>{step.title}</span>
                        </div>
                    );
                })}
            </nav>

            <div className={styles.footer} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                    className={styles.helpLink}
                    onClick={toggleTheme}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', borderRadius: '8px', background: 'var(--background)' }}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        {isDarkMode ? 'Bật nền sáng' : 'Bật nền tối'}
                    </span>
                </div>
                <div className={styles.helpLink}>
                    <span>📖 Hướng dẫn sử dụng</span>
                </div>
            </div>
        </aside>
    );
};
