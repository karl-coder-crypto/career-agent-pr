import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIER_COLOR = { prerequisite: '#f59e0b', core: '#6366f1', advanced: '#10b981' };

function CircularProgress({ pct }) {
  const r = 28, c = 2 * Math.PI * r;
  return (
    <svg width="70" height="70" viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle cx="35" cy="35" r={r} fill="none" stroke={pct === 100 ? '#10b981' : '#6366f1'} strokeWidth="6"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round"
        transform="rotate(-90 35 35)" style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
      <text x="35" y="40" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">{Math.round(pct)}%</text>
    </svg>
  );
}

function NodeModal({ node, unlocked, onUnlock, onClose }) {
  const [picked, setPicked] = useState(null);
  const correct = picked === node.quiz?.answer;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(20px)', border: `1px solid ${TIER_COLOR[node.tier]}`, borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: TIER_COLOR[node.tier], textTransform: 'uppercase', letterSpacing: '1px' }}>{node.tier}</span>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem' }}>{node.label}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>{node.description}</p>
        {node.resources?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Resources</div>
            {node.resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '8px 12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: '#6366f1', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '6px' }}>
                🔗 {r.title}
              </a>
            ))}
          </div>
        )}
        {node.quiz && !unlocked && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '10px' }}>Quick Quiz — Unlock Next Node</div>
            <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>{node.quiz.question}</p>
            {node.quiz.options.map((opt, i) => (
              <button key={i} onClick={() => setPicked(i)}
                style={{ display: 'block', width: '100%', marginBottom: '6px', padding: '9px 14px', textAlign: 'left', background: picked === i ? (correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'rgba(255,255,255,0.04)', border: `1px solid ${picked === i ? (correct ? '#10b981' : '#ef4444') : 'var(--border)'}`, borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.88rem' }}>
                {opt}
              </button>
            ))}
            {picked !== null && correct && (
              <button onClick={onUnlock} className="action-btn neon-glow-btn" style={{ width: '100%', marginTop: '10px' }}>✅ Unlock Node</button>
            )}
            {picked !== null && !correct && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}>Incorrect. Try again!</p>}
          </div>
        )}
        {unlocked && <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', color: '#10b981', fontWeight: 700 }}>✅ Node Mastered</div>}
      </motion.div>
    </motion.div>
  );
}

function SkillTree({ nodes, unlocked, onNodeClick }) {
  const tiers = ['prerequisite', 'core', 'advanced'];
  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      {tiers.map(tier => {
        const tierNodes = nodes.filter(n => n.tier === tier);
        return (
          <div key={tier} style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '0.7rem', color: TIER_COLOR[tier], textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: TIER_COLOR[tier], opacity: 0.3 }} />
              {tier}
              <div style={{ flex: 1, height: '1px', background: TIER_COLOR[tier], opacity: 0.3 }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {tierNodes.map((node, i) => (
                <motion.div key={node.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, scale: 1.03 }} onClick={() => onNodeClick(node)}
                  style={{ padding: '14px 18px', background: unlocked[node.id] ? `rgba(${tier === 'prerequisite' ? '245,158,11' : tier === 'core' ? '99,102,241' : '16,185,129'},0.2)` : 'rgba(255,255,255,0.04)', border: `1px solid ${unlocked[node.id] ? TIER_COLOR[tier] : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', cursor: 'pointer', minWidth: '140px', maxWidth: '180px', textAlign: 'center', boxShadow: unlocked[node.id] ? `0 0 12px ${TIER_COLOR[tier]}40` : 'none', transition: 'box-shadow 0.3s' }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{unlocked[node.id] ? '✅' : tier === 'prerequisite' ? '📚' : tier === 'core' ? '⚙️' : '🚀'}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{node.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MarketPanel({ data }) {
  if (!data) return null;
  const score = data.demand_score || 7;
  return (
    <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
      <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>2026 Market Intelligence</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444' }}>{score}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/10</span></div>
        <div><div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Demand Score</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>In Tier-1 MNCs</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px', fontSize: '0.8rem' }}>🇮🇳 India<div style={{ color: '#10b981', fontWeight: 700, marginTop: '3px' }}>{data.avg_salary_india}</div></div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px', fontSize: '0.8rem' }}>🌍 Global<div style={{ color: '#6366f1', fontWeight: 700, marginTop: '3px' }}>{data.avg_salary_global}</div></div>
      </div>
      {data.top_companies && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{data.top_companies.join(' · ')}</div>}
      {data.trend_2026 && <div style={{ fontSize: '0.82rem', borderLeft: '2px solid #6366f1', paddingLeft: '10px', color: 'var(--text-secondary)' }}>{data.trend_2026}</div>}
    </div>
  );
}

function MilestonePanel({ skill, pct, API_URL }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [github, setGithub] = useState('');
  const fetch_ = async (gh) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/milestone-project`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skill, progress: Math.round(pct), githubUrl: gh || undefined }) });
      const d = await res.json();
      if (res.ok) setContent(d.content);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  return (
    <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
      <div style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>🏗️ Milestone Project ({Math.round(pct)}% complete)</div>
      {!content ? (
        <button onClick={() => fetch_()} disabled={loading} className="action-btn" style={{ width: '100%', fontSize: '0.85rem', padding: '10px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981' }}>
          {loading ? 'Generating...' : 'Generate Milestone Project'}
        </button>
      ) : (
        <>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>{content}</pre>
          <input value={github} onChange={e => setGithub(e.target.value)} placeholder="Paste GitHub URL for AI review..." style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box', marginBottom: '8px' }} />
          <button onClick={() => fetch_(github)} disabled={loading || !github} className="action-btn neon-glow-btn" style={{ width: '100%', fontSize: '0.85rem', padding: '9px' }}>{loading ? 'Reviewing...' : '🔍 AI Review GitHub'}</button>
        </>
      )}
    </div>
  );
}

function VaultTab({ vault, togglePhase, onRemove }) {
  const getProgress = (phases) => Object.values(phases).filter(Boolean).length / Object.values(phases).length * 100;
  const genCert = (skill) => {
    const hash = btoa(skill + Date.now()).slice(0, 12).toUpperCase();
    alert(`🏆 AEGIS VERIFIED CERTIFICATE\n\nSkill: ${skill}\nHash: ACV-${hash}\nIssued: ${new Date().toLocaleDateString()}\n\nThis certificate confirms mastery of ${skill} on the Aegis Core platform.`);
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', padding: '20px' }}>
      {Object.keys(vault).length === 0 ? (
        <p style={{ opacity: 0.5, gridColumn: '1/-1', textAlign: 'center', marginTop: '40px' }}>Your Mastery Vault is empty. Search a skill and add it.</p>
      ) : Object.keys(vault).map(skill => {
        const phases = vault[skill];
        const pct = getProgress(phases);
        return (
          <motion.div key={skill} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(15,15,15,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <CircularProgress pct={pct} />
              <div><h3 style={{ margin: 0, fontSize: '1.1rem' }}>{skill}</h3><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{Math.round(pct)}% Complete</div></div>
            </div>
            {Object.keys(phases).map(phase => (
              <label key={phase} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={phases[phase]} onChange={() => togglePhase(skill, phase)}
                  style={{ width: '16px', height: '16px', accentColor: '#6366f1' }} />
                <span style={{ fontSize: '0.9rem', textDecoration: phases[phase] ? 'line-through' : 'none', opacity: phases[phase] ? 0.5 : 1 }}>
                  {phase === 'prerequisites' ? '📚 Prerequisites' : phase === 'core' ? '⚙️ Core Concepts' : phase === 'advanced' ? '🚀 Advanced Topics' : '🏗️ Capstone Project'}
                </span>
              </label>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {pct === 100 && <button onClick={() => genCert(skill)} className="action-btn neon-glow-btn" style={{ flex: 1, fontSize: '0.8rem', padding: '9px' }}>🏆 Get Certificate</button>}
              <button onClick={() => onRemove(skill)} style={{ padding: '9px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function SkillArchitect({ API_URL }) {
  const [tab, setTab] = useState('discover');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [lang, setLang] = useState('English');
  const [cost, setCost] = useState('Free');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [unlocked, setUnlocked] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [vault, setVault] = useState(() => { try { return JSON.parse(localStorage.getItem('architect-vault') || '{}'); } catch { return {}; } });
  useEffect(() => { localStorage.setItem('architect-vault', JSON.stringify(vault)); }, [vault]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/architect-fetch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, level, format: 'Video Playlists', language: lang, cost }) });
      const d = await res.json();
      setResults(d);
    } catch (e) { console.error(e); }
    setLoading(false);
    setNodesLoading(true);
    try {
      const res2 = await fetch(`${API_URL}/api/skill-roadmap`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skill: query, level }) });
      const d2 = await res2.json();
      setNodes(Array.isArray(d2.nodes) ? d2.nodes : []);
    } catch (e) { console.error(e); }
    setNodesLoading(false);
  };

  const addToVault = () => {
    if (!query || vault[query]) return;
    setVault(p => ({ ...p, [query]: { prerequisites: false, core: false, advanced: false, capstone: false } }));
    setTab('vault');
  };

  const togglePhase = (skill, phase) => setVault(p => ({ ...p, [skill]: { ...p[skill], [phase]: !p[skill][phase] } }));
  const removeFromVault = (skill) => setVault(p => { const n = { ...p }; delete n[skill]; return n; });
  const unlockNode = (id) => setUnlocked(p => ({ ...p, [id]: true }));

  const vaultPct = (phases) => Object.values(phases).filter(Boolean).length / Object.values(phases).length * 100;
  const currentSkillPct = vault[query] ? vaultPct(vault[query]) : 0;

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 20px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <div><h1 style={{ margin: 0, fontSize: '1.5rem' }}>Skill Architect</h1><p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>3D Knowledge Graph · 2026 Market Intelligence · Build-While-You-Learn</p></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['discover', 'vault'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', borderRadius: '10px', border: `1px solid ${tab === t ? '#6366f1' : 'var(--border)'}`, background: tab === t ? 'rgba(99,102,241,0.2)' : 'transparent', color: tab === t ? '#6366f1' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: tab === t ? 700 : 400 }}>
              {t === 'discover' ? '🔍 Discover' : `🔐 Vault (${Object.keys(vault).length})`}
            </button>
          ))}
        </div>
      </div>

      {tab === 'discover' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', flex: 1, minHeight: 0 }}>
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Skill (e.g. React, Java, ML)" style={inp} />
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ ...inp }}>
              {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
            </select>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ ...inp }}>
              {['English', 'Hinglish', 'Hindi'].map(l => <option key={l}>{l}</option>)}
            </select>
            <select value={cost} onChange={e => setCost(e.target.value)} style={{ ...inp }}>
              <option value="Free">Free (YouTube/OS)</option>
              <option value="Paid">Paid (Udemy/Cert)</option>
            </select>
            <button onClick={search} disabled={loading || !query.trim()} className="action-btn neon-glow-btn" style={{ padding: '12px', fontWeight: 700, fontSize: '0.95rem' }}>
              {loading ? '⏳ Analyzing...' : '🧠 Generate Roadmap'}
            </button>
            {results && !vault[query] && (
              <button onClick={addToVault} className="action-btn" style={{ padding: '10px', fontSize: '0.85rem', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#10b981' }}>+ Add to Mastery Vault</button>
            )}
            {results?.marketData && <MarketPanel data={results.marketData} />}
            {results && vault[query] && <MilestonePanel skill={query} pct={currentSkillPct} API_URL={API_URL} />}
            {results?.resources?.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Top Resources</div>
                {results.resources.slice(0, 4).map((r, i) => (
                  <a key={i} href={r.direct_url || `https://youtube.com/results?search_query=${encodeURIComponent(r.title)}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '6px', textDecoration: 'none', color: 'var(--text-primary)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{r.creator} · ⭐{r.rating} · {r.duration}</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {nodesLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Building skill tree...</p>
              </div>
            ) : nodes.length > 0 ? (
              <SkillTree nodes={nodes} unlocked={unlocked} onNodeClick={setSelectedNode} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '12px', opacity: 0.4 }}>
                <div style={{ fontSize: '3rem' }}>🌳</div>
                <p>Search a skill to generate interactive roadmap</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <VaultTab vault={vault} togglePhase={togglePhase} onRemove={removeFromVault} />
      )}

      <AnimatePresence>
        {selectedNode && (
          <NodeModal node={selectedNode} unlocked={!!unlocked[selectedNode.id]} onUnlock={() => { unlockNode(selectedNode.id); setSelectedNode(null); }} onClose={() => setSelectedNode(null)} />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default SkillArchitect;
