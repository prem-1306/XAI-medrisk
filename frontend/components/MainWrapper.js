"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, LayoutDashboard, ClipboardCheck, LogOut, User } from "lucide-react";
import Link from "next/link";
import SplashScreen from "./SplashScreen";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function MainWrapper({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Auth guard
  useEffect(() => {
    if (status === "loading") return;
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (!session && !isPublic) {
      router.push("/login");
    }
  }, [session, status, pathname, router]);

  if (showSplash) return <SplashScreen />;

  // Show loading while auth is being checked
  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div className="analysis-loader">
          <div className="wave-circle"></div>
          <div className="wave-circle"></div>
          <div className="loader-inner">
            <Activity size={24} />
          </div>
        </div>
      </div>
    );
  }

  // Show login page without nav
  if (!session && PUBLIC_ROUTES.includes(pathname)) {
    return <main style={{ minHeight: "100vh" }}>{children}</main>;
  }

  // Not logged in and not on public route - redirecting
  if (!session) return null;

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-brand">
            <Activity size={22} style={{ color: "var(--primary)" }} />
            <span>XAI-MedRisk</span>
          </Link>

          <div className="nav-links">
            <Link href="/" className="nav-link">
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            <Link href="/assess" className="nav-link">
              <ClipboardCheck size={16} />
              <span>New Assessment</span>
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--primary)" }}
                />
              )}
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--on-surface-variant)" }}>
                {session.user?.name?.split(" ")[0]}
              </span>
            </div>
            <button
              onClick={() => import("next-auth/react").then(m => m.signOut({ callbackUrl: "/login" }))}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: "transparent", border: "1px solid rgba(194, 198, 212, 0.3)",
                borderRadius: "var(--radius-md)", padding: "0.4rem 0.75rem",
                color: "var(--on-surface-variant)", cursor: "pointer", fontSize: "0.8rem",
                fontWeight: "600", transition: "all 0.2s"
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
