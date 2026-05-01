"use client";
import { useState, useEffect } from "react";
import { Activity, LayoutDashboard, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";

export default function MainWrapper({ children }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" />
      ) : (
        <div className="app-container" key="content">
          <header className="header">
            <Link href="/" className="brand">
              <Activity size={32} />
              <span>XAI-MedRisk</span>
            </Link>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/" className="btn btn-outline" style={{ border: 'none' }}>
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </Link>
              <Link href="/assess" className="btn btn-primary">
                <ClipboardCheck size={18} />
                <span>Start Scan</span>
              </Link>
            </nav>
          </header>
          
          <main>
            {children}
          </main>
          
          <footer style={{ marginTop: '8rem', padding: '4rem 0', borderTop: '1px solid var(--outline-variant)', textAlign: 'center', opacity: 0.5 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--on-surface-variant)' }}>
              Powered by Ethereal AI • Clinical Intelligence Platform v3.1
            </p>
          </footer>
        </div>
      )}
    </AnimatePresence>
  );
}
