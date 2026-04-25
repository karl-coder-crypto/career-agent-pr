import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGS = ['Hinglish', 'English', 'Hindi'];

function VoiceVisualizer({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '28px' }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          width: '3px', borderRadius: '3px', background: active ? '#6366f1' : 'rgba(99,102,241,0.3)',
          height: active ? `${8 + Math.random() * 20}px` : '6px',
          transition: 'height 0.1s ease',
          animation: active ? `voicePulse ${0.4 + i * 0.05}s ease-in-out infinite alternate` : 'none'
        }} />
      ))}
    </div>
  );
}

function ScoreBar({ label, value }) {
  const color = value >= 8 ? '#10b981' : value >= 6 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}/10</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value * 10}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ height: '100%', background: color, borderRadius: '3px' }} />
      </div>
    </div>
  );
}

function ScorecardPanel({ card, onClose }) {
  return (
    <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ position: 'fixed', top: 0, right: 0, width: '360px', height: '100vh', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(99,102,241,0.3)', padding: '30px 24px', zIndex: 1000, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, color: '#6366f1', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Answer Scorecard</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: card.overall >= 8 ? '#10b981' : card.overall >= 6 ? '#f59e0b' : '#ef4444' }}>{card.overall}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/10</span></div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Overall Score</div>
      </div>
      <ScoreBar label="Clarity" value={card.clarity} />
      <ScoreBar label="Technical Accuracy" value={card.technical_accuracy} />
      <ScoreBar label="Confidence" value={card.confidence} />
      <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ fontSize: '0.75rem', color: '#10b981', textTransform: 'uppercase', marginBottom: '6px' }}>💪 Strength</div>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>{card.strength}</p>
      </div>
      <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ fontSize: '0.75rem', color: '#ef4444', textTransform: 'uppercase', marginBottom: '6px' }}>🎯 Gap</div>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>{card.gap}</p>
      </div>
      <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', marginBottom: '6px' }}>⭐ Model Answer</div>
        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>{card.suggested_answer}</p>
      </div>
    </motion.div>
  );
}

function MockInterview({ API_URL }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lang, setLang] = useState('Hinglish');
  const [context, setContext] = useState('');
  const [contextLabel, setContextLabel] = useState('');
  const [scorecard, setScorecard] = useState(null);
  const [isScorecarding, setIsScorecarding] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [targetRole, setTargetRole] = useState('');
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const buildHistory = (msgs) => msgs.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));

  const sendToBackend = async (history, text) => {
    setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, chatHistory: buildHistory(history), historyLength: history.length, context: context + (targetRole ? ` Target Role: ${targetRole}. Preferred Language: ${lang}.` : '') })
      });
      const data = await res.json();
      if (res.ok) setMessages(prev => [...prev, { text: data.text || data.reply, sender: 'bot' }]);
    } catch (e) {
      setMessages(prev => [...prev, { text: 'Neural link interrupted. Check connection.', sender: 'bot' }]);
    }
    setIsTyping(false);
  };

  const startSession = () => {
    setShowSetup(false);
    sendToBackend([], '');
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const msg = { text: inputVal, sender: 'user' };
    const snapshot = [...messages];
    setMessages(prev => [...prev, msg]);
    setInputVal('');
    sendToBackend(snapshot, msg.text);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice API not supported.');
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang === 'Hindi' ? 'hi-IN' : 'en-US';
    rec.onstart = () => setIsRecording(true);
    rec.onresult = (e) => setInputVal(prev => prev + ' ' + e.results[0][0].transcript);
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setIsRecording(false); };

  const handleFileUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setContextLabel(f.name);
    setContext(`Uploaded file: ${f.name}. Simulated extraction: Senior Software Engineer with 3+ years experience. Skills: React, Node.js, Python, AWS, System Design. Applying for L4/L5 level role.`);
  };

  const requestScorecard = async () => {
    const lastBot = [...messages].reverse().find(m => m.sender === 'bot');
    const lastUser = [...messages].reverse().find(m => m.sender === 'user');
    if (!lastUser) return;
    setIsScorecarding(true);
    try {
      const res = await fetch(`${API_URL}/api/interview/scorecard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: lastBot?.text || '', answer: lastUser.text, context: context || 'General SWE interview' })
      });
      const data = await res.json();
      if (res.ok) setScorecard(data);
    } catch (e) { console.error(e); }
    setIsScorecarding(false);
  };

  const resetSession = () => { setMessages([]); setShowSetup(true); setScorecard(null); setContext(''); setContextLabel(''); setTargetRole(''); };

  if (showSetup) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '560px', background: 'rgba(15,15,15,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.8rem' }}>🎯</div>
            <h1 style={{ margin: '0 0 8px', fontSize: '1.6rem', fontWeight: 700 }}>Elite Recruiter Session</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Configure your interview with Aegis — Tier-1 MNC Hiring Panel</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Target Role / Company</label>
            <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Google L4 SWE, Amazon SDE-2, Meta Frontend..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Response Language</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {LANGS.map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${lang === l ? '#6366f1' : 'var(--border)'}`, background: lang === l ? 'rgba(99,102,241,0.2)' : 'transparent', color: lang === l ? '#6366f1' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: lang === l ? 700 : 400, transition: 'all 0.2s' }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Upload Context (Resume / JD) — Optional</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', border: `1px dashed ${contextLabel ? '#10b981' : 'rgba(99,102,241,0.4)'}`, borderRadius: '10px', cursor: 'pointer', color: contextLabel ? '#10b981' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '1.3rem' }}>{contextLabel ? '✅' : '📎'}</span>
              <span style={{ fontSize: '0.9rem' }}>{contextLabel || 'Upload Resume PDF, JD Image, or any Document'}</span>
              <input type="file" accept=".pdf,.doc,.docx,image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
          </div>

          <button onClick={startSession} className="action-btn neon-glow-btn" style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '12px' }}>
            🚀 Initialize Interview Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 20px 20px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Elite Recruiter — Aegis</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{targetRole ? `Session: ${targetRole}` : 'Tier-1 MNC Hiring Panel'} · {lang}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={requestScorecard} disabled={isScorecarding || messages.filter(m => m.sender === 'user').length === 0} className="action-btn" style={{ padding: '9px 18px', fontSize: '0.85rem', background: 'rgba(99,102,241,0.2)', border: '1px solid #6366f1' }}>
            {isScorecarding ? '⏳ Analyzing...' : '📊 Scorecard'}
          </button>
          <button onClick={resetSession} className="copy-btn" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>↺ Reset</button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, background: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '14px 18px', borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.sender === 'user' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${msg.sender === 'user' ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  fontSize: '0.95rem', lineHeight: 1.6
                }}>
                  {msg.sender === 'bot' && <div style={{ fontSize: '0.7rem', color: '#6366f1', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aegis · Hiring Panel</div>}
                  {msg.text.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</React.Fragment>)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '6px', padding: '14px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px 18px 18px 4px', width: 'fit-content' }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', animation: `bounce 1s infinite ${i * 0.2}s` }} />)}
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', alignItems: 'flex-end', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isRecording && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px' }}>
                <VoiceVisualizer active={isRecording} />
                <span style={{ fontSize: '0.78rem', color: '#6366f1' }}>Listening in {lang}...</span>
              </div>
            )}
            <textarea value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type your answer... (Shift+Enter for new line)" disabled={isTyping}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.95rem', resize: 'none', minHeight: '48px', maxHeight: '120px', boxSizing: 'border-box', fontFamily: 'inherit' }} rows={2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={isRecording ? stopVoice : startVoice} style={{ padding: '12px 14px', borderRadius: '10px', border: `1px solid ${isRecording ? '#ef4444' : '#6366f1'}`, background: isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)', cursor: 'pointer', fontSize: '1.1rem' }}>
              {isRecording ? '⏹️' : '🎤'}
            </button>
            <button onClick={handleSend} disabled={isTyping || !inputVal.trim()} className="action-btn neon-glow-btn" style={{ padding: '12px 20px', fontWeight: 700, borderRadius: '10px' }}>Send</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {scorecard && <ScorecardPanel card={scorecard} onClose={() => setScorecard(null)} />}
      </AnimatePresence>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes voicePulse { from { transform: scaleY(0.5); } to { transform: scaleY(1); } }
      `}</style>
    </div>
  );
}

export default MockInterview;
