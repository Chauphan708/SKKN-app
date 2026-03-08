'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from "./page.module.css";

const AppShell = dynamic(
  () => import("@/components/layout/AppShell").then(mod => mod.AppShell),
  {
    ssr: false,
    loading: () => <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Đang nạp bộ khung ứng dụng...</div>
  }
);

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Đang khởi tạo hệ thống...</div>;
  }

  return (
    <main className={styles.container}>
      <AppShell />
    </main>
  );
}
