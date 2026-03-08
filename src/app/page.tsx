'use client';
import styles from "./page.module.css";
import { WorkflowOrchestrator } from "@/components/layout/WorkflowOrchestrator";

export default function Home() {
  return (
    <div className={styles.container} style={{ alignItems: 'stretch', justifyContent: 'flex-start' }}>
      <WorkflowOrchestrator />
    </div>
  );
}
