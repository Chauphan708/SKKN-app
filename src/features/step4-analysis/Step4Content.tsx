'use client';

import React, { useState, useEffect } from 'react';
import styles from './Step4Content.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Sparkles, Save } from 'lucide-react';
import { streamText } from '@/lib/gemini/client';

export const Step4Content = () => {
    const { workflowData, formData, skknSections, updateSection, setCurrentView } = useWorkflowStore();
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<number>(0);

    // Tính toán danh sách các Biện pháp
    // Dữ liệu giải pháp được lưu ở workflowData.chosenSolution (Mảng các string)
    const solutions = workflowData.chosenSolution;

    // Nếu chưa có giải pháp nào được chọn, tạo danh sách giả tạm thời dựa trên số lượng formData.soBienPhap
    const displaySolutions = solutions.length > 0
        ? solutions
        : Array.from({ length: formData.soBienPhap || 3 }, (_, i) => `Biện pháp ${i + 1}`);

    // ID đặc biệt cho khu vực "2.5-noi-dung-giai-phap" (xem constants.ts)
    const MAIN_SOLUTIONS_SECTION_ID = '2.5-noi-dung-giai-phap';
    const mainSection = skknSections.find(s => s.id === MAIN_SOLUTIONS_SECTION_ID);

    // Quản lý state cục bộ cho từng biện pháp trước khi gộp vào mainSection
    const [solutionContents, setSolutionContents] = useState<string[]>(
        Array(displaySolutions.length).fill('')
    );

    // Khi load trang, cố gắng tách nội dung cũ từ mainSection ra (nếu có)
    useEffect(() => {
        if (mainSection && mainSection.content) {
            // Logic tách đơn giản: chia theo keyword "Biện pháp X:" nếu có thể.
            // Trong thực tế, có thể lưu riêng lẻ vào Zustand, nhưng ở đây tạm tách hoặc để dồn.
            // Để đơn giản UI, nếu nội dung chưa có, ta khởi tạo mảng rỗng.
            if (!solutionContents.some(c => c.trim() !== '')) {
                // Chưa đồng bộ phức tạp, tạm giữ mốc
            }
        }
    }, [mainSection]);


    const generateContextPrompt = (solutionText: string, index: number) => {
        return `Bạn là một giáo viên và chuyên gia giáo dục xuất sắc. Nhiệm vụ của bạn là viết chi tiết cho Biện pháp thứ ${index + 1} của một Sáng kiến kinh nghiệm (SKKN).
        
THÔNG TIN CHUNG VỀ SKKN:
- Tên đề tài: ${workflowData.chosenTopic[0] || formData.deTai}
- Tác giả: ${formData.tenTacGia}, Đơn vị: ${formData.tenTruong}
- Đối tượng áp dụng: Học sinh ${formData.capHoc} (Tổng số: ${formData.tongSoHS} học sinh)

NỘI DUNG BIỆN PHÁP CẦN VIẾT CHI TIẾT:
"${solutionText}"

YÊU CẦU:
1. Viết thật chi tiết, cụ thể cách thức triển khai biện pháp này trong thực tế giảng dạy/quản lý.
2. Cấu trúc bài viết cho biện pháp này nên gồm:
   - Mục tiêu của biện pháp.
   - Cách thức tiến hành (những việc cụ thể giáo viên đã làm, bước 1, bước 2...).
   - Ví dụ minh hoạ cụ thể (tự sáng tạo một ví dụ thực tế sư phạm sinh động phù hợp với môn học).
   - Kết quả ngắn gọn của riêng biện pháp này.
3. Giọng văn mạch lạc, học thuật, chia đoạn rõ ràng.
4. LƯU Ý: KHÔNG bọc văn bản bằng markdown \`\`\` hoặc dùng ký hiệu đặc biệt. Chỉ trả về văn bản thuần tuý để dán thẳng vào ứng dụng.`;
    };

    const handleGenerateAi = async (index: number, solutionText: string) => {
        const id = `solution-${index}`;
        setGeneratingId(id);
        toast.info(`Đang nhờ AI viết chi tiết biện pháp ${index + 1}...`);

        try {
            const prompt = generateContextPrompt(solutionText, index);

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

            // Sau khi sinh xong, lập tức gộp và lưu vào section chính của Zustand
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
        </div>
    );
};
