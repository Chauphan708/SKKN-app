import React from 'react';
import styles from './Input.module.css'; // Reusing Input styles for consistency

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
    options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, fullWidth = true, options, ...props }, ref) => {
        return (
            <div className={[styles.wrapper, fullWidth ? styles.fullWidth : ''].join(' ')}>
                {label && <label className={styles.label}>{label}</label>}
                <select
                    ref={ref}
                    className={[
                        styles.input,
                        error ? styles.hasError : '',
                        className
                    ].filter(Boolean).join(' ')}
                    {...props}
                >
                    <option value="" disabled>-- Chọn một tuỳ chọn --</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);
Select.displayName = 'Select';
