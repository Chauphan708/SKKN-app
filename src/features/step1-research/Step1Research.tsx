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

export const Step1Research = () => {
    const { workflowData, setWorkflowData, setCurrentView } = useWorkflowStore();

    const [problemText, setProblemText] = useState(workflowData.userProblem || '');
    const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false);
    const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

    // Xử lý AI Bước 1.1: Gợi ý giải pháp
    const handleGenerateSolutions = async () => {
        if (problemText.length < 10) {
            toast.error('Vui lòng mô tả vấn đề chi tiết hơn (ít nhất 10 ký tự)');
            return;
        }

        setIsGeneratingSolutions(true);
        try {
            // PROMPT 1: Phân tích Nỗi đau -> Giải pháp sư phạm
            const prompt = `Phân tích tình huống khó khăn sau trong giáo dục: "${problemText}". Hãy đóng vai một chuyên gia giáo dục xuất sắc, đề xuất 4-5 giải pháp sư phạm hoặc hoạt động thực tế (không cần quá lý thuyết) để khắc phục tình trạng này. Trả về mảng JSON chứa các string là các giải pháp đó.`;

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
            // PROMPT 2: Giải pháp -> Tên đề tài học thuật
            const prompt = `Từ các giải pháp sư phạm sau: ${JSON.stringify(workflowData.chosenSolution)}. Hãy tổng hợp và viết ra 3 tên "Sáng kiến kinh nghiệm" (hoặc Biện pháp giáo dục) thật chuẩn xác theo văn phong của Bộ GD&ĐT Việt Nam (ngắn gọn, xúc tích, nêu bật phương pháp và đối tượng tác động). Trả về MẢNG JSON chứa 3 chuỗi tên đề tài.`;

            const topics = await generateJsonArray<string>(prompt, false); // Dùng model mạnh hơn cho tên đề tài
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

                <div className={styles.actionRow}>
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

                    <div className={styles.actionRow}>
                        <Button
                            variant="secondary"
                            onClick={handleGenerateTopics}
                            isLoading={isGeneratingTopics}
                            disabled={isGeneratingTopics || workflowData.chosenSolution.length === 0}
                        >
                            <Sparkles size={16} />
                            Từ giải pháp này, đẻ ra rên Đề Tài
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
        </div>
    );
};
