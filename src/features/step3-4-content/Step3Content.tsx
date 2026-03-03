'use client';

import React, { useState } from 'react';
import styles from './Step3Content.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ArrowRight, Sparkles, Save, ChevronRight } from 'lucide-react';
import { streamText } from '@/lib/gemini/client';

export const Step3Content = () => {
    const { workflowData, formData, skknSections, updateSection, setCurrentView } = useWorkflowStore();
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const generateContextPrompt = (sectionTitle: string) => {
        return `Bạn là một chuyên gia giáo dục xuất sắc. Nhiệm vụ của bạn là viết nội dung cho mục "${sectionTitle}" của một Sáng kiến kinh nghiệm (SKKN).
        
THÔNG TIN CHUNG VỀ SKKN:
- Tên đề tài: ${workflowData.chosenTopic[0] || formData.deTai}
- Khó khăn/Nỗi đau gặp phải: ${workflowData.userProblem}
- Giải pháp cốt lõi: ${workflowData.chosenSolution.join(', ')}
- Tác giả: ${formData.tenTacGia}, Chức vụ: ${formData.chucVu}, Chuyên môn: ${formData.chuyenMon}
- Đơn vị: ${formData.tenTruong}, ${formData.huyenThanhPho}, ${formData.tinh}
- Đối tượng áp dụng: Học sinh ${formData.capHoc} (Tổng số: ${formData.tongSoHS} học sinh)

CẤU TRÚC SKKN TỔNG THỂ DỰ KIẾN:
${skknSections.map(s => s.title).join('\n')}

YÊU CẦU DÀNH BIỆT CHO MỤC NÀY:
- Viết bằng giọng văn học thuật, chuyên môn sư phạm, rành mạch, chia đoạn rõ ràng.
- Gắn liền với bối cảnh thực tế đã cung cấp ở trên.
- Chỉ viết nội dung của mục "${sectionTitle}", không vẽ vời các mục khác.
- LƯU Ý: Không dùng markdown \`\`\` để bọc văn bản. Trả về văn bản thuần.`;
    };

    const handleGenerateAi = async (id: string, title: string) => {
        setGeneratingId(id);
        toast.info(`Đang nhờ AI viết mục: ${title}...`);
        
        try {
            const prompt = generateContextPrompt(title);
            
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
                                <div className={styles.actions}>
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
        </div>
    );
};
