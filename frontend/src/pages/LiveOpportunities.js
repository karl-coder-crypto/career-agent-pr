import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORK_MODE_COLOR = { Remote: '#10b981', Hybrid: '#f59e0b', 'On-site': '#6366f1' };
const PPO_COLOR = { High: '#10b981', Medium: '#f59e0b', Low: '#ef4444', 'N/A': 'var(--text-secondary)' };
const FRESHNESS_LABEL = (s) => s >= 8 ? { label: 'Hot', color: '#10b981' } : s >= 5 ? { label: 'Active', color: '#f59e0b' } : { label: 'Cold', color: '#6b7280' };

function RadarPulse() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ position: 'absolute', inset: 0, border: '2px solid rgba(99,102,241,0.5)', borderRadius: '50%', animation: `radarPulse ${1.5 * i}s ease-out infinite`, animationDelay: `${0.3 * i}s` }} />
        ))}
        <div style={{ position: 'absolute', inset: '35%', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 20px #6366f1' }} />
      </div>
      <p style={{ color: '#6366f1', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Scanning Live Market...</p>
      <style>{`@keyframes radarPulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }`}</style>
    </div>
  );
}

function MatchRing({ score }) {
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#6366f1';
  const r = 22, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c}
          strokeLinecap="round" transform="rotate(-90 28 28)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color }}>{score}%</div>
    </div>
  );
}

function SniperModal({ job, skills, API_URL, onClose }) {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/sniper-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skills, company: job.companyName, role: job.role, techStack: job.techStack })
        });
        const d = await res.json();
        if (res.ok) setContext(d.context);
      } catch (e) { setContext('Could not load context.'); }
      setLoading(false);
    })();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'rgba(12,12,12,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>🎯 Sniper Context</div>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem' }}>{job.companyName} — {job.role}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>How your skills specifically solve this company's problems:</p>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(99,102,241,0.3)', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            Generating tailored context...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {context.split('\n').filter(l => l.trim()).map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', fontSize: '0.88rem', lineHeight: 1.5 }}>
                <span style={{ color: '#6366f1', flexShrink: 0 }}>→</span>
                <span>{line.replace(/^-\s*/, '')}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => window.open(job.url, '_blank')} className="action-btn neon-glow-btn" style={{ width: '100%', marginTop: '20px', fontWeight: 700 }}>
          ⚡ Apply Now — {job.companyName}
        </button>
      </motion.div>
    </motion.div>
  );
}

function JobCard({ job, skills, API_URL, idx }) {
  const [sniperOpen, setSniperOpen] = useState(false);
  const freshness = FRESHNESS_LABEL(job.freshnessScore || 5);
  const isStale = job.freshnessScore < 4;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: isStale ? 0.45 : 1, y: 0 }} transition={{ delay: idx * 0.06 }}
        style={{ background: 'rgba(12,12,12,0.7)', backdropFilter: 'blur(16px)', border: `1px solid ${job.matchScore >= 85 ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: job.matchScore >= 85 ? '0 0 20px rgba(16,185,129,0.1)' : 'none', position: 'relative' }}>
        {job.isVerified && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '4px', color: '#10b981', fontWeight: 700 }}>✓ VERIFIED</div>
        )}

        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <MatchRing score={job.matchScore || 75} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{job.companyName}</h3>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: `${WORK_MODE_COLOR[job.workMode] || '#6366f1'}18`, color: WORK_MODE_COLOR[job.workMode] || '#6366f1', border: `1px solid ${WORK_MODE_COLOR[job.workMode] || '#6366f1'}40` }}>{job.workMode}</span>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: `${freshness.color}15`, color: freshness.color, border: `1px solid ${freshness.color}30` }}>{freshness.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.role}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {(job.techStack || []).map((t, i) => (
            <span key={i} style={{ fontSize: '0.72rem', padding: '3px 8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '5px', color: '#a5b4fc' }}>{t}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 10px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Stipend / CTC</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{job.stipend}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 10px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{job.jobType === 'Job' ? 'Location' : 'PPO Chance'}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: PPO_COLOR[job.ppoChance] || 'var(--text-primary)', marginTop: '2px' }}>
              {job.ppoChance !== 'N/A' ? `PPO: ${job.ppoChance}` : job.location}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📅 {job.postDate} · {job.duration}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => window.open(job.url || '#', '_blank')} className="action-btn neon-glow-btn" style={{ flex: 1, padding: '10px', fontWeight: 700, fontSize: '0.88rem' }}>
            ⚡ Apply Directly
          </button>
          <button onClick={() => setSniperOpen(true)} title="Sniper Context" style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem' }}>
            🎯
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {sniperOpen && <SniperModal job={job} skills={skills} API_URL={API_URL} onClose={() => setSniperOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function LiveOpportunities({ API_URL }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [skills, setSkills] = useState('');
  const [role, setRole] = useState('');
  const [jobType, setJobType] = useState('Paid Internship');
  const [duration, setDuration] = useState('3 Months');
  const [location, setLocation] = useState('Bangalore');
  const [workMode, setWorkMode] = useState('Any');
  const [sortBy, setSortBy] = useState('match');
  const [filterMode, setFilterMode] = useState('All');

  const handleSearch = async () => {
    if (!skills.trim() || !role.trim()) return alert('Define skills and role to initialize scan.');
    setLoading(true);
    setScanned(true);
    try {
      const res = await fetch(`${API_URL}/api/get-live-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, role, jobType, duration, location, workMode })
      });
      const d = await res.json();
      setJobs(Array.isArray(d) ? d : []);
    } catch (e) { setJobs([]); }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let list = [...jobs];
    if (filterMode !== 'All') list = list.filter(j => j.workMode === filterMode);
    if (sortBy === 'match') list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    else if (sortBy === 'fresh') list.sort((a, b) => (b.freshnessScore || 0) - (a.freshnessScore || 0));
    return list;
  }, [jobs, sortBy, filterMode]);

  const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 20px 20px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      {loading && <RadarPulse />}

      <div style={{ marginBottom: '20px', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Opportunity Engine</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Live Market Extraction · Ghost-Job Detection · Semantic Match · Direct Deep-Link</p>
      </div>

      <div style={{ background: 'rgba(12,12,12,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', marginBottom: '20px', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <input value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Target Role (e.g. SDE Intern, Frontend Dev)" style={inp} />
          <input value={skills} onChange={e => setSkills(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Core Skills (React, Java, Python...)" style={inp} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '10px', alignItems: 'end' }}>
          <select value={jobType} onChange={e => setJobType(e.target.value)} style={{ ...inp, width: '100%' }}>
            {['Paid Internship', 'Free Internship', 'Full-time Job'].map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={workMode} onChange={e => setWorkMode(e.target.value)} style={{ ...inp, width: '100%' }}>
            {['Any', 'Remote', 'Hybrid', 'On-site'].map(m => <option key={m}>{m}</option>)}
          </select>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City / Region" style={inp} />
          <select value={duration} onChange={e => setDuration(e.target.value)} style={{ ...inp, width: '100%' }}>
            {['1 Month', '2 Months', '3 Months', '6 Months+'].map(d => <option key={d}>{d}</option>)}
          </select>
          <button onClick={handleSearch} disabled={loading} className="action-btn neon-glow-btn" style={{ padding: '10px 24px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            🚀 Hunter Protocol
          </button>
        </div>
      </div>

      {scanned && !loading && jobs.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexShrink: 0, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{filtered.length} results</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sort:</span>
          {['match', 'fresh'].map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '7px', border: `1px solid ${sortBy === s ? '#6366f1' : 'var(--border)'}`, background: sortBy === s ? 'rgba(99,102,241,0.2)' : 'transparent', color: sortBy === s ? '#6366f1' : 'var(--text-secondary)', cursor: 'pointer' }}>
              {s === 'match' ? '% Match' : '🔥 Freshness'}
            </button>
          ))}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mode:</span>
          {['All', 'Remote', 'Hybrid', 'On-site'].map(m => (
            <button key={m} onClick={() => setFilterMode(m)} style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '7px', border: `1px solid ${filterMode === m ? (WORK_MODE_COLOR[m] || '#6366f1') : 'var(--border)'}`, background: filterMode === m ? `${WORK_MODE_COLOR[m] || '#6366f1'}20` : 'transparent', color: filterMode === m ? (WORK_MODE_COLOR[m] || '#6366f1') : 'var(--text-secondary)', cursor: 'pointer' }}>{m}</button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!scanned ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%', flexDirection: 'column', gap: '16px', opacity: 0.35 }}>
            <div style={{ fontSize: '4rem' }}>🛰️</div>
            <p style={{ fontSize: '1rem' }}>Configure parameters and initiate Hunter Protocol</p>
          </div>
        ) : !loading && filtered.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '40px' }}>No matching opportunities found. Broaden filters.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filtered.map((job, idx) => (
              <JobCard key={idx} job={job} skills={skills} API_URL={API_URL} idx={idx} />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default LiveOpportunities;
