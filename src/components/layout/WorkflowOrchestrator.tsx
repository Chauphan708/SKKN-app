'use client';

import React from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { Step1Research } from '@/features/step1-research/Step1Research';
import { Step2Structure } from '@/features/step2-structure/Step2Structure';
import { Step3Content } from '@/features/step3-4-content/Step3Content';
import { Step4Content } from '@/features/step4-analysis/Step4Content';
import { Step5Appendix } from '@/features/step5-appendix/Step5Appendix';
import { Step6Export } from '@/features/step6-export/Step6Export';
import { Card } from '../ui/Card';

export const WorkflowOrchestrator = () => {
    const { currentView } = useWorkflowStore();

    // Route map
    switch (currentView) {
        case 'generator':
        case 'step1': // Default start point
            return <Step1Research />;

        case 'step2':
            return <Step2Structure />;

        case 'step3':
            return <Step3Content />;

        case 'step4':
            return <Step4Content />;

        case 'step5':
            return <Step5Appendix />;

        case 'step6':
            return <Step6Export />;

        default:
            return (
                <Card style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>Đang tải...</h2>
                </Card>
            );
    }
};
