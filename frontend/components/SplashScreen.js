"use client";
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #f7f9ff 0%, #e0e7ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        textAlign: 'center'
      }}
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0, 72, 141, 0.2)'
        }}
      >
        <Activity size={48} />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="gradient-text"
        style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 900 }}
      >
        XAI-MedRisk
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{ 
          color: 'var(--on-surface-variant)', 
          fontSize: '1.25rem', 
          marginBottom: '3rem',
          maxWidth: '400px'
        }}
      >
        Precision AI-Powered Health Risk Assessment & Explainable Diagnostics
      </motion.p>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        style={{ 
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{ 
          width: '40px', 
          height: '2px', 
          background: 'var(--primary)', 
          marginBottom: '2rem',
          opacity: 0.3
        }}></div>

        <p style={{ 
          fontSize: '0.7rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.4em', 
          color: 'var(--primary)', 
          fontWeight: 800, 
          marginBottom: '2rem'
        }}>
          Engineering & Medical Research
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.4rem 1.5rem',
          maxWidth: '320px'
        }}>
          {[
            'Shivam Gupta',
            'Priyanka Gupta',
            'Prathamesh Gupta',
            'Prem Gupta'
          ].map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 + (i * 0.1), duration: 0.6 }}
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: 'var(--on-surface-variant)',
                letterSpacing: '0.02em',
                opacity: 0.7
              }}
            >
              {name}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Loading Bar */}
      <div style={{ position: 'absolute', bottom: '4rem', width: '200px', height: '4px', background: 'rgba(0, 72, 141, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, ease: "linear" }}
          style={{ height: '100%', background: 'var(--primary)' }}
        />
      </div>
    </motion.div>
  );
}

export default SplashScreen;
