import { WorkflowData, FormData } from '@/types';

export const getPersonalizedSystemPrompt = (formData: FormData) => {
    return `Bạn là một chuyên gia giáo dục dày dạn kinh nghiệm. 
Thông tin tác giả: 
- Họ tên: ${formData.tenTacGia || 'Giáo viên'}
- Chức vụ: ${formData.chucVu || 'Giáo viên'}
- Chuyên môn: ${formData.chuyenMon || 'Giảng dạy'}
- Đơn vị: ${formData.tenTruong || 'Trường học'}
- Cấp học: ${formData.capHoc || 'Phổ thông'}
Hãy viết bài theo đúng văn phong sư phạm, chuyên nghiệp, phù hợp với bối cảnh giáo dục tại Việt Nam.`;
};

export const getStep1SolutionsPrompt = (problemText: string, formData: FormData, customInstruction?: string) => {
    return `${getPersonalizedSystemPrompt(formData)}
    
Phân tích tình huống khó khăn sau: "${problemText}".
Dựa trên vai trò là ${formData.chuyenMon || 'giáo viên'}, hãy đề xuất 4-5 giải pháp sư phạm hoặc hoạt động thực tế để khắc phục tình trạng này. 
Lưu ý: Giải pháp phải thực tế, có thể áp dụng ngay tại ${formData.tenTruong || 'trong lớp học'}.
${customInstruction ? `\nYÊU CẦU BỔ SUNG TỪ NGƯỜI DÙNG: ${customInstruction}\n` : ''}
Trả về mảng JSON chứa các string là các giải pháp đó.`;
};

export const getStep1TopicsPrompt = (chosenSolutions: string[], formData: FormData, customInstruction?: string) => {
    return `${getPersonalizedSystemPrompt(formData)}

Từ các giải pháp sư phạm sau: ${JSON.stringify(chosenSolutions)}. 
Hãy tổng hợp và viết ra 3 tên "Sáng kiến kinh nghiệm" (hoặc Biện pháp giáo dục) thật chuẩn xác theo văn phong của Bộ GD&ĐT Việt Nam. 
Tên đề tài cần ngắn gọn, xúc tích, nêu bật phương pháp và đối tượng tác động (Học sinh ${formData.capHoc || ''}).
${customInstruction ? `\nYÊU CẦU BỔ SUNG TỪ NGƯỜI DÙNG: ${customInstruction}\n` : ''}
Trả về MẢNG JSON chứa 3 chuỗi tên đề tài.`;
};

export const getStep4DetailPrompt = (solutionText: string, index: number, topic: string, formData: FormData, customInstruction?: string) => {
    return `${getPersonalizedSystemPrompt(formData)}

Nhiệm vụ: Viết chi tiết cho Biện pháp thứ ${index + 1} của Sáng kiến kinh nghiệm sau:
- Tên đề tài: ${topic}
- Nội dung biện pháp cần triển khai: "${solutionText}"

Yêu cầu bài viết gồm:
1. Mục tiêu của biện pháp.
2. Cách thức tiến hành (Các bước thực hiện cụ thể của ${formData.tenTacGia || 'giáo viên'}).
3. Ví dụ minh hoạ thực tế cho học sinh ${formData.capHoc}.
4. Kết quả mong đợi.

${customInstruction ? `\nYÊU CẦU BỔ SUNG TỪ NGƯỜI DÙNG: ${customInstruction}\n` : ''}
Lưu ý: Viết thật chi tiết, học thuật nhưng dễ hiểu. KHÔNG dùng markdown code blocks.`;
};

export const getStep3GeneralContentPrompt = (sectionTitle: string, workflowData: WorkflowData, formData: FormData, skknSections: any[], customInstruction?: string) => {
    return `${getPersonalizedSystemPrompt(formData)}

Nhiệm vụ: Viết nội dung cho mục "${sectionTitle}" của Sáng kiến kinh nghiệm sau:
- Tên đề tài: ${workflowData.chosenTopic[0] || formData.deTai}
- Khó khăn/Nỗi đau: ${workflowData.userProblem}
- Giải pháp cốt lõi: ${workflowData.chosenSolution.join(', ')}

Bối cảnh cấu trúc tổng thể:
${skknSections.map(s => s.title).join('\n')}

Yêu cầu cụ thể:
1. Viết giọng văn học thuật, chuyên môn sư phạm.
2. Gắn liền với bối cảnh thực tế tại ${formData.tenTruong || 'trường học'}.
3. Chỉ viết cho mục "${sectionTitle}".
${customInstruction ? `4. YÊU CẦU BỔ SUNG TỪ NGƯỜI DÙNG: ${customInstruction}\n` : ''}
${customInstruction ? '5' : '4'}. KHÔNG dùng markdown code blocks.`;
};
