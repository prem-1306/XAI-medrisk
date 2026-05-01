// Build trigger: fresh relative paths
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, saveToHistory } from '../../lib/api';
import { ShieldCheck, Cpu, Scan, AlertCircle } from 'lucide-react';
import BodyVisualizer from '../../components/BodyVisualizer';

export default function Analysis() {
  const router = useRouter();
  const [taskId, setTaskId] = useState(null);
  
  const [statusText, setStatusText] = useState('Initializing Secure Pipeline...');
  const [error, setError] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [earlyResult, setEarlyResult] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem('taskId');
      if (!id) {
        router.push('/');
      } else {
        setTaskId(id);
      }
    }
  }, [router]);

  useEffect(() => {
    if (!taskId) return;

    const pulseInterval = setInterval(() => setPulse(p => !p), 1000);

    let pollCount = 0;
    const maxPolls = 60;

    const pollTask = setInterval(async () => {
      try {
        pollCount++;
        if (pollCount > maxPolls) {
          clearInterval(pollTask);
          setError('Analysis timeout. Our servers are heavily loaded.');
          return;
        }

        const response = await apiClient.get(`/tasks/${taskId}`);
        const data = response.data;

        if (data.result?.structured_features) {
          setEarlyResult(data.result);
        }

        if (data.status === 'processing' || data.status === 'pending') {
          if (pollCount < 5) setStatusText('AI analyzing your body...');
          else if (pollCount < 10) setStatusText('Extracting clinical markers with Gemini AI...');
          else if (pollCount < 15) setStatusText('Correlating symptoms with medical patterns...');
          else setStatusText('Synthesizing explainable results...');
        }

        if (data.status === 'completed') {
          clearInterval(pollTask);
          setStatusText('Analysis Complete. Generating Report...');
          // Persist result to local history for dashboard
          saveToHistory(data.result);
          
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('current_result', JSON.stringify(data.result));
          }
          
          setTimeout(() => {
            router.push('/explain');
          }, 1500);
        } else if (data.status === 'failed') {
          clearInterval(pollTask);
          setError(data.result?.error || 'The AI pipeline encountered an error. Please try a different description.');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1500);

    return () => {
      clearInterval(pollTask);
      clearInterval(pulseInterval);
    };
  }, [taskId, router]);

  const bodyLocations = earlyResult?.structured_features?.body_locations || [];

  if (error) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '6rem 2rem', borderTop: '4px solid var(--error)' }}>
        <AlertCircle size={48} style={{ color: 'var(--error)', margin: '0 auto 2rem' }} />
        <h2 className="mb-4" style={{ color: 'var(--error)' }}>Analysis Interrupted</h2>
        <p className="mb-8 text-muted" style={{ maxWidth: '400px', margin: '0 auto 2.5rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => router.push('/assess')}>
          Restart Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="analysis-grid">
        
        <div className="card text-center" style={{ padding: '4rem 3rem', height: '100%', position: 'relative', overflow: 'hidden' }}>
          {/* Animated Background Decor */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--primary)', opacity: 0.03, borderRadius: '50%' }}></div>
          
          <div className="analysis-loader">
            <div className="wave-circle"></div>
            <div className="wave-circle"></div>
            <div className="wave-circle"></div>
            <div className="loader-inner">
              <Scan size={32} className={pulse ? 'animate-pulse' : ''} />
            </div>
          </div>
          
          <h1 className="mb-4 gradient-text" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>Scanning <br/>Biometrics</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2.5rem 0', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontWeight: '600' }}>
               <ShieldCheck size={18} style={{ color: 'var(--secondary)' }} />
               Secure Clinical Cloud
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontWeight: '600' }}>
               <Cpu size={18} style={{ color: 'var(--primary)' }} />
               Neural Processing Active
             </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={statusText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ minHeight: '1.5em', fontSize: '1.125rem', fontWeight: '700', color: 'var(--primary)' }}
            >
              {statusText}
            </motion.p>
          </AnimatePresence>
          
          <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--secondary)' }}>XAI CONSOLE</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--on-surface-variant)', opacity: 0.8, lineHeight: '1.6' }}>
              &gt; Handshake established with Gemini v3.1...<br/>
              &gt; {bodyLocations.length > 0 ? `Targeting anatomical markers: ${bodyLocations.join(', ')}` : 'Waiting for biometric mapping...'}
            </div>
          </div>
        </div>

        <div className="analysis-visualizer-container" style={{ position: 'relative' }}>
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="card" 
             style={{ padding: '0', background: 'transparent', border: 'none', marginBottom: 0 }}
           >
              <BodyVisualizer 
                label={bodyLocations.length > 0 ? "Mapping Identified Areas" : "Neural Scan in Progress"} 
                highlightedParts={bodyLocations} 
                showScan={true}
                gender={earlyResult?.structured_features?.gender}
              />
           </motion.div>
        </div>

      </div>
    </div>
  );
}
