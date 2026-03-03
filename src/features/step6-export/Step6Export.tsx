'use client';

import React, { useRef } from 'react';
import styles from './Step6Export.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ArrowLeft, Download, Printer } from 'lucide-react';

export const Step6Export = () => {
    const { formData, workflowData, skknSections, setCurrentView } = useWorkflowStore();
    const printRef = useRef<HTMLDivElement>(null);

    const goBack = () => {
        setCurrentView('step5');
    };

    // Hàm tạo HTML hoàn chỉnh với CSS inline chuyên biệt cho Microsoft Word
    const generateWordHtml = () => {
        const title = formData.deTai || workflowData.chosenTopic[0] || 'Sáng kiến kinh nghiệm';

        let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                body {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 14pt;
                    line-height: 1.5;
                    color: black;
                }
                h1 { font-size: 18pt; text-align: center; text-transform: uppercase; font-weight: bold; }
                h2 { font-size: 14pt; font-weight: bold; margin-top: 16pt; margin-bottom: 8pt; }
                p { text-align: justify; margin-bottom: 10pt; }
                .author-info { text-align: right; font-style: italic; margin-bottom: 30pt; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            
            <div class="author-info">
                <p><strong>Người thực hiện:</strong> ${formData.tenTacGia}</p>
                <p><strong>Chức vụ:</strong> ${formData.chucVu} - <strong>Chuyên môn:</strong> ${formData.chuyenMon}</p>
                <p><strong>Đơn vị:</strong> ${formData.tenTruong}</p>
            </div>
            <br>
        `;

        // Render từng section
        skknSections.forEach(section => {
            htmlContent += `<h2>${section.title}</h2>\n`;

            // Xử lý xuống dòng cho HTML (biến \n thành <br> hoặc bao thẻ <p>)
            const paragraphs = section.content.split('\n\n'); // Đoạn văn cách nhau 2 \n
            paragraphs.forEach(p => {
                if (p.trim()) {
                    // Nếu là markdown của Giải pháp thì thay đổi chút cho dễ nhìn
                    let formattedP = p.replace(/### (.*?)\n/g, '<strong>$1</strong><br/>');
                    // Thay \n đơn thành <br>
                    formattedP = formattedP.replace(/\n/g, '<br/>');

                    htmlContent += `<p>${formattedP}</p>\n`;
                }
            });
        });

        htmlContent += `
        </body>
        </html>
        `;

        return htmlContent;
    };

    const exportToWord = () => {
        toast.info('Đang chuẩn bị file Word...');

        const html = generateWordHtml();

        // Tạo một Blob chứa nội dung HTML với MIME type cho MS Word
        const blob = new Blob(['\ufeff', html], {
            type: 'application/msword;charset=utf-8'
        });

        // Tạo URL tải xuống
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Tên file tải về
        const safeTitle = (formData.deTai || workflowData.chosenTopic[0] || 'SKKN').substring(0, 30).replace(/[^a-zA-Z0-9 ]/g, "");
        link.download = `SKKN_${safeTitle}.doc`;

        // Kích hoạt click tải xuống
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Đã tải xuống thành công!');
    };

    const printDocument = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Trình duyệt chặn Pop-up. Vui lòng cho phép để mở hộp thoại in.');
            return;
        }

        const html = generateWordHtml();
        printWindow.document.write(html);
        printWindow.document.close(); // Đợi DOM load
        printWindow.focus();

        // Gọi lệnh in sau 1 nhịp đợi thẻ style render xong
        setTimeout(() => {
            printWindow.print();
            // Optional: printWindow.close();
        }, 500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>6. Xem trước & Tải về máy</h2>
                <p>Nội dung Sáng kiến kinh nghiệm của bạn đã được kết nối lại thành một tài liệu thống nhất. Vui lòng đọc lại lần cuối trước khi tải xuống dưới dạng File Word hoặc in ra.</p>
            </div>

            <div className={styles.actionRow} style={{ marginTop: 0, justifyContent: 'flex-end', gap: '1rem', borderTop: 'none', paddingTop: 0 }}>
                <Button variant="secondary" onClick={printDocument}>
                    <Printer size={18} /> In ngay (Print)
                </Button>
                <Button onClick={exportToWord}>
                    <Download size={18} /> Tải xuống File Word (.doc)
                </Button>
            </div>

            <Card className={styles.previewCard}>
                <div className={styles.documentTitle}>
                    {formData.deTai || workflowData.chosenTopic[0] || 'Sáng kiến kinh nghiệm'}
                </div>

                <div className={styles.authorInfo}>
                    <div><strong>Giáo viên:</strong> {formData.tenTacGia || '[Tên tác giả]'}</div>
                    <div><strong>Trường:</strong> {formData.tenTruong || '[Tên trường]'}</div>
                    <div>{formData.namHoc || 'Năm học hiện tại'}</div>
                </div>

                <div className={styles.documentBody}>
                    {skknSections.map((section) => (
                        <div key={section.id} className={styles.section}>
                            <div className={styles.sectionTitle}>{section.title}</div>
                            <div className={styles.sectionContent}>
                                {section.content || '(Chưa có nội dung cho phần này)'}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className={styles.actionRow}>
                <Button variant="outline" onClick={goBack}>
                    <ArrowLeft size={18} /> Quay lại Bước 5: Phụ lục
                </Button>
                <Button onClick={exportToWord} size="lg">
                    <Download size={18} /> Tải xuống Bản Word hoàn chỉnh
                </Button>
            </div>
        </div>
    );
};
