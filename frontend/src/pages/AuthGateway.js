import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function AuthGateway() {
  const [isLogin, setIsLogin] = useState(true);
  const [usePhone, setUsePhone] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.error) {
      setError(location.state.error);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const [otpMode, setOtpMode] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneTrigger = async (e) => {
    e.preventDefault();
    setError('');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phone)) return setError('Supply absolute E.164 formatted telecom mapping (e.g., +919876543210).');
    
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
      
      if (isLogin) {
        await login(formData.phone, 'phone-bypass', data.token);
      } else {
        await signup(formData.name, 'phone@simulated.local', formData.phone, 'phone-bypass', data.token);
      }
      navigate('/dsa-sniper');
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
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) throw new Error('Identity Parameter required.');
        await signup(formData.name, formData.email, formData.phone, formData.password);
      }
      navigate('/skill-architect');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    hidden: { opacity: 0, x: -20 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <div className="layout-col page-fade-in opportunities-page auth-page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '50px' }}>
      <div className="glass auth-card">
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
           <h1 style={{ color: 'var(--accent-secondary)', textShadow: '0 0 10px rgba(117, 219, 255, 0.4)' }}>
             {isLogin ? 'Gateway Access' : 'Initialize Identity'}
           </h1>
           <p style={{ color: 'var(--text-muted)' }}>Authenticate natively to enable Cloud Firestore sync nodes.</p>
        </div>

        {error && <div className="auth-error glass">{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          <button className={`nav-link ${!usePhone ? 'active' : ''}`} style={{ flex: 1, textAlign: 'center', background:'transparent', border: !usePhone ? '1px solid var(--accent-secondary)' : 'none' }} onClick={() => { setUsePhone(false); setOtpMode(false); }}>
             Email Auth
          </button>
          <button className={`nav-link ${usePhone ? 'active' : ''}`} style={{ flex: 1, textAlign: 'center', background:'transparent', border: usePhone ? '1px solid var(--accent-secondary)' : 'none' }} onClick={() => { setUsePhone(true); setOtpMode(false); }}>
             Phone OTP
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!usePhone && (
            <motion.form key="emailForm" variants={variants} initial="hidden" animate="enter" exit="exit" onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {!isLogin && (
                <input type="text" name="name" placeholder="Full Identity Array (Name)" className="glass-input" value={formData.name} onChange={handleChange} required />
              )}
              <input type="email" name="email" placeholder="Communication Node (Email)" className="glass-input" value={formData.email} onChange={handleChange} required />
              <input type="password" name="password" placeholder="Cryptographic Key (Password)" className="glass-input" value={formData.password} onChange={handleChange} required />
              <button type="submit" className="action-btn neon-glow-btn" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? 'Authenticating...' : isLogin ? 'Execute Login' : 'Construct Identity'}
              </button>
            </motion.form>
          )}

          {usePhone && !otpMode && (
             <motion.form key="phoneForm" variants={variants} initial="hidden" animate="enter" exit="exit" onSubmit={handlePhoneTrigger} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!isLogin && (
                  <input type="text" name="name" placeholder="Full Identity Array (Name)" className="glass-input" value={formData.name} onChange={handleChange} required />
                )}
                <input type="tel" name="phone" placeholder="Telecom Array (e.g. +91XXXXXXXXXX)" className="glass-input" value={formData.phone} onChange={handleChange} required />
                <button type="submit" className="action-btn" style={{ background: 'var(--success-neon)', color: '#000', marginTop: '10px', fontWeight: 'bold' }} disabled={loading}>
                   {loading ? 'Transmitting Sequence...' : 'Trigger Cloud OTP'}
                </button>
             </motion.form>
          )}

          {usePhone && otpMode && (
             <motion.form key="otpForm" variants={variants} initial="hidden" animate="enter" exit="exit" onSubmit={handleOtpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--success-neon)' }}>Sequence transmitted. Check terminal securely.</div>
                <input type="text" placeholder="6-Digit OTP" className="glass-input" value={otpInput} onChange={e => setOtpInput(e.target.value)} required />
                <button type="submit" className="action-btn neon-glow-btn" disabled={loading} style={{ marginTop: '10px' }}>
                   {loading ? 'Verifying Neural Lock...' : 'Confirm Identity'}
                </button>
             </motion.form>
          )}
        </AnimatePresence>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'No active cloud matrix? ' : 'Already mapped within the vault? '}
          </span>
          <span onClick={() => { setIsLogin(!isLogin); setError(''); setOtpMode(false); }} style={{ color: 'var(--accent-secondary)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
             {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AuthGateway;
