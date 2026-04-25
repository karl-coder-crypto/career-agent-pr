import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const modules = [
  { 
    title: 'JARVIS Consultant', path: '/consultant', desc: 'Your personal AI-powered career guide', size: 'wide',
    svg: (
      <svg viewBox="0 0 100 50" width="100%" height="80" style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.15, pointerEvents: 'none' }}>
        <path className="jarvis-wave" d="M0,25 C20,10 30,40 50,25 C70,10 80,40 100,25 L100,50 L0,50 Z" fill="currentColor" />
        <path className="jarvis-wave-2" d="M0,30 C20,50 40,10 60,30 C80,50 90,20 100,30 L100,50 L0,50 Z" fill="currentColor" opacity="0.5"/>
      </svg>
    )
  },
  { 
    title: 'ATS Scanner', path: '/resume-checker', desc: 'Deep resume analysis & ATS compatibility score', size: 'tall',
    svg: (
      <svg viewBox="0 0 50 100" width="80" height="100%" style={{ position: 'absolute', right: '5%', top: 0, opacity: 0.15, pointerEvents: 'none' }}>
        <path className="ats-dna" d="M10,10 Q40,30 10,50 T10,90 M40,10 Q10,30 40,50 T40,90" stroke="currentColor" fill="none" strokeWidth="3" strokeDasharray="5,5" />
        <line x1="15" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
        <line x1="25" y1="30" x2="25" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="15" y1="40" x2="35" y2="40" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
        <line x1="25" y1="70" x2="25" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="15" y1="80" x2="35" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      </svg>
    )
  },
  { title: 'Live Opportunities', path: '/opportunities', desc: 'Real-time job market scanner', size: 'normal' },
  { 
    title: 'DSA Sniper', path: '/dsa-sniper', desc: 'Targeted algorithm preparation', size: 'normal',
    svg: (
      <svg viewBox="0 0 100 100" width="80" height="80" style={{ position: 'absolute', right: '10%', bottom: '10%', opacity: 0.15, pointerEvents: 'none' }} className="dsa-crosshair">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="4" fill="currentColor" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1" />
      </svg>
    )
  },
  { title: 'Resume Editor', path: '/resume-builder', desc: 'Professional document architect', size: 'wide' },
  { title: 'Networking Hub', path: '/networking-hub', desc: 'Automated outreach & smart connections', size: 'tall' },
  { title: 'Skill Architect', path: '/skill-architect', desc: 'Dynamic learning paths & skill trees', size: 'wide' }
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="master-command-center">
      <div className="os-bento-grid-master">
        {modules.map((m, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`os-bento-card-master size-${m.size}`}
            onClick={() => navigate(m.path)}
          >
            {m.svg && m.svg}
            <div className="card-content-master">
              <h3 className="os-text-main">{m.title}</h3>
              <p className="os-text-muted">{m.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
