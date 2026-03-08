'use client';

import React from 'react';
import styles from './SettingsModal.module.css';
import { useSettingsStore } from '@/store/settingsStore';
import { X, Cpu, Key, UserCheck } from 'lucide-react';
import { ProviderType } from '@/types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const {
        providers,
        preferredProvider,
        useUserKeys,
        setApiKey,
        setModel,
        setPreferredProvider,
        setUseUserKeys
    } = useSettingsStore();

    if (!isOpen) return null;

    const providerList: { id: ProviderType; name: string }[] = [
        { id: 'gemini', name: 'Google Gemini' },
        { id: 'openai', name: 'OpenAI (GPT)' },
        { id: 'claude', name: 'Anthropic Claude' },
    ];

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className={styles.title}>Cấu hình AI</h2>
                    <X className={styles.closeIcon} onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div className={styles.section}>
                    <div className={styles.checkboxGroup} onClick={() => setUseUserKeys(!useUserKeys)}>
                        <input
                            type="checkbox"
                            checked={useUserKeys}
                            onChange={() => { }} // Controlled via onClick on parent for better UX
                        />
                        <span className={styles.sectionTitle}>
                            <UserCheck size={18} /> Sử dụng API Key cá nhân của tôi
                        </span>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <Cpu size={18} /> Chọn nền tảng mặc định
                    </div>
                    <select
                        className={styles.select}
                        value={preferredProvider}
                        onChange={(e) => setPreferredProvider(e.target.value as ProviderType)}
                    >
                        {providerList.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {providerList.map(p => (
                    <div key={p.id} className={styles.section} style={{ opacity: preferredProvider === p.id ? 1 : 0.6 }}>
                        <div className={styles.sectionTitle}>
                            <Key size={16} /> {p.name} Configuration
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>API Key</label>
                            <input
                                type="password"
                                className={styles.input}
                                placeholder={`Nhập ${p.name} API Key...`}
                                value={providers[p.id]?.apiKey || ''}
                                onChange={(e) => setApiKey(p.id, e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Model Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Ví dụ: gpt-4o, gemini-1.5-pro..."
                                value={providers[p.id]?.model || ''}
                                onChange={(e) => setModel(p.id, e.target.value)}
                            />
                        </div>
                    </div>
                ))}

                <div className={styles.footer}>
                    <button className={`${styles.button} ${styles.primaryButton}`} onClick={onClose}>
                        Hoàn tất
                    </button>
                </div>
            </div>
        </div>
    );
};
