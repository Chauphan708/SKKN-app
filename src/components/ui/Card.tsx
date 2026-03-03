import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={[styles.card, className].filter(Boolean).join(' ')}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';
