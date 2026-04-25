import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

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
  { 
    title: 'DSA Sniper', path: '/dsa-sniper', desc: 'Targeted algorithm preparation', size: 'square',
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
  { 
    title: 'Live Opportunities', path: '/opportunities', desc: 'Real-time job market scanner', size: 'wide',
    svg: (
      <svg viewBox="0 0 100 100" width="80" height="80" style={{ position: 'absolute', right: '10%', bottom: '0', opacity: 0.15, pointerEvents: 'none' }} className="opp-particles">
        <circle cx="20" cy="80" r="3" fill="currentColor" className="particle p1" />
        <circle cx="50" cy="90" r="4" fill="currentColor" className="particle p2" />
        <circle cx="80" cy="70" r="2" fill="currentColor" className="particle p3" />
        <circle cx="30" cy="60" r="3" fill="currentColor" className="particle p4" />
        <circle cx="70" cy="50" r="5" fill="currentColor" className="particle p5" />
      </svg>
    )
  },
  { 
    title: 'Networking Hub', path: '/networking-hub', desc: 'Automated outreach & smart connections', size: 'square',
    svg: (
      <svg viewBox="0 0 100 100" width="80" height="80" style={{ position: 'absolute', right: '10%', bottom: '10%', opacity: 0.15, pointerEvents: 'none' }} className="net-orbit">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="10" fill="currentColor" />
        <circle cx="10" cy="50" r="5" fill="currentColor" className="orbit-moon m1" />
        <circle cx="90" cy="50" r="4" fill="currentColor" className="orbit-moon m2" />
        <circle cx="50" cy="10" r="6" fill="currentColor" className="orbit-moon m3" />
      </svg>
    )
  },
  { title: 'Resume Editor', path: '/resume-builder', desc: 'Professional document architect', size: 'standard' },
  { title: 'Skill Architect', path: '/skill-architect', desc: 'Dynamic learning paths & skill trees', size: 'standard' }
];

const AuthPanel = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [usePhone, setUsePhone] = useState(false);
  const { login, signup, currentUser, logout } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [otpMode, setOtpMode] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  if (currentUser) {
    return (
      <div className="auth-panel-floating glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff' }}>
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{currentUser.name || 'User'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Neural Link Active</div>
          </div>
        </div>
        <button onClick={logout} className="power-btn" style={{ marginTop: '15px', width: '100%' }}>Disconnect</button>
      </div>
    );
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhoneTrigger = async (e) => {
    e.preventDefault();
    setError('');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phone)) return setError('Supply E.164 formatted telecom mapping.');
    setLoading(true);
    try {
      const resp = await fetch('https://career-agent-pro.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "SMS API execution error.");
      setOtpMode(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('https://career-agent-pro.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otpInput })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Verification API error.");
      
      if (isLogin) await login(formData.phone, 'phone-bypass', data.token);
      else await signup(formData.name, 'phone@simulated.local', formData.phone, 'phone-bypass', data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(formData.email, formData.password);
      else {
        if (!formData.name.trim()) throw new Error('Identity Parameter required.');
        await signup(formData.name, formData.email, formData.phone, formData.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-panel-floating glass">
      <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--accent-secondary)' }}>{isLogin ? 'Gateway Access' : 'Initialize Identity'}</h3>
      
      {error && <div className="auth-error" style={{ fontSize: '0.8rem', padding: '8px' }}>{error}</div>}
      
      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
        <button className={`auth-tab ${!usePhone ? 'active' : ''}`} onClick={() => { setUsePhone(false); setOtpMode(false); }}>Email</button>
        <button className={`auth-tab ${usePhone ? 'active' : ''}`} onClick={() => { setUsePhone(true); setOtpMode(false); }}>Phone</button>
      </div>

      <AnimatePresence mode="wait">
        {!usePhone && (
          <motion.form key="emailForm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!isLogin && <input type="text" name="name" placeholder="Full Name" className="glass-input-small" value={formData.name} onChange={handleChange} required />}
            <input type="email" name="email" placeholder="Email Node" className="glass-input-small" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Key" className="glass-input-small" value={formData.password} onChange={handleChange} required />
            <button type="submit" className="action-btn-small neon-glow-btn" disabled={loading}>
              {loading ? '...' : isLogin ? 'Login' : 'Signup'}
            </button>
          </motion.form>
        )}

        {usePhone && !otpMode && (
          <motion.form key="phoneForm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handlePhoneTrigger} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!isLogin && <input type="text" name="name" placeholder="Full Name" className="glass-input-small" value={formData.name} onChange={handleChange} required />}
            <input type="tel" name="phone" placeholder="Phone (+91...)" className="glass-input-small" value={formData.phone} onChange={handleChange} required />
            <button type="submit" className="action-btn-small" style={{ background: 'var(--success-neon)', color: '#000' }} disabled={loading}>
              {loading ? '...' : 'Send OTP'}
            </button>
          </motion.form>
        )}

        {usePhone && otpMode && (
          <motion.form key="otpForm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleOtpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--success-neon)', textAlign: 'center' }}>Sequence transmitted.</div>
            <input type="text" placeholder="6-Digit OTP" className="glass-input-small" value={otpInput} onChange={e => setOtpInput(e.target.value)} required />
            <button type="submit" className="action-btn-small neon-glow-btn" disabled={loading}>
              {loading ? '...' : 'Confirm'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      
      <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{isLogin ? 'New? ' : 'Mapped? '}</span>
        <span onClick={() => { setIsLogin(!isLogin); setError(''); setOtpMode(false); }} style={{ color: 'var(--accent-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
          {isLogin ? 'Sign Up' : 'Log In'}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="master-command-center">
      <AuthPanel />
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
