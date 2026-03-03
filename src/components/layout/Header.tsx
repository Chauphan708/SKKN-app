import React from 'react';
import styles from './Header.module.css';
import { Button } from '../ui/Button';
import { User, Wallet } from 'lucide-react';

export const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <div className={styles.pageInfo}>
                    <h1 className={styles.pageTitle}>1. Nghiên cứu & Sáng tạo Đề tài</h1>
                    <p className={styles.pageDescription}>Mô tả vấn đề {'->'} Chọn hướng giải quyết {'->'} AI gợi ý 20 tên đề tài.</p>
                </div>
            </div>

            <div className={styles.right}>
                <Button variant="outline" className={styles.creditBtn}>
                    <Wallet size={16} />
                    <span>Kho SKKN</span>
                </Button>
                <Button variant="outline" className={styles.creditBtn}>
                    <Wallet size={16} />
                    <span>Credit: 200</span>
                </Button>

                <div className={styles.userProfile}>
                    <div className={styles.avatar}>
                        <User size={16} />
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>Giáo viên A</span>
                        <span className={styles.userRole}>Nâng cấp Pro</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
