import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function DSASniper({ API_URL }) {
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem('dsa-names');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const topics = [
    'Arrays', 'Strings', 'Hash Table', 'Two Pointers', 'Linked List', 
    'Stack', 'Queue', 'Sliding Window', 'Backtracking', 'Trees', 
    'Tries', 'Heaps', 'Dynamic Programming', 'Graphs', 'Greedy', 
    'Math', 'Bit Manipulation'
  ];

  const mncs = [
    'Google', 'Amazon', 'Microsoft', 'Netflix', 'Meta', 
    'Adobe', 'Uber', 'Goldman Sachs', 'Atlassian', 'TCS'
  ];

  const [topic, setTopic] = useState(topics[0]);
  const [company, setCompany] = useState(mncs[0]);
  const [problemCount, setProblemCount] = useState(5);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('dsa-names', JSON.stringify(completed));
  }, [completed]);

  const toggleProblem = (title) => {
    setCompleted(prev => 
      prev.includes(title) ? prev.filter(pName => pName !== title) : [...prev, title]
    );
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/ai/fetch-dsa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, company, count: problemCount })
      });
      if (response.status === 401) {
        const errData = await response.json();
        setError(errData.error || "API Key Missing");
        setProblems([]);
        return;
      }
      const data = await response.json();
      setProblems(Array.isArray(data) ? data : []);
    } catch (err) {
      setProblems([]);
      setError("Network Offline");
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (problemName) => {
    setLoadingExplain(true);
    setExplanation({ title: problemName, text: "Generating neural intuition matrices..." });
    try {
      const response = await fetch(`${API_URL}/api/explain-dsa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemName })
      });
      const data = await response.json();
      setExplanation({ title: problemName, text: data.reply });
    } catch (err) {
      setExplanation({ title: problemName, text: "Explanation offline." });
    } finally {
      setLoadingExplain(false);
    }
  };

  const generateLink = (type, prob) => {
    if (type === 'solve' && prob.leetcode_link) {
      return prob.leetcode_link;
    }
    const encoded = encodeURIComponent(prob.title || 'Two Sum');
    if (type === 'solve') return `https://leetcode.com/problemset/all/?search=${encoded}`;
    if (type === 'discuss') return `https://www.youtube.com/results?search_query=${encoded}+leetcode+solution`;
    return '#';
  };

  return (
    <div className="layout-col page-fade-in opportunities-page">
      <div className="header-box">
        <h1 style={{ fontFamily: '"Space Grotesk", sans-serif' }}>DSA Sniper Dashboard</h1>
        <p>Unlimited Web-Indexed Architecture Execution Algorithm Tracker.</p>
      </div>

      <div className="progress-container glass sniper-stats-card" style={{ padding: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Lifetime Algorithms Mastered</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success-neon, #00ff88)', textShadow: '0 0 20px var(--success-neon, #00ff88)' }}>
            {completed.length}
          </div>
        </div>
      </div>

      <div className="glass filter-container" style={{ padding: '20px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
         <div className="input-group-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select value={topic} onChange={e => setTopic(e.target.value)} className="glass-dropdown" style={{ flex: '1', minWidth: '200px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', fontSize: '1rem', outline: 'none' }}>
            {topics.map(t => <option key={t} value={t} style={{background: 'var(--bg)'}}>{t}</option>)}
          </select>
          <select value={company} onChange={e => setCompany(e.target.value)} className="glass-dropdown" style={{ flex: '1', minWidth: '200px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', fontSize: '1rem', outline: 'none' }}>
            {mncs.map(c => <option key={c} value={c} style={{background: 'var(--bg)'}}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 5px' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Number of Problems: <span style={{ color: 'var(--accent-primary)' }}>{problemCount}</span></label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={problemCount} 
            onChange={e => setProblemCount(Number(e.target.value))} 
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
          />
        </div>
        <button onClick={handleSearch} className="action-btn neon-glow-btn" disabled={loading} style={{ alignSelf: 'flex-end', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {loading ? <><span style={{ display: 'inline-block', animation: 'spinPoly 2s linear infinite' }}>⚙️</span> Fetching JSON Matrices...</> : 'Deploy Sniper Search'}
        </button>
      </div>

      <div className="dsa-grid" style={{ minHeight: '200px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {error ? (
             <motion.div 
               key="error"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               style={{ textAlign: 'center', width: '100%', padding: '30px' }}
             >
               <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--accent-secondary)', marginBottom: '15px' }}>{error}</h3>
               <button className="action-btn" onClick={handleSearch} style={{ background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', padding: '10px 20px', fontSize: '0.9rem' }}>Override & Retry</button>
             </motion.div>
          ) : problems.length === 0 && !loading ? (
             <motion.div 
               key="empty"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               style={{ textAlign: 'center', width: '100%', padding: '30px' }}
             >
               <p style={{ opacity: 0.8, marginBottom: '20px', fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                 Target Not Found - Re-scanning...
               </p>
               <button className="action-btn" onClick={handleSearch} style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '10px 20px', fontSize: '0.9rem' }}>Retry Search</button>
             </motion.div>
          ) : problems.length > 0 ? (
            <motion.div 
               key="results"
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
               className="glass dsa-card" style={{ padding: '20px', marginBottom: '20px' }}
            >
              <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text-primary)', marginBottom: '20px', fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>Sniper Results</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <AnimatePresence>
                  {problems.map((prob, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                      className="dsa-problem-row glass" 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', flexWrap: 'wrap', gap: '20px', border: '1px solid var(--border)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', flex: '1', minWidth: '250px' }}>
                        <input 
                          type="checkbox" 
                          checked={completed.includes(prob.title)} 
                          onChange={() => toggleProblem(prob.title)} 
                          className="dsa-checkbox"
                          style={{ accentColor: 'var(--accent-primary)', width: '22px', height: '22px', marginTop: '4px', cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: '"Inter", sans-serif', gap: '6px' }}>
                          <span style={{ fontSize: '1.15rem', color: completed.includes(prob.title) ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: completed.includes(prob.title) ? 'line-through' : 'none', fontWeight: '600' }}>
                            {prob.title}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: prob.difficulty === 'Easy' ? '#00ff88' : prob.difficulty === 'Medium' ? 'var(--accent-primary)' : 'var(--accent-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {prob.difficulty} <span style={{ color: 'var(--text-secondary)', margin: '0 5px' }}>•</span> {prob.topic}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            {prob.company_context}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button className="power-btn" style={{ padding: '10px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: '500' }} onClick={() => window.open(generateLink('discuss', prob), '_blank')}>📑 Discuss</button>
                        <button className="power-btn" style={{ padding: '10px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: '500' }} onClick={() => handleExplain(prob.title)}>💡 AI Approach</button>
                        <button className="power-btn solve" style={{ padding: '10px 15px', background: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00FFFF', color: '#00FFFF', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', textShadow: '0 0 8px rgba(0,255,255,0.4)', transition: 'all 0.3s ease', boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }} onClick={() => window.open(generateLink('solve', prob), '_blank')}>🚀 Solve on LeetCode</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,8,0.6)', backdropFilter: 'blur(8px)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '16px', border: '1px solid var(--accent-primary)' }}>
               <p className="processing-text" style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '1px' }}>Scanning Aegis Databases...</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {explanation && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="explanation-modal-overlay" 
            onClick={() => !loadingExplain && setExplanation(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="explanation-modal glass" 
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', padding: '30px', border: '1px solid var(--accent-primary)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
               <h3 style={{ borderBottom: '1px solid rgba(0, 210, 255, 0.3)', paddingBottom: '15px', marginBottom: '20px', fontFamily: '"Space Grotesk", sans-serif', color: 'var(--accent-primary)', fontSize: '1.4rem' }}>{explanation.title}</h3>
               <div className="explanation-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--text-primary)', fontFamily: '"Inter", sans-serif', fontSize: '0.95rem' }}>
                  {explanation.text}
               </div>
               <button className="action-btn" onClick={() => setExplanation(null)} style={{ marginTop: '25px', width: '100%', padding: '14px', background: 'var(--accent-primary)', color: '#000', fontWeight: 'bold' }} disabled={loadingExplain}>
                 DISMISS
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DSASniper;
