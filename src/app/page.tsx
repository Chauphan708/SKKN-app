'use client';
import dynamic from 'next/dynamic';
import styles from "./page.module.css";

// Ngăn chặn hoàn toàn SSR cho MainLayout và WorkflowOrchestrator
const AppShell = dynamic(
  async () => {
    const { MainLayout } = await import("@/components/layout/MainLayout");
    const { WorkflowOrchestrator } = await import("@/components/layout/WorkflowOrchestrator");
    return function AppShell({ children }: { children?: React.ReactNode }) {
      return (
        <MainLayout>
          <WorkflowOrchestrator />
        </MainLayout>
      );
    };
  },
  { ssr: false }
);

export default function Home() {
  return (
    <div className={styles.container} style={{ alignItems: 'stretch', justifyContent: 'flex-start' }}>
      <AppShell />
    </div>
  );
}
