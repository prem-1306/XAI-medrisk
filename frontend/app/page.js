"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Clock, Activity, Calendar, Zap, Shield, ChevronRight } from 'lucide-react';
import { getHistory } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const getRiskLabel = (score) => {
    if (score > 0.7) return { label: 'High Alert', class: 'risk-high' };
    if (score > 0.3) return { label: 'Observational', class: 'risk-medium' };
    return { label: 'Optimal', class: 'risk-low' };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 100 }
    }
  };

  const handleNavigateToExplain = (record) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current_result', JSON.stringify(record));
      router.push('/explain');
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '1rem' }}
            className="gradient-text"
          >
            Clinical <br />Intelligence.
          </motion.h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--on-surface-variant)', maxWidth: '400px' }}>
            Your personal AI health companion, monitoring vitals and predicting risks with precision.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary"
          style={{ padding: '1.2rem 2.5rem', borderRadius: 'var(--radius-xl)' }}
          onClick={() => router.push('/assess')}
        >
          <Plus size={24} />
          <span>New Diagnostic Scan</span>
        </motion.button>
      </div>

      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '5rem' }}>
        {[
          { icon: <Activity />, label: 'Analysis History', value: history.length, color: 'var(--primary)' },
          { icon: <Shield />, label: 'Encryption Status', value: 'Active', color: 'var(--secondary)' },
          { icon: <Zap />, label: 'Intelligence Model', value: 'v3.1 Flash', color: 'var(--tertiary)' }
        ].map((stat, i) => (
          <motion.div key={i} variants={cardVariants} className="card" style={{ padding: '2rem', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: stat.color + '15', color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <h2 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Calendar size={24} className="text-primary" />
        Recent Assessments
      </h2>

      {history.length === 0 ? (
        <motion.div variants={cardVariants} className="card text-center" style={{ padding: '6rem 2rem', background: 'var(--surface-container-low)', border: 'none' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <Clock size={40} style={{ opacity: 0.2 }} />
          </div>
          <h3 style={{ marginBottom: '1rem' }}>No Data Synchronized</h3>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem', maxWidth: '350px', margin: '0 auto 2.5rem' }}>
            Your clinical history is empty. Start a new diagnostic scan to generate your first health report.
          </p>
          <button className="btn btn-outline" onClick={() => router.push('/assess')}>
            Begin Assessment
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {history.map((record, idx) => {
            const risk = getRiskLabel(record.risk_score);
            const date = new Date(record.date);
            
            return (
              <motion.div 
                key={idx} 
                variants={cardVariants}
                whileHover={{ x: 10, backgroundColor: 'var(--surface-container-low)' }}
                className="card assessment-card" 
                style={{ cursor: 'pointer', padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }} 
                onClick={() => handleNavigateToExplain(record)}
              >
                <div className="record-info" style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                  <div style={{ textAlign: 'center', paddingRight: '3rem', borderRight: '1px solid var(--outline-variant)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900' }}>{date.getDate()}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Report #{idx + 1042}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Shield size={14} /> {(record.confidence_score * 100).toFixed(1)}% Confidence
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="status-area" style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>RISK FACTOR</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{(record.risk_score * 100).toFixed(0)}%</div>
                  </div>
                  <div className={`risk-badge ${risk.class}`} style={{ minWidth: '140px', textAlign: 'center' }}>
                    {risk.label}
                  </div>
                  <ChevronRight size={20} style={{ opacity: 0.3 }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
