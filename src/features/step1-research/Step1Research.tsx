'use client';

import React, { useState } from 'react';
import styles from './Step1Research.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { generateJsonArray } from '@/lib/gemini/client';
import { toast } from 'sonner';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

import { getStep1SolutionsPrompt, getStep1TopicsPrompt } from '@/lib/ai/prompts';
import { useSettingsStore } from '@/store/settingsStore';
import { AiInstructionModal, AiSettingsButton } from '@/components/ui/AiInstructionModal';

export const Step1Research = () => {
    const { workflowData, formData, setWorkflowData, setCurrentView } = useWorkflowStore();
    const { taskInstructions } = useSettingsStore();

    const [problemText, setProblemText] = useState(workflowData.userProblem || '');
    const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false);
    const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

    // Modal state
    const [activeAiModal, setActiveAiModal] = useState<{ id: string, title: string } | null>(null);

    // Xử lý AI Bước 1.1: Gợi ý giải pháp
    const handleGenerateSolutions = async () => {
        if (problemText.length < 10) {
            toast.error('Vui lòng mô tả vấn đề chi tiết hơn (ít nhất 10 ký tự)');
            return;
        }

        setIsGeneratingSolutions(true);
        try {
            const customInstruction = taskInstructions['step1-solutions'];
            const prompt = getStep1SolutionsPrompt(problemText, formData, customInstruction);
            const solutions = await generateJsonArray<string>(prompt);
            setWorkflowData({
                userProblem: problemText,
                suggestedSolutions: solutions,
                chosenSolution: [] // Reset mảng đã chọn nếu gen lại
            });
            toast.success('Đã phân tích xong giải pháp!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Lỗi không xác định');
        } finally {
            setIsGeneratingSolutions(false);
        }
    };

    // Toggle chọn/bỏ chọn giải pháp
    const toggleSolution = (solution: string) => {
        const currentList = workflowData.chosenSolution;
        const newList = currentList.includes(solution)
            ? currentList.filter(s => s !== solution)
            : [...currentList, solution];

        setWorkflowData({ chosenSolution: newList });
    };

    // Xử lý AI Bước 1.2: Xây tên đề tài
    const handleGenerateTopics = async () => {
        if (workflowData.chosenSolution.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 giải pháp để làm gốc rễ cho Đề tài!');
            return;
        }

        setIsGeneratingTopics(true);
        try {
            const customInstruction = taskInstructions['step1-topics'];
            const prompt = getStep1TopicsPrompt(workflowData.chosenSolution, formData, customInstruction);
            const topics = await generateJsonArray<string>(prompt, false);
            setWorkflowData({ suggestedTopics: topics });
            toast.success('Đã sáng tạo xong Đề tài!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Lỗi không xác định');
        } finally {
            setIsGeneratingTopics(false);
        }
    };

    // Hoàn tất Bước 1
    const lockTopicAndNext = (topic: string) => {
        setWorkflowData({ chosenTopic: [topic] });
        toast.success('Đã chốt đề tài: ' + topic);
        // Chuyển sang Bước 2
        setCurrentView('step2');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>1. Nghiên cứu & Sáng tạo Đề tài</h2>
                <p>Mô tả vấn đề {'->'} Chọn hướng giải quyết {'->'} AI gợi ý tên đề tài chuẩn chỉnh.</p>
            </div>

            {/* PHASE 1: VẤN ĐỀ & KHÓ KHĂN */}
            <Card className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div className={styles.stepCircle}>1</div>
                    <h3>Mô tả vấn đề / Khó khăn trên lớp</h3>
                </div>

                <textarea
                    className={styles.textarea}
                    value={problemText}
                    onChange={(e) => setProblemText(e.target.value)}
                    placeholder="Ví dụ: Học sinh lớp 9 rất thụ động trong giờ Lịch sử, hay nhầm lẫn mốc thời gian, ghi bài như máy chiếu..."
                    rows={4}
                />

                <div className={styles.actionRow} style={{ justifyContent: 'space-between' }}>
                    <AiSettingsButton
                        onClick={() => setActiveAiModal({ id: 'step1-solutions', title: 'Gợi ý giải pháp' })}
                        hasInstruction={!!taskInstructions['step1-solutions']}
                    />
                    <Button
                        onClick={handleGenerateSolutions}
                        isLoading={isGeneratingSolutions}
                        disabled={isGeneratingSolutions || problemText.length < 5}
                    >
                        <Sparkles size={16} />
                        Theo bạn, tôi nên giải quyết thế nào?
                    </Button>
                </div>
            </Card>

            {/* PHASE 2: CHỌN GIẢI PHÁP SƯ PHẠM */}
            {workflowData.suggestedSolutions.length > 0 && (
                <Card className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <div className={styles.stepCircle}>2</div>
                        <h3>Chọn hướng giải quyết phù hợp với bạn</h3>
                    </div>
                    <p className={styles.hint}>Trợ lý AI đã phân tích và gợi ý các hướng đi sau. Bạn hãy chọn 1-2 hướng ưng ý nhất:</p>

                    <div className={styles.solutionList}>
                        {workflowData.suggestedSolutions.map((sol, index) => {
                            const isSelected = workflowData.chosenSolution.includes(sol);
                            return (
                                <div
                                    key={index}
                                    className={`${styles.solutionItem} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => toggleSolution(sol)}
                                >
                                    <div className={styles.checkIcon}>
                                        {isSelected && <CheckCircle2 size={18} color="white" />}
                                    </div>
                                    <p>{sol}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.actionRow} style={{ justifyContent: 'space-between' }}>
                        <AiSettingsButton
                            onClick={() => setActiveAiModal({ id: 'step1-topics', title: 'Sáng tạo tên đề tài' })}
                            hasInstruction={!!taskInstructions['step1-topics']}
                        />
                        <Button
                            variant="secondary"
                            onClick={handleGenerateTopics}
                            isLoading={isGeneratingTopics}
                            disabled={isGeneratingTopics || workflowData.chosenSolution.length === 0}
                        >
                            <Sparkles size={16} />
                            Từ giải pháp này, đẻ ra tên Đề Tài
                        </Button>
                    </div>
                </Card>
            )}

            {/* PHASE 3: CHỐT TÊN ĐỀ TÀI */}
            {workflowData.suggestedTopics.length > 0 && (
                <Card className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <div className={styles.stepCircle}>3</div>
                        <h3>Sáng tạo Đề tài</h3>
                    </div>
                    <p className={styles.hint}>Dưới đây là 3 tên Đề tài SKKN chuẩn học thuật được nhào nặn từ định hướng của bạn. Hãy chốt 1 tên để tiếp tục!</p>

                    <div className={styles.topicList}>
                        {workflowData.suggestedTopics.map((topic, index) => (
                            <div key={index} className={styles.topicItem}>
                                <p><strong>{topic}</strong></p>
                                <Button
                                    size="sm"
                                    onClick={() => lockTopicAndNext(topic)}
                                    className={styles.chooseTopicBtn}
                                >
                                    Chọn & Trình bày Dàn ý <ArrowRight size={14} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
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
