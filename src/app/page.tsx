'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from "./page.module.css";

// Ngăn chặn hoàn toàn SSR cho AppShell
const AppContent = dynamic(
  async () => {
    const { MainLayout } = await import("@/components/layout/MainLayout");
    const { WorkflowOrchestrator } = await import("@/components/layout/WorkflowOrchestrator");
    return function AppShell() {
      return (
        <MainLayout>
          <WorkflowOrchestrator />
        </MainLayout>
      );
    };
  },
  {
    ssr: false,
    loading: () => <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Đang nạp ứng dụng...</div>
  }
);

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Đang khởi tạo...</div>;
  }

  return (
    <main className={styles.container}>
      <AppContent />
    </main>
  );
}
