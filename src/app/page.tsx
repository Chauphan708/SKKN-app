'use client';
import dynamic from 'next/dynamic';
import styles from "./page.module.css";

// Ngăn chặn hoàn toàn SSR cho WorkflowOrchestrator để tránh lỗi render trên server
const WorkflowOrchestrator = dynamic(
  () => import("@/components/layout/WorkflowOrchestrator").then(mod => mod.WorkflowOrchestrator),
  { ssr: false }
);

export default function Home() {
  return (
    <div className={styles.container} style={{ alignItems: 'stretch', justifyContent: 'flex-start' }}>
      <WorkflowOrchestrator />
    </div>
  );
}
