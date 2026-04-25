import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import AIConsultant from './pages/AIConsultant';
import SynapticFlow from './components/SynapticFlow';
import AscendingGrowth from './components/backgrounds/AscendingGrowth';
import HelixDNA from './components/backgrounds/HelixDNA';
import LiveOpportunities from './pages/LiveOpportunities';
import ResumeChecker from './pages/ResumeChecker';
import MockInterview from './pages/MockInterview';
import NetworkingHub from './pages/NetworkingHub';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGateway from './pages/AuthGateway';
import ResumeBuilder from './pages/ResumeBuilder';
import DSASniper from './pages/DSASniper';
import SkillArchitect from './pages/SkillArchitect';
import BentoDashboard from './components/Dashboard';
import './App.css';

const FluidBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';

      ctx.lineWidth = 1;
      
      const numLines = Math.floor(canvas.width / 100);
      for (let i = 0; i <= canvas.width; i += 100) {
        ctx.strokeStyle = isLightMode ? '#F1F5F9' : '#1A1A1A';
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      if (!isLightMode) {
        for (let i = 0; i < 5; i++) {
          const x = (canvas.width / 5) * i + 50 + Math.sin(time + i) * 30;
          const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
          gradient.addColorStop(0, 'rgba(51, 102, 255, 0)');
          gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
          gradient.addColorStop(1, 'rgba(51, 102, 255, 0)');
          
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else {
        for (let i = 0; i < 3; i++) {
          const x = (canvas.width / 3) * i + 100 + Math.sin(time + i) * 20;
          const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
          gradient.addColorStop(0, 'rgba(51, 102, 255, 0)');
          gradient.addColorStop(0.5, 'rgba(51, 102, 255, 0.15)');
          gradient.addColorStop(1, 'rgba(51, 102, 255, 0)');
          
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      time += 0.015;
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }} />;
};

const TypewriterText = ({ text, formatFn, onDone }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => setIndex(prev => prev + 1), 15);
      return () => clearTimeout(timer);
    } else if (onDone) {
      onDone();
    }
  }, [index, text, onDone]);
  
  return index < text.length ? (
      <span style={{ whiteSpace: 'pre-wrap' }}>{text.substring(0, index)}</span>
  ) : (
      <span dangerouslySetInnerHTML={formatFn(text)} />
  );
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [bootPhase, setBootPhase] = useState(0);
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 220, y: 80 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [guideMessages, setGuideMessages] = useState([{text: "Greetings. I am JARVIS, your advanced AI Assistant. How may I be of assistance today?", sender: "bot"}]);
  const [isTyping, setIsTyping] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const chatRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const guideEndRef = useRef(null);

  const bootLogs = [
    'v1.0.4 Booting...',
    'Connecting Neural Link...',
    'Fetching Job Nodes...',
    'JARVIS Protocol Online.'
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (bootPhase < bootLogs.length - 1) {
      const timer = setTimeout(() => setBootPhase(p => p + 1), 750);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsAppLoaded(true), 750);
      return () => clearTimeout(timer);
    }
  }, [bootPhase, bootLogs.length]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const API_URL = "https://career-agent-pro.onrender.com";

  const handleMouseDown = (e) => {
    if (e.target.closest('.chat-window') || e.target.closest('.close-btn')) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const formatTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+|\/[a-zA-Z0-9-/_]+)/g;
    return { __html: text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" style="color: var(--accent-primary); text-decoration: underline;">${url}</a>`) };
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const newMsg = { text: chatInput, sender: 'user' };
    setGuideMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/site-guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, ...JSON.parse(localStorage.getItem('mock-user') || '{}') })
      });
      const data = await response.json();
      if (response.ok) {
        setGuideMessages(prev => [...prev, { text: data.reply, sender: 'bot', isNew: true }]);
      }
    } catch (err) {
      setGuideMessages(prev => [...prev, { text: "Network error fetching JARVIS neural responses.", sender: 'bot', isNew: true }]);
    }
    setIsTyping(false);
  };

  useEffect(() => {
    if (isChatOpen) {
       guideEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [guideMessages, isChatOpen, isTyping]);

  useEffect(() => {
    const handleGlobalMove = (e) => {
      const xRot = (e.clientX / window.innerWidth) - 0.5;
      const yRot = (e.clientY / window.innerHeight) - 0.5;
      setRotation({ x: yRot * 60, y: xRot * 60 });
      setEyePos({ x: xRot * 15, y: yRot * 15 });
      document.documentElement.style.setProperty('--mouse-x', xRot);
      document.documentElement.style.setProperty('--mouse-y', yRot);

      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 180)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 180))
        });
      }
    };

    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [isDragging]);

  return (
    <AuthProvider>
    <BrowserRouter>
      <div className="grain-overlay"></div>
      <FluidBackground />
      {!isAppLoaded && (
        <div className="aegis-overlay">
          <div className="aegis-core">
            <svg width="120" height="120" viewBox="0 0 120 120" className="core-svg">
              <polygon points="60,10 110,60 60,110 10,60" fill="none" stroke="currentColor" strokeWidth="2" className="poly-one" />
              <polygon points="60,20 100,60 60,100 20,60" fill="none" stroke="currentColor" strokeWidth="2" className="poly-two" />
              <circle cx="60" cy="60" r="15" fill="currentColor" className="core-pulse" />
            </svg>
            <div className="aegis-log">{bootLogs[bootPhase]}</div>
          </div>
        </div>
      )}

      <div className={`App dashboard-container ${isAppLoaded ? 'fade-in-up' : 'hidden'}`}>
        <button className="theme-toggle" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--border)', fontSize: '14px', fontWeight: 'bold' }}>
          {theme === 'dark' ? '☀️ Zen Light' : '🌙 Zen Dark'}
        </button>
        <Sidebar />

        <div className="main-content">

          <Routes>
            <Route index element={<ProtectedRoute><BentoDashboard /></ProtectedRoute>} />
            <Route path="/consultant" element={<SynapticFlow><AIConsultant API_URL={API_URL} /></SynapticFlow>} />
            <Route path="/auth" element={<AuthGateway />} />
            <Route path="/opportunities" element={<ProtectedRoute><AscendingGrowth><LiveOpportunities API_URL={API_URL} /></AscendingGrowth></ProtectedRoute>} />
            <Route path="/resume-checker" element={<HelixDNA><ResumeChecker API_URL={API_URL} /></HelixDNA>} />
            <Route path="/resume-builder" element={<ResumeBuilder API_URL={API_URL} />} />
            <Route path="/skill-architect" element={<ProtectedRoute><SkillArchitect API_URL={API_URL} /></ProtectedRoute>} />
            <Route path="/dsa-sniper" element={<ProtectedRoute><DSASniper API_URL={API_URL} /></ProtectedRoute>} />
            <Route path="/mock-interview" element={<ProtectedRoute><MockInterview API_URL={API_URL} /></ProtectedRoute>} />
            <Route path="/networking-hub" element={<ProtectedRoute><NetworkingHub API_URL={API_URL} /></ProtectedRoute>} />
          </Routes>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="robot-entity"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            transform: `perspective(1000px) rotateY(${rotation.y}deg) rotateX(${-rotation.x}deg)`
          }}
        >
          {isHovered && !isChatOpen && !isDragging && (
            <div className="robot-hint">DRAG</div>
          )}
          <svg viewBox="0 0 200 200" onClick={() => !isDragging && setIsChatOpen(!isChatOpen)}>
            <defs>
              <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="grad-stop-1" />
                <stop offset="100%" className="grad-stop-2" />
              </linearGradient>
              <filter id="eyeGlow">
                <feGaussianBlur stdDeviation="5" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect x="50" y="60" width="100" height="110" rx="20" fill="url(#headGrad)" stroke="currentColor" className="bot-stroke" strokeWidth="3" />
            <circle cx={82 + eyePos.x} cy={107 + eyePos.y} r="8" fill="currentColor" className="bot-glow" filter="url(#eyeGlow)" />
            <circle cx={118 + eyePos.x} cy={107 + eyePos.y} r="8" fill="currentColor" className="bot-glow" filter="url(#eyeGlow)" />
          </svg>

          <AnimatePresence>
          {isChatOpen && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
               ref={chatRef} className="chat-window global-chat-popover" onMouseDown={(e) => e.stopPropagation()} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', width: '380px', height: '500px', display: 'flex', flexDirection: 'column', padding: '24px', boxShadow: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 10px 0', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexShrink: 0 }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.4rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600' }}>JARVIS</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => setFontSize(f => Math.max(14, f - 1))} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '8px', cursor: 'pointer', fontFamily: '"Space Grotesk", sans-serif', fontWeight: '600', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>A-</button>
                  <button onClick={() => setFontSize(f => Math.min(22, f + 1))} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '8px', cursor: 'pointer', fontFamily: '"Space Grotesk", sans-serif', fontWeight: '600', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>A+</button>
                  <div onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }} style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.6rem', lineHeight: '1', padding: '0 5px' }}>&times;</div>
                </div>
              </div>
              <div className="guide-messages-container scroll-cyan" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px 5px', scrollBehavior: 'smooth' }}>
                {guideMessages.map((msg, i) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`message-wrapper ${msg.sender}`} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div 
                      className={`message-bubble guide ${msg.sender}`} 
                      style={{ background: msg.sender === 'user' ? 'var(--input-bg)' : 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '16px 24px', borderRadius: '24px', maxWidth: '85%', fontFamily: '"Space Grotesk", sans-serif', fontSize: `${fontSize}px`, lineHeight: '1.6', fontWeight: '400', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', wordWrap: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {msg.sender === 'bot' && msg.isNew ? (
                         <TypewriterText text={msg.text} formatFn={formatTextWithLinks} onDone={() => { msg.isNew = false; }} />
                      ) : (
                         <span dangerouslySetInnerHTML={formatTextWithLinks(msg.text)} />
                      )}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message-wrapper bot" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div className="message-bubble guide bot typing-indicator" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '16px 24px', borderRadius: '24px', fontFamily: '"Space Grotesk", sans-serif', fontSize: `${fontSize}px`, fontWeight: '400', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                      <span className="spinner" style={{ display: 'inline-block', animation: 'spinPoly 2s linear infinite' }}>⚙️</span> Processing...
                    </div>
                  </motion.div>
                )}
                <div ref={guideEndRef} />
              </div>
              <div className="chat-input-area guide" style={{ display: 'flex', gap: '16px', marginTop: '16px', flexShrink: 0 }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask JARVIS..."
                  disabled={isTyping}
                  style={{ flexGrow: 1, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '16px 24px', borderRadius: '24px', fontFamily: '"Space Grotesk", sans-serif', fontSize: '1rem', fontWeight: '500', outline: 'none', transition: 'border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button onClick={handleChatSubmit} disabled={isTyping || !chatInput.trim()} className="action-btn" style={{ background: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', color: '#FFFFFF', padding: '16px 32px', borderRadius: '24px', cursor: 'pointer', fontFamily: '"Space Grotesk", sans-serif', fontWeight: '600', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>SEND</button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
