import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATES = ['Madhya Pradesh','Maharashtra','Karnataka','Delhi','Uttar Pradesh','Tamil Nadu','Telangana','Rajasthan','Gujarat','West Bengal','Punjab','Haryana','Bihar','Kerala','Odisha'];
const TONES = [{ id: 'Technical Pro', icon: '⚙️', desc: 'Precise & technical English' }, { id: 'Relatable Alumni', icon: '🎓', desc: 'Warm Hinglish rapport' }, { id: 'Industry Enthusiast', icon: '🔥', desc: 'Energetic & passionate' }];
const COMMUNITY_COLOR = { Slack: '#4A154B', Discord: '#5865F2', Meetup: '#F64060', GDG: '#4285F4', 'LinkedIn Group': '#0A66C2' };

function DataStreamOverlay() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ width: '3px', borderRadius: '2px', background: '#6366f1', animation: `dataBar 1.2s ease-in-out ${i * 0.1}s infinite alternate`, height: `${20 + Math.random() * 40}px` }} />
        ))}
      </div>
      <p style={{ color: '#6366f1', fontWeight: 700, letterSpacing: '3px', fontSize: '0.82rem', textTransform: 'uppercase' }}>Trident Protocol Active — Research in Progress...</p>
      <style>{`@keyframes dataBar { from { opacity: 0.3; transform: scaleY(0.4); } to { opacity: 1; transform: scaleY(1.4); } }`}</style>
    </div>
  );
}

function ProbabilityMeter({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#f59e0b' : '#6366f1';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: '3px' }} />
      </div>
      <span style={{ fontSize: '1rem', fontWeight: 700, color, minWidth: '42px' }}>{score}%</span>
    </div>
  );
}

function CollegeAutocomplete({ state, API_URL, onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (!state || q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`${API_URL}/api/networking/colleges`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state, query: q }) });
      const d = await res.json();
      setSuggestions(Array.isArray(d) ? d : []);
      setOpen(true);
    } catch (e) { setSuggestions([]); }
  }, [state, API_URL]);

  const handleChange = (val) => {
    setQuery(val);
    onSelect('');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  const select = (name) => { setQuery(name); onSelect(name); setSuggestions([]); setOpen(false); };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input value={query} onChange={e => handleChange(e.target.value)} onFocus={() => suggestions.length > 0 && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={state ? `Type college name in ${state}...` : 'Select state first'}
        disabled={!state}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', boxSizing: 'border-box', opacity: state ? 1 : 0.5 }} />
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'rgba(14,14,20,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '10px', zIndex: 200, overflow: 'hidden' }}>
            {suggestions.map((s, i) => (
              <div key={i} onMouseDown={() => select(s)} style={{ padding: '10px 14px', fontSize: '0.88rem', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.target.style.background = 'rgba(99,102,241,0.15)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}>
                🎓 {s}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageCard({ msg, step, copiedId, onCopy, stepNum }) {
  if (!msg) return null;
  const id = `msg-${stepNum}`;
  const STEP_COLOR = ['#6366f1', '#f59e0b', '#10b981'];
  const color = STEP_COLOR[stepNum - 1];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stepNum * 0.08 }}
      style={{ background: 'rgba(12,12,12,0.6)', backdropFilter: 'blur(16px)', border: `1px solid ${color}30`, borderRadius: '14px', padding: '20px', borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{stepNum}</div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{msg.label}</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '3px' }}>📡 {msg.platform}</div>
        </div>
        <button onClick={() => onCopy(msg.subject ? `Subject: ${msg.subject}\n\n${msg.body}` : msg.body, id)} className="copy-btn" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
          {copiedId === id ? '✅ Copied!' : '📋 Copy'}
        </button>
      </div>
      {msg.subject && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>Subject: <strong style={{ color: 'var(--text-primary)' }}>{msg.subject}</strong></div>}
      <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{msg.body}</div>
      {stepNum === 1 && msg.body && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>{msg.body.length}/300 chars</div>}
    </motion.div>
  );
}

function NetworkingHub({ API_URL }) {
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [managerName, setManagerName] = useState('');
  const [githubProjects, setGithubProjects] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [tone, setTone] = useState('Technical Pro');
  const [loading, setLoading] = useState(false);
  const [outreachData, setOutreachData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  const [searchRole, setSearchRole] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchExp, setSearchExp] = useState('');
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [hasSearched, setHasSearched] = useState(false);

  const handleNetworkSearch = async () => {
    if (!searchRole || !searchCompany) return;
    setLoadingRadar(true); setHasSearched(false); setProfiles([]);
    try {
      const res = await fetch(`${API_URL}/api/networking/fetch-profiles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: searchRole, company: searchCompany, experience: searchExp || '0-2 years' }) });
      const d = await res.json();
      setProfiles(Array.isArray(d) ? d : []);
    } catch (e) { console.error(e); }
    setLoadingRadar(false); setHasSearched(true);
  };

  const filteredProfiles = profiles.filter(p => {
    if (activeFilter === 'All') return true;
    const s = (p.current_role || '').toLowerCase();
    if (activeFilter === 'HR') return s.includes('hr') || s.includes('talent') || s.includes('recruiter');
    if (activeFilter === 'SDE') return s.includes('sde') || s.includes('engineer') || s.includes('developer');
    if (activeFilter === 'Lead') return s.includes('lead') || s.includes('manager') || s.includes('principal') || s.includes('staff');
    return true;
  });

  const generateOutreach = async () => {
    if (!companyName.trim() || !targetRole.trim()) return;
    setLoading(true); setOutreachData(null);
    const resumeContext = localStorage.getItem('userResumeContext') || 'Skills: React, Node.js, Systems Design.';
    try {
      const res = await fetch(`${API_URL}/api/generate-outreach`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, targetRole, managerName, college: selectedCollege, githubProjects, tone, resumeContext })
      });
      const d = await res.json();
      if (res.ok) { setOutreachData(d); setActiveStep(1); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const copyToClipboard = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', boxSizing: 'border-box' };
  const card = { background: 'rgba(12,12,12,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 20px 20px', maxWidth: '1500px', margin: '0 auto', width: '100%' }}>
      {loading && <DataStreamOverlay />}

      <div style={{ marginBottom: '20px', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>The Social Architect</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Trident Protocol · Alumni Intelligence · Community Bridge · 3-Stage Sequence</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', flex: 1, minHeight: 0 }}>
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={card}>
            <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>🎯 Target Parameters</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Target Company (e.g. Google)" style={inp} />
              <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Target Role (e.g. SDE Intern)" style={inp} />
              <input value={managerName} onChange={e => setManagerName(e.target.value)} placeholder="Hiring Manager Name (optional)" style={inp} />
              <input value={githubProjects} onChange={e => setGithubProjects(e.target.value)} placeholder="Your GitHub Projects (comma-separated)" style={inp} />
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>🎓 Alumni Intelligence</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedCollege(''); }} style={{ ...inp }}>
                <option value="">Select State...</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
              <CollegeAutocomplete state={selectedState} API_URL={API_URL} onSelect={setSelectedCollege} />
              {selectedCollege && <div style={{ fontSize: '0.78rem', color: '#f59e0b', padding: '6px 10px', background: 'rgba(245,158,11,0.1)', borderRadius: '7px' }}>✅ {selectedCollege}</div>}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>🎙️ Tone Matrix</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: tone === t.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${tone === t.id ? '#6366f1' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: tone === t.id ? '#6366f1' : 'var(--text-primary)' }}>{t.id}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generateOutreach} disabled={loading || !companyName.trim() || !targetRole.trim()} className="action-btn neon-glow-btn" style={{ padding: '14px', fontWeight: 700, fontSize: '1rem' }}>
            {loading ? '⏳ Trident Protocol Active...' : '🔱 Deploy Trident Protocol'}
          </button>

          <div style={{ ...card, borderColor: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>🔭 Smart Connections Radar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input value={searchRole} onChange={e => setSearchRole(e.target.value)} placeholder="Role (e.g. SDE, Data Scientist)" style={inp} />
              <input value={searchCompany} onChange={e => setSearchCompany(e.target.value)} placeholder="Company (e.g. Google)" style={inp} />
              <input value={searchExp} onChange={e => setSearchExp(e.target.value)} placeholder="Experience (e.g. 2-5 yrs)" style={inp} />
              <button onClick={handleNetworkSearch} disabled={loadingRadar || !searchRole || !searchCompany} className="action-btn" style={{ padding: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                {loadingRadar ? '📡 Scanning...' : '📡 Deploy Network Radar'}
              </button>
            </div>
            {hasSearched && !loadingRadar && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {['All', 'HR', 'SDE', 'Lead'].map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', border: `1px solid ${activeFilter === f ? '#6366f1' : 'var(--border)'}`, background: activeFilter === f ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeFilter === f ? '#6366f1' : 'var(--text-secondary)', cursor: 'pointer' }}>{f}</button>
                  ))}
                </div>
                {filteredProfiles.length === 0 ? <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>No targets found. Broaden search.</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredProfiles.slice(0, 5).map((p, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</span>
                          <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700 }}>{p.match_score}</span>
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{p.current_role}</p>
                        <button onClick={() => window.open(p.profile_url, '_blank')} style={{ width: '100%', padding: '6px', fontSize: '0.78rem', background: 'rgba(10,102,194,0.15)', border: '1px solid rgba(10,102,194,0.4)', borderRadius: '7px', color: '#60a5fa', cursor: 'pointer' }}>🔗 View Profile</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence mode="wait">
            {!outreachData && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '16px', opacity: 0.35, minHeight: '300px' }}>
                <div style={{ fontSize: '4rem' }}>🔱</div>
                <p>Configure target parameters and deploy Trident Protocol</p>
              </motion.div>
            )}
            {outreachData && !loading && (
              <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ ...card, borderColor: 'rgba(99,102,241,0.3)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Response Probability</div>
                    <ProbabilityMeter score={outreachData.response_probability || 72} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: outreachData.response_probability >= 80 ? '#10b981' : '#f59e0b' }}>
                    {outreachData.response_probability >= 80 ? '🟢' : '🟡'} {outreachData.response_probability}%
                  </div>
                </div>

                {outreachData.blindspot_hook && (
                  <div style={{ ...card, borderColor: 'rgba(245,158,11,0.3)', borderLeft: '3px solid #f59e0b' }}>
                    <div style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>🔍 Blindspot Research Hook</div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, fontStyle: 'italic' }}>{outreachData.blindspot_hook}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {[1, 2, 3].map(s => {
                    const labels = ['Value Hook', 'Rapport', 'Strategic Ask'];
                    const colors = ['#6366f1', '#f59e0b', '#10b981'];
                    return (
                      <button key={s} onClick={() => setActiveStep(s)}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${activeStep === s ? colors[s - 1] : 'rgba(255,255,255,0.08)'}`, background: activeStep === s ? `${colors[s - 1]}18` : 'rgba(255,255,255,0.03)', color: activeStep === s ? colors[s - 1] : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeStep === s ? 700 : 400, fontSize: '0.82rem' }}>
                        {s}. {labels[s - 1]}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {activeStep === 1 && <MessageCard key="m1" msg={outreachData.message1} stepNum={1} copiedId={copiedId} onCopy={copyToClipboard} />}
                  {activeStep === 2 && <MessageCard key="m2" msg={outreachData.message2} stepNum={2} copiedId={copiedId} onCopy={copyToClipboard} />}
                  {activeStep === 3 && <MessageCard key="m3" msg={outreachData.message3} stepNum={3} copiedId={copiedId} onCopy={copyToClipboard} />}
                </AnimatePresence>

                {outreachData.communities?.length > 0 && (
                  <div style={card}>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>🌐 Community Bridge — Warm Entry Paths</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {outreachData.communities.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                          <span style={{ padding: '4px 9px', borderRadius: '6px', background: `${COMMUNITY_COLOR[c.type] || '#6366f1'}20`, color: COMMUNITY_COLOR[c.type] || '#6366f1', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{c.type}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '3px' }}>{c.name}</div>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.why}</p>
                          </div>
                          <button onClick={() => window.open(c.url, '_blank')} style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${COMMUNITY_COLOR[c.type] || '#6366f1'}60`, borderRadius: '7px', color: COMMUNITY_COLOR[c.type] || '#6366f1', cursor: 'pointer', fontSize: '0.78rem', flexShrink: 0 }}>Join →</button>
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
    </div>
  );
}

export default NetworkingHub;
