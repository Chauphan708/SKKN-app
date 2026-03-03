'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
                        <AlertTriangle size={48} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Đã có lỗi xảy ra</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Hệ thống gặp sự cố không mong muốn trong quá trình xử lý phần này.
                            Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ.
                        </p>
                        {this.state.error && (
                            <div style={{
                                background: 'var(--background)',
                                padding: '1rem',
                                borderRadius: '8px',
                                textAlign: 'left',
                                fontSize: '0.875rem',
                                color: 'var(--error)',
                                marginBottom: '1.5rem',
                                overflowX: 'auto'
                            }}>
                                <code>{this.state.error.message}</code>
                            </div>
                        )}
                        <Button onClick={() => window.location.reload()}>
                            <RefreshCcw size={16} />
                            <span>Tải lại trang</span>
                        </Button>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
