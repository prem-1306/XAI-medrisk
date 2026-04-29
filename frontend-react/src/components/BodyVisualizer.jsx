import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BodyVisualizer = ({ highlightedParts = [], label = "AI Body Analysis", showScan = true, gender = "male" }) => {
  const safeHighlightedParts = Array.isArray(highlightedParts) ? highlightedParts : [];
  
  // Choose atlas based on gender
  const atlasSrc = gender?.toLowerCase() === 'female' ? '/body-atlas-female.png' : '/body-atlas.png';

  // Re-calibrated coordinates for a full-body muscular atlas
  const hotspots = [
    { id: 'head', name: 'Head', x: 50, y: 14, r: 5 },
    { id: 'neck', name: 'Neck', x: 50, y: 20, r: 3 },
    { id: 'chest', name: 'Chest', x: 50, y: 32, r: 8 },
    { id: 'abdomen', name: 'Abdomen', x: 50, y: 44, r: 7 },
    { id: 'pelvis', x: 50, y: 54, r: 6 },
    { id: 'arms', x: 28, y: 42, r: 6, multi: [{ x: 30, y: 42 }, { x: 70, y: 42 }] },
    { id: 'legs', x: 44, y: 75, r: 7, multi: [{ x: 44, y: 75 }, { x: 56, y: 75 }] },
    { id: 'back', x: 50, y: 38, r: 9 },
  ];

  return (
    <div className="body-visualizer-premium" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '620px', // Increased height for full body
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      background: 'var(--surface-container-low)', 
      borderRadius: '2rem', 
      padding: '2rem', 
      overflow: 'hidden',
      border: '1px solid rgba(194, 198, 212, 0.3)'
    }}>
      
      {/* Header Info */}
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '2rem', zIndex: 10 }}>
        <div style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.8 }}>
          Neural Atlas v4.0
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--on-surface)', marginTop: '0.5rem' }}>
          {label}
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* Muscular Atlas Background - Full Body View */}
        <img 
          src={atlasSrc} 
          alt="Muscular System" 
          style={{ height: '100%', width: '100%', objectFit: 'contain', opacity: 1, filter: 'contrast(1.05) brightness(1)' }}
        />

        {/* Interactive Hotspot Layer */}
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {hotspots.map(spot => {
            const isHighlighted = safeHighlightedParts.some(p => p.toLowerCase() === (spot.id || '').toLowerCase());
            if (!isHighlighted) return null;

            const renderSpot = (cx, cy, r, key) => (
              <g key={key}>
                {/* Red Outer Glow */}
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={r * 1.5}
                  fill="#ba1a1a"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: [0.1, 0.4, 0.1],
                    scale: [1, 1.4, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ filter: 'blur(12px)' }}
                />
                {/* Core Red Ball */}
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={r / 2.5}
                  fill="#ba1a1a"
                  stroke="white"
                  strokeWidth="0.4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(186, 26, 26, 0.9))' }}
                />
                {/* Pulsing Ring */}
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={r * 1.1}
                  fill="transparent"
                  stroke="#ba1a1a"
                  strokeWidth="0.2"
                  animate={{ scale: [1, 2.8], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </g>
            );

            if (spot.multi) {
              return spot.multi.map((m, i) => renderSpot(m.x, m.y, spot.r, `${spot.id}-${i}`));
            }
            return renderSpot(spot.x, spot.y, spot.r, spot.id);
          })}
        </svg>

        {/* Conditional Holographic Scan Line */}
        {showScan && (
          <motion.div 
            animate={{ top: ['5%', '95%', '5%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            style={{ 
              position: 'absolute', 
              left: '5%', 
              right: '5%', 
              height: '2px', 
              background: 'linear-gradient(90deg, transparent, #ba1a1a, transparent)',
              boxShadow: '0 0 25px #ba1a1a',
              zIndex: 5,
              opacity: 0.7
            }}
          />
        )}
      </div>

      {/* Detection Badge */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '1.5rem 0 0' }}>
        <AnimatePresence>
          {safeHighlightedParts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{ 
                background: 'rgba(186, 26, 26, 0.1)', 
                border: '1px solid rgba(186, 26, 26, 0.4)',
                color: '#ba1a1a', 
                padding: '0.75rem 2rem', 
                borderRadius: 'var(--radius-xl)', 
                fontSize: '0.8rem',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 8px 25px rgba(186, 26, 26, 0.1)'
              }}
            >
              <div style={{ width: '10px', height: '10px', background: '#ba1a1a', borderRadius: '50%', animation: 'pulse-red 1s infinite' }}></div>
              DETECTION ACTIVE: {safeHighlightedParts.join(' • ').toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-red {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default BodyVisualizer;
