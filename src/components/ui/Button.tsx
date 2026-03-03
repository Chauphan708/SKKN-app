import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, isLoading, children, disabled, ...props }, ref) => {
        const rootClass = [
            styles.button,
            styles[variant],
            styles[`size-${size}`],
            fullWidth ? styles.fullWidth : '',
            isLoading ? styles.loading : '',
            className,
        ].filter(Boolean).join(' ');

        return (
            <button ref={ref} className={rootClass} disabled={disabled || isLoading} {...props}>
                {isLoading && <span className={styles.spinner} />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
