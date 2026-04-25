import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const logMessages = [
  "[AUTH] Handshake Verified.",
  "[SCAN] Checking 402 Job Nodes...",
  "[SYS] Neural Load Optimal.",
  "[NET] Synchronizing Profiles...",
  "[AI] Model Parameters Updated.",
  "[SEC] Protocols Enforced.",
  "[DB] Indexing Resumes...",
  "[CORE] Subroutines Active."
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [uptime, setUptime] = useState(0);
  const [load, setLoad] = useState(12);

  const modules = [
    { title: 'JARVIS Consultant', path: '/consultant', desc: 'AI-powered guidance', size: 'tall' },
    { title: 'Networking Hub', path: '/networking-hub', desc: 'Automated outreach', size: 'wide' },
    { title: 'DSA Sniper', path: '/dsa-sniper', desc: 'Targeted prep', size: 'normal' },
    { title: 'Mock Interview', path: '/mock-interview', desc: 'Simulated interviews', size: 'normal' },
    { title: 'Live Opportunities', path: '/opportunities', desc: 'Real-time scanner', size: 'wide' },
    { title: 'Skill Architect', path: '/skill-architect', desc: 'Learning paths', size: 'normal' }
  ];

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogs(prev => {
        const newLog = {
          id: Date.now(),
          text: logMessages[Math.floor(Math.random() * logMessages.length)]
        };
        const nextLogs = [newLog, ...prev];
        if (nextLogs.length > 8) nextLogs.pop();
        return nextLogs;
      });
    }, 4000);

    const uptimeInterval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);

    const loadInterval = setInterval(() => {
      setLoad(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(5, Math.min(95, prev + change));
      });
    }, 2000);

    return () => {
      clearInterval(logInterval);
      clearInterval(uptimeInterval);
      clearInterval(loadInterval);
    };
  }, []);

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="os-helix-rails">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="os-helix-line" />
        ))}
      </div>
      
      <div className="os-hub-container">
        <div className="os-panel">
          <h2 className="os-text-main" style={{ fontSize: '1.2rem', marginBottom: '24px', letterSpacing: '2px', textTransform: 'uppercase' }}>System Vitals</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="os-text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Neural Load</span>
              <span className="os-accent" style={{ fontWeight: 'bold' }}>{load}%</span>
            </div>
            <div className="os-progress-track">
              <div className="os-progress-fill" style={{ width: `${load}%` }} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <span className="os-text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>System Uptime</span>
            <span className="os-text-main" style={{ fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '2px' }}>{formatUptime(uptime)}</span>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <span className="os-text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Security Protocol</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="os-accent">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="os-text-main" style={{ fontWeight: '600' }}>Active & Enforced</span>
            </div>
          </div>

          <div className="os-radar-container">
            <div className="os-radar-sweep" />
            <svg width="100%" height="100%" viewBox="0 0 150 150" style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
              <circle cx="75" cy="75" r="30" fill="none" stroke="currentColor" strokeWidth="1" className="os-accent" />
              <circle cx="75" cy="75" r="60" fill="none" stroke="currentColor" strokeWidth="1" className="os-accent" />
              <line x1="75" y1="0" x2="75" y2="150" stroke="currentColor" strokeWidth="1" className="os-accent" />
              <line x1="0" y1="75" x2="150" y2="75" stroke="currentColor" strokeWidth="1" className="os-accent" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="os-orb-container">
            <div className="os-orb-ring-2" />
            <div className="os-orb-ring-1" />
            <div className="os-orb-core">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="os-accent" style={{ background: 'transparent' }}>
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="14" x2="23" y2="14" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="14" x2="4" y2="14" />
              </svg>
            </div>
          </div>

          <div className="os-bento-grid">
            {modules.map((m, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                className="os-bento-card"
                onClick={() => navigate(m.path)}
                style={{
                  gridColumn: m.size === 'wide' ? 'span 2' : 'span 1',
                  gridRow: m.size === 'tall' ? 'span 2' : 'span 1'
                }}
              >
                <h3 className="os-text-main" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{m.title}</h3>
                <p className="os-text-muted" style={{ fontSize: '0.9rem', fontWeight: '500' }}>{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="os-panel">
          <h2 className="os-text-main" style={{ fontSize: '1.2rem', marginBottom: '24px', letterSpacing: '2px', textTransform: 'uppercase' }}>Neural Telemetry</h2>
          <div className="os-log-stream">
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                  className="os-log-message"
                >
                  <span className="os-text-muted" style={{ marginRight: '8px' }}>[{new Date(log.id).toLocaleTimeString([], { hour12: false })}]</span>
                  <span className="os-text-main">{log.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
