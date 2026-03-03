import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, fullWidth = true, ...props }, ref) => {
        return (
            <div className={[styles.wrapper, fullWidth ? styles.fullWidth : ''].join(' ')}>
                {label && <label className={styles.label}>{label}</label>}
                <input
                    ref={ref}
                    className={[
                        styles.input,
                        error ? styles.hasError : '',
                        className
                    ].filter(Boolean).join(' ')}
                    {...props}
                />
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);
Input.displayName = 'Input';
