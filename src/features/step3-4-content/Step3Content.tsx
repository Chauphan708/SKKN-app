'use client';

import React, { useState } from 'react';
import styles from './Step3Content.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ArrowRight, Sparkles, Save, ChevronRight } from 'lucide-react';
import { getStep3GeneralContentPrompt } from '@/lib/ai/prompts';
import { streamText } from '@/lib/gemini/client';
import { useSettingsStore } from '@/store/settingsStore';
import { AiInstructionModal, AiSettingsButton } from '@/components/ui/AiInstructionModal';

export const Step3Content = () => {
    const { workflowData, formData, skknSections, updateSection, setCurrentView } = useWorkflowStore();
    const { taskInstructions } = useSettingsStore();
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    // Modal state
    const [activeAiModal, setActiveAiModal] = useState<{ id: string, title: string } | null>(null);

    const handleGenerateAi = async (id: string, title: string) => {
        setGeneratingId(id);
        toast.info(`Đang nhờ AI viết mục: ${title}...`);

        try {
            const taskId = `step3-${id}`;
            const customInstruction = taskInstructions[taskId];
            const prompt = getStep3GeneralContentPrompt(title, workflowData, formData, skknSections, customInstruction);

            // Xóa nội dung cũ
            updateSection(id, '');

            await streamText(prompt, (chunk) => {
                updateSection(id, chunk);
            });

            toast.success(`Đã viết xong mục: ${title}`);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gọi AI. Vui lòng thử lại!');
        } finally {
            setGeneratingId(null);
        }
    };

    const handleTextChange = (id: string, value: string) => {
        updateSection(id, value);
    };

    const lockAndNext = () => {
        toast.success('Đã lưu nội dung các phần chung. Chuyển sang Bước 4!');
        setCurrentView('step4');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>3. Sinh nội dung Phần Chung</h2>
                <p>Hệ thống tự động sử dụng bối cảnh đề tài để viết các mục: Lý do chọn đề tài, Cơ sở lý luận, Học sinh... Bạn có thể tự sửa lại nội dung sau khi AI sinh xong.</p>
            </div>

            <div className={styles.sectionList}>
                {skknSections.map((section) => {
                    // Tùy chọn: Ẩn phần 2.5 (Các biện pháp) ở bước này để nhường cho Bước 4
                    if (section.id === '2.5-noi-dung-giai-phap') return null;

                    return (
                        <Card key={section.id} className={styles.sectionItem}>
                            <div className={styles.sectionHeader}>
                                <h3>{section.title}</h3>
                                <div className={styles.actions} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <AiSettingsButton
                                        onClick={() => setActiveAiModal({ id: `step3-${section.id}`, title: section.title })}
                                        hasInstruction={!!taskInstructions[`step3-${section.id}`]}
                                    />
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleGenerateAi(section.id, section.title)}
                                        disabled={generatingId !== null}
                                    >
                                        <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                                        {generatingId === section.id ? 'Đang viết...' : 'AI Viết'}
                                    </Button>
                                </div>
                            </div>
                            <textarea
                                className={`${styles.textarea} ${generatingId === section.id ? styles.generating : ''}`}
                                value={section.content}
                                onChange={(e) => handleTextChange(section.id, e.target.value)}
                                placeholder={`Nhấn "AI Viết" để tự động điền hoặc bạn có thể tự nhập tay nội dung cho phần ${section.title}...`}
                            />
                        </Card>
                    );
                })}
            </div>

            <div className={styles.actionRow}>
                <Button onClick={lockAndNext} size="lg">
                    <Save size={18} />
                    Lưu & Sang Bước 4: Viết chi tiết Giải pháp
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
