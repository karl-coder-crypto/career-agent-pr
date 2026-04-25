import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOPICS = ['Arrays','Strings','Hash Table','Two Pointers','Sliding Window','Linked List','Stack','Queue','Backtracking','Trees','Tries','Heaps','Dynamic Programming','Graphs','Greedy','Bit Manipulation'];
const MNCS = ['Google','Amazon','Microsoft','Meta','Netflix','Adobe','Uber','Goldman Sachs','Atlassian','TCS'];
const DIFF_COLOR = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
const VERDICT_COLOR = { Optimal: '#10b981', Suboptimal: '#f59e0b', Incorrect: '#ef4444' };

const CHEAT_SHEETS = {
  'Sliding Window': ['Expand right pointer until condition met, shrink left to maintain validity', 'Track window state with a HashMap or counter variable', 'Max/Min window problems use two-pointer + condition check'],
  'Two Pointers': ['Start pointers at opposite ends for sorted arrays', 'Move the pointer that helps satisfy the target condition', 'Works for palindrome checks, pair sums, and merge operations'],
  'Hash Table': ['O(1) lookup by trading space for time', 'Store complement/seen values for single-pass solutions', 'Use for frequency counting, grouping, and index mapping'],
  'Dynamic Programming': ['Define state clearly before coding transitions', 'Bottom-up tabulation avoids recursion stack overflow', 'Optimize space by keeping only relevant previous rows/cols'],
  'Graphs': ['BFS for shortest path in unweighted graphs, DFS for exploration', 'Union-Find for cycle detection and connected components', 'Topological sort for dependency ordering (Kahn\'s or DFS)'],
  'Trees': ['Inorder traversal = sorted order for BSTs', 'Use recursion with return values to avoid global state', 'Level-order BFS for problems requiring row-by-row processing'],
  'Heaps': ['Min-heap for k-th largest, max-heap for k-th smallest', 'Maintain heap of size k for streaming top-k problems', 'Two heaps pattern for median of stream'],
  'Backtracking': ['Prune early by checking constraints before recursing', 'Pass index + current state to avoid reusing elements', 'State must be reversible — undo choices after recursive call'],
};

function ScanOverlay() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        {[1,2,3].map(i => <div key={i} style={{ position: 'absolute', inset: 0, border: '2px solid rgba(99,102,241,0.6)', borderRadius: '50%', animation: `scanPulse ${1.2 * i}s ease-out infinite`, animationDelay: `${0.25 * i}s` }} />)}
        <div style={{ position: 'absolute', inset: '38%', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 24px #6366f1' }} />
      </div>
      <p style={{ color: '#6366f1', fontWeight: 700, letterSpacing: '3px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Scanning Interview Intelligence...</p>
      <style>{`@keyframes scanPulse { 0% { transform:scale(.4); opacity:1; } 100% { transform:scale(2.8); opacity:0; } }`}</style>
    </div>
  );
}

function ProbabilityBar({ score }) {
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : '#6366f1';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ height: '100%', background: color, borderRadius: '2px' }} />
      </div>
      <span style={{ fontSize: '0.72rem', color, fontWeight: 700, minWidth: '32px' }}>{score}%</span>
    </div>
  );
}

function CheatSheet({ topic }) {
  const tips = CHEAT_SHEETS[topic];
  if (!tips) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '12px 14px', marginTop: '12px' }}>
      <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>⚡ Sniper Cheat Sheet — {topic}</div>
      {tips.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '5px', lineHeight: 1.5 }}>
          <span style={{ color: '#6366f1', flexShrink: 0 }}>→</span><span>{t}</span>
        </div>
      ))}
    </motion.div>
  );
}

function AuditPanel({ API_URL, activeProblem }) {
  const [code, setCode] = useState('');
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const runAudit = useCallback(async (c) => {
    if (!c.trim() || c.trim().length < 20) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/dsa/audit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: c, problem: activeProblem })
      });
      const d = await res.json();
      if (res.ok) setAudit(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [API_URL, activeProblem]);

  const handleChange = (val) => {
    setCode(val);
    setAudit(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runAudit(val), 1800);
  };

  return (
    <div style={{ background: 'rgba(12,12,12,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>🔬 Sniper Auditor</div>
          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{activeProblem ? `Analyzing: ${activeProblem}` : 'Paste your solution — auto-analysis in 1.8s'}</p>
        </div>
        {loading && <div style={{ width: '18px', height: '18px', border: '2px solid rgba(99,102,241,0.3)', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
      </div>

      <textarea value={code} onChange={e => handleChange(e.target.value)} placeholder={`// Paste your ${activeProblem || 'solution'} here...\n// Auto-audit triggers after 1.8s of inactivity`}
        style={{ width: '100%', minHeight: '180px', fontFamily: '"JetBrains Mono","Fira Code","Consolas",monospace', fontSize: '0.85rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(99,102,241,0.25)', color: '#e2e8f0', borderRadius: '10px', padding: '14px', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }} />

      <AnimatePresence>
        {audit && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[['Time', audit.time_complexity, '#6366f1'], ['Space', audit.space_complexity, '#a855f7'], ['Verdict', audit.verdict, VERDICT_COLOR[audit.verdict]]].map(([l, v, c]) => (
                <div key={l} style={{ background: `${c}12`, border: `1px solid ${c}30`, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '3px' }}>{l}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: c, fontFamily: '"JetBrains Mono",monospace' }}>{v}</div>
                </div>
              ))}
            </div>

            {!audit.is_optimal && audit.optimization_hint && (
              <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '6px' }}>💡 Optimization Vector</div>
                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6 }}>{audit.optimization_hint}</p>
              </div>
            )}

            {audit.edge_cases?.length > 0 && (
              <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px' }}>⚠️ Hidden Edge Cases</div>
                {audit.edge_cases.map((ec, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span style={{ color: '#ef4444', flexShrink: 0 }}>#{i + 1}</span><span style={{ color: 'var(--text-secondary)' }}>{ec}</span>
                  </div>
                ))}
              </div>
            )}

            {audit.mastery_unlocked && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '10px', textAlign: 'center', color: '#10b981', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 0 20px rgba(16,185,129,0.15)' }}>
                🏆 MASTERY UNLOCKED — Optimal Solution Confirmed
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function DSASniper({ API_URL }) {
  const [mastered, setMastered] = useState(() => { try { return JSON.parse(localStorage.getItem('dsa-mastered') || '[]'); } catch { return []; } });
  const [topic, setTopic] = useState(TOPICS[0]);
  const [company, setCompany] = useState(MNCS[0]);
  const [count, setCount] = useState(5);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [activeProblem, setActiveProblem] = useState('');
  const [showCheat, setShowCheat] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { localStorage.setItem('dsa-mastered', JSON.stringify(mastered)); }, [mastered]);

  const toggleMastered = (title) => setMastered(p => p.includes(title) ? p.filter(t => t !== title) : [...p, title]);

  const handleSearch = async () => {
    setLoading(true); setError(null); setProblems([]);
    try {
      const res = await fetch(`${API_URL}/api/ai/fetch-dsa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, company, count }) });
      if (res.status === 401) { const d = await res.json(); setError(d.error); return; }
      const d = await res.json();
      setProblems(Array.isArray(d) ? d : []);
    } catch (e) { setError('Network Offline'); }
    setLoading(false);
  };

  const handleExplain = async (title) => {
    setExplainLoading(true);
    setExplanation({ title, text: 'Generating neural intuition...' });
    try {
      const res = await fetch(`${API_URL}/api/explain-dsa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemName: title }) });
      const d = await res.json();
      setExplanation({ title, text: d.reply || 'Analysis complete.' });
    } catch (e) { setExplanation({ title, text: 'Explanation offline.' }); }
    setExplainLoading(false);
  };

  const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 20px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {loading && <ScanOverlay />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>DSA Sniper</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>2026 Pattern Intelligence · Big-O Auditor · Mastery Engine</p>
        </div>
        <motion.div animate={{ boxShadow: ['0 0 10px rgba(16,185,129,0.3)', '0 0 25px rgba(16,185,129,0.6)', '0 0 10px rgba(16,185,129,0.3)'] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '12px', padding: '10px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Mastered</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>{mastered.length}</div>
        </motion.div>
      </div>

      <div style={{ background: 'rgba(12,12,12,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', marginBottom: '20px', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Topic</label>
            <select value={topic} onChange={e => setTopic(e.target.value)} style={inp}>
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Target Company</label>
            <select value={company} onChange={e => setCompany(e.target.value)} style={inp}>
              {MNCS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            Problem Count: <span style={{ color: '#6366f1', fontWeight: 700 }}>{count}</span>
          </label>
          <input type="range" min="3" max="20" value={count} onChange={e => setCount(Number(e.target.value))} style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleSearch} disabled={loading} className="action-btn neon-glow-btn" style={{ padding: '11px 28px', fontWeight: 700 }}>
            🎯 Deploy Sniper Search
          </button>
          <button onClick={() => setShowCheat(p => !p)} style={{ padding: '11px 16px', background: showCheat ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${showCheat ? '#6366f1' : 'var(--border)'}`, borderRadius: '10px', color: showCheat ? '#6366f1' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>
            📋 Cheat Sheet
          </button>
        </div>
        <AnimatePresence>{showCheat && <CheatSheet topic={topic} />}</AnimatePresence>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: problems.length > 0 ? '1fr 420px' : '1fr', gap: '20px', flex: 1, minHeight: 0 }}>
        <div style={{ overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
                <p style={{ color: '#ef4444', marginBottom: '12px' }}>{error}</p>
                <button onClick={handleSearch} className="action-btn" style={{ fontSize: '0.85rem' }}>Retry</button>
              </motion.div>
            )}
            {!error && problems.length === 0 && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%', flexDirection: 'column', gap: '16px', opacity: 0.35 }}>
                <div style={{ fontSize: '4rem' }}>🎯</div>
                <p>Select topic + company and deploy the sniper search</p>
              </motion.div>
            )}
            {problems.length > 0 && (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {problems.map((prob, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                    style={{ background: 'rgba(12,12,12,0.65)', backdropFilter: 'blur(16px)', border: `1px solid ${activeProblem === prob.title ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '14px', padding: '18px', cursor: 'pointer' }}
                    onClick={() => setActiveProblem(activeProblem === prob.title ? '' : prob.title)}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={mastered.includes(prob.title)} onChange={e => { e.stopPropagation(); toggleMastered(prob.title); }}
                        style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#10b981', flexShrink: 0, cursor: 'pointer' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', textDecoration: mastered.includes(prob.title) ? 'line-through' : 'none', opacity: mastered.includes(prob.title) ? 0.5 : 1 }}>{prob.title}</span>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: `${DIFF_COLOR[prob.difficulty]}18`, color: DIFF_COLOR[prob.difficulty], border: `1px solid ${DIFF_COLOR[prob.difficulty]}30`, fontWeight: 700 }}>{prob.difficulty}</span>
                          {prob.pattern && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>{prob.pattern}</span>}
                        </div>
                        {prob.company_context && <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{prob.company_context}</p>}
                        {prob.probability !== undefined && (
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>2026 Probability — {company}</div>
                            <ProbabilityBar score={prob.probability} />
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={e => { e.stopPropagation(); window.open(prob.leetcode_link || `https://leetcode.com/problems/${prob.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/`, '_blank'); }} className="action-btn neon-glow-btn" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>🚀 Solve</button>
                          <button onClick={e => { e.stopPropagation(); handleExplain(prob.title); }} className="copy-btn" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>💡 AI Approach</button>
                          <button onClick={e => { e.stopPropagation(); window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(prob.title + ' leetcode')}`, '_blank'); }} className="copy-btn" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>📑 Discuss</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {problems.length > 0 && (
          <div style={{ overflowY: 'auto' }}>
            <AuditPanel API_URL={API_URL} activeProblem={activeProblem} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {explanation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => !explainLoading && setExplanation(null)}>
            <motion.div initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '16px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#6366f1', fontSize: '1.1rem' }}>{explanation.title}</h3>
                <button onClick={() => setExplanation(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{explanation.text}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DSASniper;
