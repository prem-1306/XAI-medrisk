"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Activity, ArrowLeft, Download, Info, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import BodyVisualizer from '../../components/BodyVisualizer';

export default function ExplainableAI() {
  const router = useRouter();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('current_result');
      if (stored) {
        setResult(JSON.parse(stored));
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '6rem 2rem' }}>
        <AlertCircle size={48} style={{ color: 'var(--error)', margin: '0 auto 2rem' }} />
        <h2>Data Synchronicity Lost</h2>
        <p className="mb-8 text-muted">We couldn't retrieve the session data. Please start a new scan.</p>
        <button className="btn btn-primary" onClick={() => router.push('/assess')}>
          Restart Assessment
        </button>
      </div>
    );
  }

  const prediction = result.prediction || result;
  const shapData = prediction.shap_values || {};
  const riskScore = prediction.risk_score || 0;
  const bodyLocations = prediction.structured_features?.body_locations || [];
  
  const getRiskColor = (score) => {
    if (score > 0.7) return '#ba1a1a';
    if (score > 0.3) return '#7b3200';
    return '#006b5f';
  };

  const shapEntries = Object.entries(shapData)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn btn-outline" style={{ border: 'none', paddingLeft: 0 }} onClick={() => router.push('/')}>
          <ArrowLeft size={18} />
          <span>Back to Overview</span>
        </button>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <Download size={18} />
            <span>Export PDF</span>
          </button>
          <div className="btn" style={{ background: 'var(--secondary-container)', color: 'var(--secondary)', cursor: 'default', padding: '0.5rem 1rem' }}>
            <CheckCircle2 size={16} />
            <span>Verified Report</span>
          </div>
        </div>
      </div>

      <div className="explain-grid">
        
        {/* Left Column: AI Clinical Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-glow clinical-report-container"
          >
            <div className="clinical-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--outline-variant)' }}>
              <div>
                <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                  {prediction.structured_features?.name || 'Patient Report'}
                </h1>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
                  <span>Age: <strong style={{color: 'var(--on-surface)'}}>{prediction.structured_features?.age || 'N/A'}</strong></span>
                  <span>Gender: <strong style={{color: 'var(--on-surface)'}}>{prediction.structured_features?.gender || 'N/A'}</strong></span>
                  <span>ID: <strong style={{color: 'var(--on-surface)'}}>#{result.id?.substring(0,8) || 'XAI-492'}</strong></span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  RISK PROBABILITY
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: getRiskColor(riskScore) }}>
                  {(riskScore * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Vitals Summary Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="vital-mini-card">
                <label>BMI</label>
                <span>{prediction.structured_features?.bmi || 'N/A'}</span>
              </div>
              <div className="vital-mini-card">
                <label>Blood Pressure</label>
                <span>{prediction.structured_features?.systolic ? `${prediction.structured_features.systolic}/${prediction.structured_features.diastolic}` : 'N/A'}</span>
              </div>
              <div className="vital-mini-card">
                <label>Pulse Pressure</label>
                <span>{prediction.structured_features?.pulse_pressure || 'N/A'} <small>mmHg</small></span>
              </div>
            </div>

            <div className="clinical-explanation-box" style={{ padding: '1.5rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', borderLeft: `6px solid ${getRiskColor(riskScore)}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: getRiskColor(riskScore), fontWeight: '800', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
                <Activity size={18} />
                PROFESSIONAL ASSESSMENT
              </div>
              <div className="markdown-report" style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--on-surface)' }}>
                <ReactMarkdown>{prediction.explanation || prediction.human_explanation}</ReactMarkdown>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={20} className="text-primary" />
              Explainable AI (XAI) Breakdown
            </h3>
            <div className="shap-container">
              {shapEntries.slice(0, 5).map(([feature, impact], idx) => {
                const percentage = Math.min(Math.abs(impact) * 200, 100);
                return (
                  <div key={feature} className="shap-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '700' }}>
                      <span style={{ textTransform: 'capitalize' }}>{feature.replace(/_/g, ' ')}</span>
                      <span style={{ color: impact > 0 ? 'var(--error)' : 'var(--secondary)' }}>
                        {impact > 0 ? '+' : ''}{(impact * 100).toFixed(1)}% Impact
                      </span>
                    </div>
                    <div className="bar-container">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                        className={`bar-fill ${impact > 0 ? 'positive' : 'negative'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
              <Info size={16} />
              <span>SHAP values quantify how each symptom contributed to the final risk score. Red bars indicate symptoms that increased risk.</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Visual Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card explain-visualizer-container" 
            style={{ padding: '2rem', background: 'var(--surface-container-lowest)', position: 'relative' }}
          >
            <BodyVisualizer 
              label="Neural Mapping Result" 
              highlightedParts={bodyLocations} 
              showScan={false} 
              gender={prediction.structured_features?.gender}
            />
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
               <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                 Confidence Score
               </div>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                 <ShieldCheck size={20} style={{ color: 'var(--secondary)' }} />
                 <span style={{ fontSize: '1.25rem', fontWeight: '900' }}>{(prediction.confidence_score * 100).toFixed(1)}%</span>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', color: 'white' }}
          >
            <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Medical Roadmap</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                "Schedule a follow-up consultation with a specialist.",
                "Monitor core vitals every 6 hours for next 48 hours.",
                "Review the detailed XAI breakdown with your clinician."
              ].map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', fontSize: '0.9rem', opacity: 0.9 }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900', fontSize: '0.75rem' }}>
                    {i+1}
                  </div>
                  {step}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
