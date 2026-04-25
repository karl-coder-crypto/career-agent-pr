import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AXES = ['dsa', 'system_design', 'frameworks', 'domain', 'impact'];
const AXIS_LABELS = { dsa: 'DSA', system_design: 'Sys Design', frameworks: 'Frameworks', domain: 'Domain', impact: 'Impact' };
const SENTIMENT_COLOR = { Aggressive: '#10b981', Selective: '#f59e0b', Freeze: '#ef4444' };
const FREQ_COLOR = { High: '#ef4444', Medium: '#f59e0b' };

function RadarChart({ user, benchmark }) {
  const size = 240;
  const cx = size / 2, cy = size / 2, r = 90;
  const n = AXES.length;

  const angleOf = (i) => (i * 2 * Math.PI) / n - Math.PI / 2;

  const pt = (val, i) => {
    const a = angleOf(i);
    const d = (val / 10) * r;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  };

  const rings = useMemo(() => [2, 4, 6, 8, 10].map(v =>
    AXES.map((_, i) => pt(v, i)).map((p, j) => (j === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ') + ' Z'
  ), []);

  const polyUser = useMemo(() => AXES.map((_, i) => pt(user[AXES[i]] || 0, i)), [user]);
  const polyBench = useMemo(() => AXES.map((_, i) => pt(benchmark[AXES[i]] || 0, i)), [benchmark]);

  const toPath = (pts) => pts.map((p, j) => `${j === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
      {AXES.map((_, i) => {
        const [x, y] = pt(10, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      <path d={toPath(polyBench)} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="1.5" />
      <path d={toPath(polyUser)} fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" />
      {AXES.map((ax, i) => {
        const a = angleOf(i);
        const lx = cx + (r + 22) * Math.cos(a);
        const ly = cy + (r + 22) * Math.sin(a);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontWeight="600">{AXIS_LABELS[ax]}</text>;
      })}
    </svg>
  );
}

function ChecklistItem({ text, done, onToggle }) {
  return (
    <motion.label whileHover={{ x: 2 }} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', cursor: 'pointer', marginBottom: '6px' }}>
      <input type="checkbox" checked={done} onChange={onToggle} style={{ marginTop: '2px', accentColor: '#10b981', flexShrink: 0 }} />
      <span style={{ fontSize: '0.88rem', color: done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', lineHeight: 1.5 }}>{text}</span>
    </motion.label>
  );
}

function AIConsultant({ API_URL }) {
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [activeQ, setActiveQ] = useState(null);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const analyze = async (fu) => {
    if (!company.trim() || !skills.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`${API_URL}/api/consultant/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, skills, followUp: fu || '' })
      });
      const d = await res.json();
      if (res.ok) {
        setData(d);
        setChecklist((d.protocol_checklist || []).map(t => ({ text: t, done: false })));
        setShowFollowUp(false);
        setFollowUp('');
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggleCheck = (i) => setChecklist(p => p.map((c, idx) => idx === i ? { ...c, done: !c.done } : c));

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.9rem', boxSizing: 'border-box' };
  const card = { background: 'rgba(15,15,15,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' };

  const MNCs = ['Google', 'Amazon', 'Microsoft', 'Meta', 'NVIDIA', 'Apple', 'Flipkart', 'Atlassian'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 20px 20px' }}>
      <div style={{ marginBottom: '20px', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Aegis Intelligence Engine</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Global Market Sync · Skill-Gap Radar · MNC Strategy · 2026 Intelligence</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', flex: 1, minHeight: 0 }}>
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={card}>
            <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Target Company</div>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Amazon, NVIDIA..." style={inp} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {MNCs.map(m => (
                <button key={m} onClick={() => setCompany(m)} style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', border: `1px solid ${company === m ? '#6366f1' : 'var(--border)'}`, background: company === m ? 'rgba(99,102,241,0.2)' : 'transparent', color: company === m ? '#6366f1' : 'var(--text-secondary)', cursor: 'pointer' }}>{m}</button>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Your Skills & Experience</div>
            <textarea value={skills} onChange={e => setSkills(e.target.value)} placeholder="Java, Spring Boot, 2 yrs exp, built REST APIs, no k8s, DSA basics..." style={{ ...inp, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <button onClick={() => analyze('')} disabled={loading || !company.trim() || !skills.trim()} className="action-btn neon-glow-btn" style={{ padding: '14px', fontWeight: 700, fontSize: '1rem' }}>
            {loading ? '⏳ Analyzing...' : '🛰️ Run Intelligence Analysis'}
          </button>

          {data?.follow_up_questions?.length > 0 && (
            <div style={{ ...card, borderColor: 'rgba(245,158,11,0.3)' }}>
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>🔍 Probing Questions</div>
              {data.follow_up_questions.map((q, i) => (
                <div key={i} onClick={() => setActiveQ(activeQ === i ? null : i)} style={{ padding: '10px 12px', background: 'rgba(245,158,11,0.06)', border: `1px solid ${activeQ === i ? '#f59e0b' : 'rgba(245,158,11,0.2)'}`, borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  {q}
                </div>
              ))}
              {!showFollowUp ? (
                <button onClick={() => setShowFollowUp(true)} style={{ width: '100%', padding: '9px', marginTop: '6px', background: 'transparent', border: '1px dashed rgba(245,158,11,0.4)', borderRadius: '8px', color: '#f59e0b', cursor: 'pointer', fontSize: '0.85rem' }}>+ Answer & Re-analyze</button>
              ) : (
                <>
                  <textarea value={followUp} onChange={e => setFollowUp(e.target.value)} placeholder="Answer the questions above..." style={{ ...inp, minHeight: '70px', marginTop: '8px', resize: 'vertical', fontFamily: 'inherit' }} />
                  <button onClick={() => analyze(followUp)} disabled={loading || !followUp.trim()} className="action-btn" style={{ width: '100%', marginTop: '8px', fontSize: '0.85rem' }}>
                    {loading ? 'Re-analyzing...' : '🔄 Submit & Re-analyze'}
                  </button>
                </>
              )}
            </div>
          )}

          {checklist.length > 0 && (
            <div style={card}>
              <div style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>📋 Dynamic Protocol Checklist</div>
              {checklist.map((c, i) => <ChecklistItem key={i} text={c.text} done={c.done} onToggle={() => toggleCheck(i)} />)}
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{checklist.filter(c => c.done).length}/{checklist.length} Complete</div>
            </div>
          )}
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence mode="wait">
            {!data && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '16px', opacity: 0.35 }}>
                <div style={{ fontSize: '4rem' }}>🛰️</div>
                <p style={{ fontSize: '1rem' }}>Enter company + skills to activate Intelligence Engine</p>
              </motion.div>
            )}
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Synchronizing with global market intelligence...</p>
              </motion.div>
            )}
            {data && !loading && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ ...card, borderColor: `${SENTIMENT_COLOR[data.hiring_sentiment]}40`, display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Hiring Sentiment</div>
                    <div style={{ padding: '8px 18px', borderRadius: '20px', background: `${SENTIMENT_COLOR[data.hiring_sentiment]}20`, border: `1px solid ${SENTIMENT_COLOR[data.hiring_sentiment]}`, color: SENTIMENT_COLOR[data.hiring_sentiment], fontWeight: 700, fontSize: '1rem' }}>{data.hiring_sentiment}</div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{data.sentiment_reason}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(data.tech_stack_2026 || []).map((t, i) => (
                        <span key={i} style={{ padding: '3px 10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', fontSize: '0.78rem', color: '#6366f1' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {data.mentor_message && (
                  <div style={{ ...card, borderColor: 'rgba(99,102,241,0.3)', borderLeft: '3px solid #6366f1' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', marginBottom: '8px' }}>🤖 Aegis Mentor</div>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic' }}>"{data.mentor_message}"</p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={card}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Skill-Gap Radar</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <RadarChart user={data.user_vector || {}} benchmark={data.mnc_benchmark || {}} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />You</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6366f1' }} />{company} Benchmark</div>
                    </div>
                  </div>

                  <div style={card}>
                    <div style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>💰 Salary & Growth 2026</div>
                    {data.salary_2026 && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>🇮🇳 India Base</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', marginTop: '3px' }}>{data.salary_2026.base_india}</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>🌍 Global Base</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6366f1', marginTop: '3px' }}>{data.salary_2026.base_global}</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>RSU/Equity</div>
                          <div style={{ fontWeight: 700, color: '#f59e0b', marginTop: '3px' }}>{data.salary_2026.rsu}</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '2px solid #6366f1', paddingLeft: '10px' }}>{data.salary_2026.growth_track}</div>
                      </>
                    )}
                  </div>
                </div>

                {data.killer_project && (
                  <div style={{ ...card, borderColor: 'rgba(16,185,129,0.3)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>🎯 MNC Killer Project</div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#10b981' }}>{data.killer_project.title}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', lineHeight: 1.6 }}>{data.killer_project.description}</p>
                    <div style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>💡 {data.killer_project.why}</div>
                  </div>
                )}

                {data.leetcode_patterns?.length > 0 && (
                  <div style={card}>
                    <div style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>⚡ Top LeetCode Patterns — {company} (Last 6 Months)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {data.leetcode_patterns.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '24px', color: 'var(--text-secondary)' }}>#{i + 1}</span>
                          <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{p.pattern}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: `${FREQ_COLOR[p.frequency]}20`, color: FREQ_COLOR[p.frequency], fontSize: '0.72rem', fontWeight: 700 }}>{p.frequency}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default AIConsultant;
