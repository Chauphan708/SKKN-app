'use client';

import React, { useState, useEffect } from 'react';
import styles from './Step4Content.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Sparkles, Save } from 'lucide-react';
import { streamText } from '@/lib/gemini/client';

import { getStep4DetailPrompt } from '@/lib/ai/prompts';
import { useSettingsStore } from '@/store/settingsStore';
import { AiInstructionModal, AiSettingsButton } from '@/components/ui/AiInstructionModal';

export const Step4Content = () => {
    const { workflowData, formData, skknSections, updateSection, setCurrentView } = useWorkflowStore();
    const { taskInstructions } = useSettingsStore();
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<number>(0);

    // Modal state
    const [activeAiModal, setActiveAiModal] = useState<{ id: string, title: string } | null>(null);

    // ... (logic remains same)
    const solutions = workflowData.chosenSolution;
    const displaySolutions = solutions.length > 0
        ? solutions
        : Array.from({ length: formData.soBienPhap || 3 }, (_, i) => `Biện pháp ${i + 1}`);

    const MAIN_SOLUTIONS_SECTION_ID = '2.5-noi-dung-giai-phap';
    const mainSection = skknSections.find(s => s.id === MAIN_SOLUTIONS_SECTION_ID);

    const [solutionContents, setSolutionContents] = useState<string[]>(
        Array(displaySolutions.length).fill('')
    );

    // ... (useEffect remains same)

    const handleGenerateAi = async (index: number, solutionText: string) => {
        const id = `solution-${index}`;
        setGeneratingId(id);
        toast.info(`Đang nhờ AI viết chi tiết biện pháp ${index + 1}...`);

        try {
            const topic = workflowData.chosenTopic[0] || formData.deTai;
            const taskId = `step4-solution-${index}`;
            const customInstruction = taskInstructions[taskId];
            const prompt = getStep4DetailPrompt(solutionText, index, topic, formData, customInstruction);

            // Clear current content
            setSolutionContents(prev => {
                const next = [...prev];
                next[index] = '';
                return next;
            });

            await streamText(prompt, (chunk) => {
                setSolutionContents(prev => {
                    const next = [...prev];
                    next[index] = chunk;
                    return next;
                });
            });

            toast.success(`Đã viết xong biện pháp ${index + 1}`);
            syncToStore();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gọi AI. Vui lòng thử lại!');
        } finally {
            setGeneratingId(null);
        }
    };

    const handleTextChange = (index: number, value: string) => {
        setSolutionContents(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    // Hàm gộp tất cả văn bản lại và lưu vào phần "2.5-noi-dung-giai-phap"
    const syncToStore = () => {
        let combinedContent = '';
        displaySolutions.forEach((sol, index) => {
            combinedContent += `\n\n### Biện pháp ${index + 1}: ${sol}\n`;
            combinedContent += solutionContents[index] || '(Chưa có nội dung)';
        });

        updateSection(MAIN_SOLUTIONS_SECTION_ID, combinedContent.trim());
    };

    const lockAndNext = () => {
        syncToStore();
        toast.success('Đã lưu nội dung các Giải pháp. Chuyển sang Bước 5!');
        setCurrentView('step5');
    };

    const goBack = () => {
        syncToStore();
        setCurrentView('step3');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>4. Phân tích & Viết Giải pháp</h2>
                <p>Khu vực quan trọng nhất của SKKN. AI sẽ dựa vào Danh sách giải pháp bạn đã chọn ở Bước 1 để viết phân tích chuyên sâu cho từng biện pháp.</p>
            </div>

            {displaySolutions.length === 0 ? (
                <Card className={styles.emptyState}>
                    <p>Chưa có thông tin giải pháp. Vui lòng quay lại Bước 1 để phân tích nỗi đau và chọn giải pháp.</p>
                    <Button onClick={() => setCurrentView('step1')} style={{ marginTop: '1rem' }}>Quay lại Bước 1</Button>
                </Card>
            ) : (
                <>
                    <div className={styles.solutionTabs}>
                        {displaySolutions.map((sol, idx) => (
                            <button
                                key={idx}
                                className={`${styles.tab} ${activeTab === idx ? styles.active : ''}`}
                                onClick={() => setActiveTab(idx)}
                            >
                                Biện pháp {idx + 1}
                            </button>
                        ))}
                    </div>

                    <Card className={styles.solutionContent}>
                        <div className={styles.sectionHeader}>
                            <h3>Biện pháp {activeTab + 1}: {displaySolutions[activeTab]}</h3>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <AiSettingsButton
                                    onClick={() => setActiveAiModal({ id: `step4-solution-${activeTab}`, title: `Biện pháp ${activeTab + 1}` })}
                                    hasInstruction={!!taskInstructions[`step4-solution-${activeTab}`]}
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleGenerateAi(activeTab, displaySolutions[activeTab])}
                                    disabled={generatingId !== null}
                                >
                                    <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                                    {generatingId === `solution-${activeTab}` ? 'Đang viết...' : 'AI Phân tích chi tiết'}
                                </Button>
                            </div>
                        </div>

                        <textarea
                            className={`${styles.textarea} ${generatingId === `solution-${activeTab}` ? styles.generating : ''}`}
                            value={solutionContents[activeTab]}
                            onChange={(e) => handleTextChange(activeTab, e.target.value)}
                            onBlur={syncToStore} // Tự động lưu khi click ra ngoài ô text
                            placeholder="Nhấn nút AI bên trên để máy tự động phân tích cách làm, ví dụ và kết quả của biện pháp này. Hoặc bạn có thể tự đánh máy vào đây..."
                        />
                    </Card>
                </>
            )}

            <div className={styles.actionRow}>
                <Button variant="outline" onClick={goBack}>
                    <ArrowLeft size={18} /> Quay lại Bước 3
                </Button>
                <Button onClick={lockAndNext} size="lg">
                    <Save size={18} />
                    Lưu & Sang Bước 5: Phụ lục
                    <ArrowRight size={18} />
                </Button>
            </div>

            {/* Modals */}
            <AiInstructionModal
                isOpen={!!activeAiModal}
                onClose={() => setActiveAiModal(null)}
                taskId={activeAiModal?.id || ''}
                taskTitle={activeAiModal?.title || ''}
            />
        </div>
    );
};
