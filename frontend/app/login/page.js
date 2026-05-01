"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, Lock } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/");
  }, [session, router]);

  if (status === "loading") return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--background)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decorations */}
      <div style={{
        position: "absolute", top: "-20%", right: "-10%",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "var(--primary)", opacity: 0.04, filter: "blur(80px)"
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", left: "-10%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "var(--secondary)", opacity: 0.05, filter: "blur(80px)"
      }} />

      <div className="login-wrapper" style={{ 
        display: "flex", 
        width: "100%", 
        maxWidth: "1000px", 
        gap: "3rem", 
        alignItems: "center",
        flexDirection: "var(--login-flex, row)" // Use a variable we'll control in CSS
      }}>

        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="login-branding"
          style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            gap: "2rem",
            alignItems: "var(--login-align, flex-start)",
            textAlign: "var(--login-align, left)"
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              background: "linear-gradient(135deg, var(--primary), var(--primary-container))",
              display: "flex", alignItems: "center", justifyContent: "center", color: "white"
            }}>
              <Activity size={20} />
            </div>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, letterSpacing: "-0.02em" }}>XAI-MedRisk</div>
              <div style={{ fontSize: "0.65rem", color: "var(--on-surface-variant)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Clinical AI Platform</div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 className="gradient-text login-title" style={{ fontSize: "2.75rem", lineHeight: 1.1, marginBottom: "1rem", fontWeight: 900 }}>
              Intelligent<br />Health Analysis
            </h1>
            <p className="login-subtitle" style={{ fontSize: "1rem", color: "var(--on-surface-variant)", lineHeight: 1.6, maxWidth: "380px" }}>
              AI-powered diagnostic insights with explainable clinical risk prediction.
            </p>
          </div>

          {/* Feature Pills - Hide on small mobile to save space if needed, or keep for context */}
          <div className="hide-mobile" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { icon: <ShieldCheck size={16} />, text: "HIPAA-grade encrypted sessions" },
              { icon: <Zap size={16} />, text: "Gemini 2.5 Flash neural engine" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  fontSize: "0.85rem", fontWeight: 600, color: "var(--on-surface-variant)"
                }}
              >
                <div style={{ color: "var(--secondary)" }}>{f.icon}</div>
                {f.text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="card login-card"
          style={{
            width: "100%", maxWidth: "420px", padding: "2.5rem",
            display: "flex", flexDirection: "column", gap: "1.5rem",
            border: "1px solid rgba(194, 198, 212, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 72, 141, 0.1)"
          }}
        >
          {/* Card Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "var(--primary-container)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.25rem",
              color: "var(--primary)"
            }}>
              <Lock size={24} />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
              Secure Access
            </h2>
            <p style={{ color: "var(--on-surface-variant)", fontSize: "0.875rem" }}>
              Sign in to access your clinical dashboard
            </p>
          </div>

          <div style={{ height: "1px", background: "var(--outline-variant)", opacity: 0.3 }} />

          {/* Google Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="btn-google"
            style={{
              width: "100%", padding: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
              background: "var(--surface-container-low)",
              border: "1.5px solid var(--outline-variant)",
              borderRadius: "var(--radius-lg)",
              cursor: "pointer", fontSize: "1rem", fontWeight: 700,
              color: "var(--on-surface)", transition: "all 0.25s"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          <p style={{
            textAlign: "center", fontSize: "0.7rem",
            color: "var(--on-surface-variant)", opacity: 0.7, lineHeight: 1.5
          }}>
            For research & educational purposes only. Not a substitute for professional medical advice.
          </p>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
