'use client';

import React, { useState } from 'react';
import styles from './Step2Structure.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'sonner';
import { ArrowRight, Save, Trash2, Plus, GripVertical } from 'lucide-react';
import { DEFAULT_SKKN_STRUCTURE } from '@/lib/constants';

export const Step2Structure = () => {
    const { workflowData, formData, setFormData, skknSections, setAllSections, setCurrentView } = useWorkflowStore();

    // Khởi tạo Dàn ý mặc định nếu chưa có
    React.useEffect(() => {
        if (skknSections.length === 0) {
            setAllSections(DEFAULT_SKKN_STRUCTURE);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ [e.target.name]: e.target.value });
    };

    const handleTitleChange = (id: string, newTitle: string) => {
        const updated = skknSections.map(s => s.id === id ? { ...s, title: newTitle } : s);
        setAllSections(updated);
    };

    const handleDeleteSection = (id: string) => {
        const updated = skknSections.filter(s => s.id !== id);
        setAllSections(updated);
    };

    const handleAddSection = () => {
        const newId = `custom-${Date.now()}`;
        const newSection = { id: newId, title: 'Mục mới...', content: '', isCustom: true };
        setAllSections([...skknSections, newSection]);
    };

    const lockAndNext = () => {
        // Basic validation
        if (!formData.tenTacGia || !formData.tenTruong) {
            toast.error('Vui lòng điền đủ Tên tác giả và Tên trường!');
            return;
        }
        toast.success('Đã lưu cấu trúc. Chuyển sang Bước 3!');
        setCurrentView('step3'); // Chuyển sang màn viết phần chung
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>2. Thông tin & Cấu trúc SKKN</h2>
                <p>Điền thông tin và cá nhân hoá cấu trúc Dàn ý trước khi cho AI Viết bài.</p>
            </div>

            <Card className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div className={styles.stepCircle}>1</div>
                    <h3>Thông tin Tác giả & Đơn vị</h3>
                </div>

                <div className={styles.formGrid}>
                    <Input label="Đề tài Sáng kiến kinh nghiệm" value={workflowData.chosenTopic[0] || ''} disabled fullWidth style={{ gridColumn: '1 / -1' }} />

                    <Input name="tenTacGia" label="Tên Tác giả" value={formData.tenTacGia} onChange={handleChange} placeholder="VD: Nguyễn Văn A" />
                    <Input name="chucVu" label="Chức vụ" value={formData.chucVu} onChange={handleChange} placeholder="VD: Giáo viên" />
                    <Input name="chuyenMon" label="Chuyên môn" value={formData.chuyenMon} onChange={handleChange} placeholder="VD: Lịch sử" />

                    <Select name="capHoc" label="Cấp học / Khối lớp" value={formData.capHoc} onChange={handleChange} options={[
                        { value: 'Mầm non', label: 'Mầm non' },
                        { value: 'Tiểu học', label: 'Tiểu học' },
                        { value: 'THCS', label: 'THCS' },
                        { value: 'THPT', label: 'THPT' },
                    ]} />

                    <Input name="tenTruong" label="Tên Trường" value={formData.tenTruong} onChange={handleChange} placeholder="VD: THCS Nguyễn Du" />
                    <Input name="huyenThanhPho" label="Quận/Huyện" value={formData.huyenThanhPho} onChange={handleChange} placeholder="VD: Quận 1" />
                    <Input name="tinh" label="Tỉnh/Thành phố" value={formData.tinh} onChange={handleChange} placeholder="VD: TP.HCM" />

                    <Input name="namHoc" label="Thuộc Năm học" value={formData.namHoc} onChange={handleChange} placeholder="VD: 2026-2027" />
                    <Input name="tongSoHS" label="Tổng số học sinh khảo sát" type="number" value={formData.tongSoHS} onChange={handleChange} />
                    <Input name="soBienPhap" label="Số lượng Giải pháp muốn viết" type="number" value={formData.soBienPhap} onChange={handleChange} placeholder="VD: 3" />
                </div>
            </Card>

            <Card className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div className={styles.stepCircle}>2</div>
                    <h3>Cấu trúc Dàn ý SKKN</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className={styles.hint}>Bạn có thể tuỳ chỉnh (sửa tên, xoá) các mục dưới đây. AI sẽ bám sát theo khung này để tự viết.</p>
                    <Button variant="outline" size="sm" onClick={handleAddSection}><Plus size={16} /> Thêm Mục</Button>
                </div>

                <div className={styles.structureList}>
                    {skknSections.map((section) => (
                        <div key={section.id} className={styles.structureItem}>
                            <GripVertical size={20} className={styles.dragHandle} />
                            <input
                                className={styles.titleInput}
                                value={section.title}
                                onChange={(e) => handleTitleChange(section.id, e.target.value)}
                            />
                            <button className={styles.deleteBtn} onClick={() => handleDeleteSection(section.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.actionRow}>
                    <Button onClick={lockAndNext} size="lg">
                        <Save size={18} />
                        Lưu và Sang Bước 3: AI Viết Phần Chung
                        <ArrowRight size={18} />
                    </Button>
                </div>
            </Card>
        </div>
    );
};
