import React, { useState, useEffect } from 'react';
import { X, Sparkles, Save, Trash2, BookmarkPlus, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './AiInstructionModal.module.css';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

interface AiInstructionModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: string;
    taskTitle: string;
}

export const AiInstructionModal = ({ isOpen, onClose, taskId, taskTitle }: AiInstructionModalProps) => {
    const { taskInstructions, setTaskInstruction, instructionBank, saveToBank, removeFromBank } = useSettingsStore();
    const [instruction, setInstruction] = useState('');
    const [bankTitle, setBankTitle] = useState('');
    const [showBank, setShowBank] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setInstruction(taskInstructions[taskId] || '');
        }
    }, [isOpen, taskId, taskInstructions]);

    if (!isOpen) return null;

    const handleSave = () => {
        setTaskInstruction(taskId, instruction);
        onClose();
    };

    const handleSaveToBank = () => {
        if (!instruction.trim()) {
            toast.error('Vui lòng nhập nội dung chỉ dẫn');
            return;
        }
        if (!bankTitle.trim()) {
            toast.error('Vui lòng nhập tên gợi nhớ');
            return;
        }
        saveToBank({ title: bankTitle, content: instruction });
        setBankTitle('');
        toast.success('Đã lưu vào ngân hàng chỉ dẫn!');
    };

    const selectFromBank = (content: string) => {
        setInstruction(content);
        toast.info('Đã áp dụng mẫu từ ngân hàng');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Tùy chỉnh AI cho: {taskTitle}</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.body}>
                    <p className={styles.description}>
                        Nhập các yêu cầu bổ sung để AI thực hiện nhiệm vụ này tốt hơn.
                    </p>
                    <textarea
                        className={styles.textarea}
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="Ví dụ: Viết theo phong cách kể chuyện, thêm các ví dụ thực tế ở vùng cao..."
                    />

                    <div className={styles.saveToBankArea}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <BookmarkPlus size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Lưu mẫu này vào ngân hàng</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                className={styles.bankInput}
                                placeholder="Tên gợi nhớ (VD: Phong cách kể chuyện)"
                                value={bankTitle}
                                onChange={(e) => setBankTitle(e.target.value)}
                            />
                            <button
                                className={styles.saveToBankBtn}
                                onClick={handleSaveToBank}
                                disabled={!instruction.trim() || !bankTitle.trim()}
                            >
                                Lưu mẫu
                            </button>
                        </div>
                    </div>

                    <div className={styles.bankSection}>
                        <div className={styles.bankHeader} onClick={() => setShowBank(!showBank)} style={{ cursor: 'pointer' }}>
                            <h4>NGÂN HÀNG CHỈ DẪN ({instructionBank.length})</h4>
                            {showBank ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {showBank && (
                            <div className={styles.bankList}>
                                {instructionBank.length === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                        Chưa có mẫu nào được lưu.
                                    </p>
                                ) : (
                                    instructionBank.map((item) => (
                                        <div key={item.id} className={styles.bankItem} onClick={() => selectFromBank(item.content)}>
                                            <span className={styles.bankItemTitle}>{item.title}</span>
                                            <button
                                                className={styles.deleteBankItem}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromBank(item.id);
                                                    toast.success('Đã xóa khỏi ngân hàng');
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Hủy
                    </button>
                    <button className={styles.saveButton} onClick={handleSave}>
                        Áp dụng cho nhiệm vụ này
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AiSettingsButton = ({ onClick, hasInstruction }: { onClick: () => void; hasInstruction: boolean }) => (
    <button
        onClick={onClick}
        title="Tùy chỉnh yêu cầu AI cho nhiệm vụ này"
        style={{
            background: hasInstruction ? 'var(--primary-light)' : 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '4px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            color: hasInstruction ? 'var(--primary)' : 'var(--text-muted)'
        }}
    >
        <Sparkles size={14} color={hasInstruction ? 'var(--primary)' : 'currentColor'} />
        {hasInstruction ? 'Đã tùy chỉnh AI' : 'Tùy chỉnh AI'}
    </button>
);
