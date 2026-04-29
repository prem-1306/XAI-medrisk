import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, LayoutDashboard, ClipboardCheck } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import InputForm from './pages/InputForm';
import Analysis from './pages/Analysis';
import ExplainableAI from './pages/ExplainableAI';
import SplashScreen from './components/SplashScreen';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

function AppContent() {
  const location = useLocation();
  
  return (
    <div className="app-container">
      <header className="header">
        <Link to="/" className="brand">
          <Activity size={32} />
          <span>XAI-MedRisk</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" className="btn btn-outline" style={{ border: 'none' }}>
            <LayoutDashboard size={18} />
            Overview
          </Link>
          <Link to="/assess" className="btn btn-primary">
            <ClipboardCheck size={18} />
            Start Scan
          </Link>
        </nav>
      </header>
      
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/assess" element={<PageTransition><InputForm /></PageTransition>} />
            <Route path="/analysis" element={<PageTransition><Analysis /></PageTransition>} />
            <Route path="/explain" element={<PageTransition><ExplainableAI /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      
      <footer style={{ marginTop: '8rem', padding: '4rem 0', borderTop: '1px solid var(--outline-variant)', textAlign: 'center', opacity: 0.5 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--on-surface-variant)' }}>
          Powered by Ethereal AI • Clinical Intelligence Platform v3.1
        </p>
      </footer>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <AppContent key="content" />
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
