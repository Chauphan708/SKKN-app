'use client';

import React, { useState, useEffect } from 'react';
import styles from './Step5Appendix.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Sparkles, Save } from 'lucide-react';
import { streamText } from '@/lib/gemini/client';

export const Step5Appendix = () => {
    const { formData, skknSections, updateSection, setCurrentView } = useWorkflowStore();
    const [isGenerating, setIsGenerating] = useState(false);

    // ID đặc biệt cho khu vực "5. Hồ sơ kèm theo gồm có" (xem constants.ts)
    const APPENDIX_SECTION_ID = '5-ho-so-kem-theo';
    const appendixSection = skknSections.find(s => s.id === APPENDIX_SECTION_ID);

    // ID của khu vực các giải pháp
    const MAIN_SOLUTIONS_SECTION_ID = '2.5-noi-dung-giai-phap';
    const mainSection = skknSections.find(s => s.id === MAIN_SOLUTIONS_SECTION_ID);

    const [content, setContent] = useState(appendixSection?.content || '');

    // Cập nhật state nếu sections thay đổi từ bên ngoài
    useEffect(() => {
        if (appendixSection && appendixSection.content !== content && !isGenerating) {
            setContent(appendixSection.content);
        }
    }, [appendixSection]);

    const generateContextPrompt = () => {
        const solutionsText = mainSection?.content || '(Chưa có thông tin giải pháp ở Bước 4)';

        return `Bạn là một chuyên gia giáo dục đang hướng dẫn giáo viên làm minh chứng cho Sáng kiến kinh nghiệm (SKKN).
        
Dựa vào các NỘI DUNG GIẢI PHÁP mà giáo viên đã thực hiện dưới đây:
"""
${solutionsText.substring(0, 3000)} /* Trích xuất 1 phần để tránh quá giới hạn token */
"""

Tên đề tài: ${formData.deTai}

Nhiệm vụ của bạn: 
Viết danh sách các "Hồ sơ minh chứng kèm theo" cần có để hội đồng giám khảo tin tưởng vào kết quả của SKKN này.
Mỗi giải pháp cần gợi ý 1-2 loại minh chứng (ví dụ: Hình ảnh chụp cảnh học sinh học tập, bảng điểm so sánh, phiếu khảo sát, link video, giáo án...).

Cấu trúc trình bày: 
- Mục 1: Các văn bản, kế hoạch, quyết định (nếu có).
- Mục 2: Hình ảnh hoạt động (mô tả rõ học sinh đang làm gì trong ảnh).
- Mục 3: Số liệu, biểu bảng, sản phẩm của học sinh.

YÊU CẦU:
- Văn phong mạch lạc, học thuật.
- KHÔNG bọc văn bản bằng markdown \`\`\` hoặc dùng ký hiệu đặc biệt. Chỉ trả về văn bản thuần tuý để dán thẳng vào ứng dụng.`;
    };

    const handleGenerateAi = async () => {
        setIsGenerating(true);
        toast.info('Đang phân tích biện pháp để đề xuất minh chứng hình ảnh/tài liệu...');

        try {
            const prompt = generateContextPrompt();

            setContent(''); // Clear

            await streamText(prompt, (chunk) => {
                setContent(chunk);
            });

            toast.success('Đã lên danh sách gợi ý minh chứng!');

        } catch (error) {
            toast.error('Có lỗi xảy ra khi gọi AI. Vui lòng thử lại!');
        } finally {
            setIsGenerating(false);
            // Lưu lại kết quả cuối cùng lấy từ state content vào Zustand sẽ xảy ra ở nút Save hoặc khi tab mất focus
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const lockAndNext = () => {
        updateSection(APPENDIX_SECTION_ID, content);
        toast.success('Đã lưu Phụ lục. Bạn đã hoàn tất văn bản!');
        setCurrentView('step6');
    };

    const goBack = () => {
        updateSection(APPENDIX_SECTION_ID, content);
        setCurrentView('step4');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>5. Gợi ý Hồ sơ & Phụ lục minh chứng</h2>
                <p>Hội đồng chấm thi rất quan tâm đến chứng cứ thực tế. AI sẽ đọc các cách làm ở Bước 4 của bạn để đề xuất ra những bức ảnh, bảng biểu bạn nên chụp ghim vào cuối SKKN.</p>
            </div>

            <Card className={styles.cardContent}>
                <div className={styles.sectionHeader}>
                    <h3>Danh sách Minh chứng cần chuẩn bị</h3>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleGenerateAi}
                        disabled={isGenerating}
                    >
                        <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                        {isGenerating ? 'Đang soi chiếu biện pháp...' : 'AI Phân tích & Gợi ý'}
                    </Button>
                </div>

                <div className={styles.hint}>
                    💡 <strong>Tip:</strong> Nếu bạn đã có sẵn ảnh, bạn có thể tự ghi chú tên các bức ảnh vào phần dưới đây (Ví dụ: Ảnh 1: Hình học sinh thảo luận nhóm...). Phần mềm sẽ gộp nó vào trang cuối cùng của SKKN.
                </div>

                <textarea
                    className={`${styles.textarea} ${isGenerating ? styles.generating : ''}`}
                    value={content}
                    onChange={handleTextChange}
                    onBlur={() => updateSection(APPENDIX_SECTION_ID, content)}
                    placeholder="Nhấn AI Gợi ý để hệ thống tự động suy luận ra các góc chụp ảnh minh chứng phù hợp với chuyên môn, hoặc tự nhập thông tin các tài liệu đính kèm..."
                />
            </Card>

            <div className={styles.actionRow}>
                <Button variant="outline" onClick={goBack}>
                    <ArrowLeft size={18} /> Quay lại Bước 4
                </Button>
                <Button onClick={lockAndNext} size="lg">
                    <Save size={18} />
                    Lưu & Sang Bước 6: Hoàn thiện
                    <ArrowRight size={18} />
                </Button>
            </div>
        </div>
    );
};
