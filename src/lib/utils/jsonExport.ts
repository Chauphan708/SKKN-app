import { SkknProject } from '../../types';

export const exportProjectToJson = (projectData: SkknProject, filename = 'skkn_project_backup.json') => {
    // Update export meta
    const dataToExport = {
        ...projectData,
        _meta: {
            ...projectData._meta,
            exportedAt: new Date().toISOString(),
        }
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importProjectFromJson = (
    file: File,
    onSuccess: (data: SkknProject) => void,
    onError: (error: Error) => void
) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const result = e.target?.result as string;
            const parsedData = JSON.parse(result) as SkknProject;

            // Basic validation
            if (!parsedData._meta || !parsedData.workflowData) {
                throw new Error("File JSON không hợp lệ hoặc thiếu dữ liệu bắt buộc.");
            }

            onSuccess(parsedData);
        } catch (err) {
            onError(err instanceof Error ? err : new Error("Lỗi khi đọc file JSON"));
        }
    };
    reader.onerror = () => onError(new Error("Không thể mở file."));
    reader.readAsText(file);
};
