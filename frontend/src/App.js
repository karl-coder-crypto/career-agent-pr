import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AIConsultant from './pages/AIConsultant';
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
import './App.css';

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
        <Sidebar />

        <div className="main-content">
          <button className="theme-toggle" onClick={toggleTheme} style={{position: 'absolute', top: '25px', right: '40px'}}>
            {theme === 'dark' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>

          <Routes>
            <Route index element={<AIConsultant API_URL={API_URL} />} />
            <Route path="/consultant" element={<AIConsultant API_URL={API_URL} />} />
            <Route path="/auth" element={<AuthGateway />} />
            <Route path="/opportunities" element={<ProtectedRoute><LiveOpportunities API_URL={API_URL} /></ProtectedRoute>} />
            <Route path="/resume-checker" element={<ResumeChecker API_URL={API_URL} />} />
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

          {isChatOpen && (
            <div ref={chatRef} className="glass chat-window global-chat-popover" onMouseDown={(e) => e.stopPropagation()} style={{ background: 'rgba(0, 20, 50, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid #00FFFF', boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)', borderRadius: '16px' }}>
              <div className="close-btn" onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }} style={{ color: '#00FFFF', top: '15px', right: '20px' }}>&times;</div>
              <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid rgba(0, 255, 255, 0.3)', paddingBottom: '12px', color: '#00FFFF', fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.4rem', letterSpacing: '2px', textTransform: 'uppercase' }}>JARVIS</h4>
              <div className="guide-messages-container" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px 5px' }}>
                {guideMessages.map((msg, i) => (
                  <div key={i} className={`message-wrapper ${msg.sender}`} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div 
                      className={`message-bubble guide ${msg.sender}`} 
                      style={{ background: msg.sender === 'user' ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0,0,0,0.3)', border: msg.sender === 'user' ? '1px solid #00FFFF' : '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', padding: '12px 16px', borderRadius: '12px', maxWidth: '85%', fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.9rem', lineHeight: '1.5' }}
                    >
                      {msg.sender === 'bot' && msg.isNew ? (
                         <TypewriterText text={msg.text} formatFn={formatTextWithLinks} onDone={() => { msg.isNew = false; }} />
                      ) : (
                         <span dangerouslySetInnerHTML={formatTextWithLinks(msg.text)} />
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message-wrapper bot" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div className="message-bubble guide bot typing-indicator" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #00FFFF', color: '#00FFFF', padding: '12px 16px', borderRadius: '12px', fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="spinner" style={{ display: 'inline-block', animation: 'spinPoly 2s linear infinite' }}>⚙️</span> Processing...
                    </div>
                  </div>
                )}
                <div ref={guideEndRef} />
              </div>
              <div className="chat-input-area guide" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask JARVIS..."
                  disabled={isTyping}
                  style={{ flexGrow: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,255,0.4)', color: '#fff', padding: '12px', borderRadius: '8px', fontFamily: '"Space Grotesk", sans-serif' }}
                />
                <button onClick={handleChatSubmit} disabled={isTyping || !chatInput.trim()} className="action-btn" style={{ background: 'transparent', border: '1px solid #00FFFF', color: '#00FFFF', padding: '12px 18px', borderRadius: '8px', cursor: 'pointer', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold' }}>SEND</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;