'use client';

import React from 'react';
import { MainLayout } from './MainLayout';
import { WorkflowOrchestrator } from './WorkflowOrchestrator';

export const AppShell = () => {
    return (
        <MainLayout>
            <WorkflowOrchestrator />
        </MainLayout>
    );
};
