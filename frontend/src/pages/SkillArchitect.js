import React, { useState, useEffect } from 'react';

function SkillArchitect({ API_URL }) {
  const [activeTab, setActiveTab] = useState('discover');
  
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [format, setFormat] = useState('Video Playlists');
  const [language, setLanguage] = useState('English');
  const [cost, setCost] = useState('Free');
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ resources: [], practiceLabs: [] });

  const [vault, setVault] = useState(() => {
    try {
      const saved = localStorage.getItem('architect-vault');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('architect-vault', JSON.stringify(vault));
  }, [vault]);

  const handleSearch = async () => {
    if (!query.trim()) return alert("Specify a Skill Domain.");
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/architect-fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, level, format, language, cost })
      });
      const data = await resp.json();
      setResults({
        resources: Array.isArray(data.resources) ? data.resources : [],
        practiceLabs: Array.isArray(data.practiceLabs) ? data.practiceLabs : []
      });
    } catch (err) {
      setResults({ resources: [], practiceLabs: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (skill) => {
    if (vault[skill]) return;
    setVault(prev => ({
      ...prev,
      [skill]: { fundamentals: false, advanced: false, capstone: false }
    }));
    setActiveTab('vault');
  };

  const togglePhase = (skill, phase) => {
    setVault(prev => ({
      ...prev,
      [skill]: { ...prev[skill], [phase]: !prev[skill][phase] }
    }));
  };

  const getProgress = (phases) => {
    const total = 3;
    const count = (phases.fundamentals ? 1 : 0) + (phases.advanced ? 1 : 0) + (phases.capstone ? 1 : 0);
    return (count / total) * 100;
  };

  const CircularProgress = ({ percent }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    
    return (
      <svg className="mastery-svg" width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
        <circle 
          cx="45" cy="45" r={radius} 
          stroke={percent === 100 ? "var(--accent-secondary)" : "var(--success-neon)"} 
          strokeWidth="8" fill="none"
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="50" textAnchor="middle" fill="#fff" fontSize="1.1rem" fontWeight="bold">
          {Math.round(percent)}%
        </text>
      </svg>
    );
  };

  return (
    <div className="layout-col page-fade-in opportunities-page">
      <div className="header-box" style={{ paddingBottom: '10px' }}>
        <h1>The Skill Architect</h1>
        <p>Comprehensive knowledge mapping overriding specific generative learning clusters natively.</p>
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <button className={`nav-link ${activeTab === 'discover' ? 'active' : ''}`} style={{ width:'auto', background:'transparent' }} onClick={() => setActiveTab('discover')}>🔍 Discover</button>
          <button className={`nav-link ${activeTab === 'vault' ? 'active' : ''}`} style={{ width:'auto', background:'transparent' }} onClick={() => setActiveTab('vault')}>🔐 Mastery Vault</button>
        </div>
      </div>

      {activeTab === 'discover' ? (
        <>
          <div className="glass filter-container" style={{ padding: '20px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="input-group-row">
              <input type="text" placeholder="Skill (e.g., Kubernetes, UI/UX, GraphQL)" value={query} onChange={e => setQuery(e.target.value)} style={{ flex: '1' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
              <select value={level} onChange={e => setLevel(e.target.value)} className="glass-dropdown">
                <option value="Absolute Beginner">Absolute Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select value={format} onChange={e => setFormat(e.target.value)} className="glass-dropdown">
                <option value="Video Playlists">Video Playlists</option>
                <option value="Interactive Courses">Interactive Courses</option>
                <option value="Official Docs">Official Docs</option>
                <option value="GitHub Repos">GitHub Repos</option>
              </select>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="glass-dropdown">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
              <select value={cost} onChange={e => setCost(e.target.value)} className="glass-dropdown">
                <option value="Free">Free (YouTube/OS)</option>
                <option value="Paid">Paid (Udemy/Cert)</option>
              </select>
            </div>
            <button onClick={handleSearch} className="action-btn neon-glow-btn" disabled={loading} style={{ alignSelf: 'flex-end', marginTop: '10px' }}>
              {loading ? 'Synthesizing Architecture...' : 'Analyze Domains'}
            </button>
            {results.resources.length > 0 && !vault[query] && (
              <button onClick={() => handleBookmark(query)} className="action-btn" style={{ alignSelf: 'flex-end', background: 'var(--accent-secondary)' }}>
                Bookmark '{query}' to Vault
              </button>
            )}
          </div>

          {!loading && results.resources.length > 0 && (
            <div className="dsa-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {results.resources.map((res, i) => (
                <div key={i} className="glass masonry-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, paddingRight: '10px', color: 'var(--text-main)' }}>{res.title}</h3>
                    {res.cost === 'Free' && <span className="neon-badge free">Free</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{res.creator}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{res.why_this_resource}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', opacity: 0.8, marginTop: '5px' }}>
                     <span style={{ background:'rgba(255,255,255,0.1)', padding:'4px 8px', borderRadius:'4px' }}>⭐ {res.rating}</span>
                     <span style={{ background:'rgba(255,255,255,0.1)', padding:'4px 8px', borderRadius:'4px' }}>🕒 {res.duration}</span>
                  </div>
                  <button className="action-btn" onClick={() => {
                    const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(res.title)}`;
                    window.open(res.direct_url || fallbackUrl, '_blank');
                  }} style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
                    Start Learning
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && results.practiceLabs.length > 0 && (
             <div style={{ marginTop: '40px' }}>
               <h2 style={{ marginBottom: '20px', color: 'var(--accent-secondary)' }}>Actionable Practice Labs</h2>
               <div className="dsa-grid">
               {results.practiceLabs.map((lab, i) => (
                 <div key={i} className="glass masonry-card" style={{ padding: '15px' }}>
                    <h4 style={{ marginBottom: '10px' }}>{lab.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>{lab.description}</p>
                    <button className="power-btn solve" onClick={() => window.open(lab.link, '_blank')}>Launch Sequence</button>
                 </div>
               ))}
               </div>
             </div>
          )}
        </>
      ) : (
        <div className="vault-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {Object.keys(vault).length === 0 ? (
            <p style={{ width: '100%', textAlign: 'center', opacity: 0.6 }}>Your Mastery Vault is empty. Search domains and log parameters natively.</p>
          ) : (
            Object.keys(vault).map(skillName => {
              const phases = vault[skillName];
              const pct = getProgress(phases);
              return (
                <div key={skillName} className="glass vault-card" style={{ padding: '25px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <CircularProgress percent={pct} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-main)', fontSize: '1.4rem' }}>{skillName}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                         <input type="checkbox" className="dsa-checkbox" checked={phases.fundamentals} onChange={() => togglePhase(skillName, 'fundamentals')} />
                         <span style={{ fontSize: '0.95rem', color: phases.fundamentals ? 'var(--text-muted)' : 'var(--text-main)' }}>Phase 1: Fundamentals</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                         <input type="checkbox" className="dsa-checkbox" checked={phases.advanced} onChange={() => togglePhase(skillName, 'advanced')} />
                         <span style={{ fontSize: '0.95rem', color: phases.advanced ? 'var(--text-muted)' : 'var(--text-main)' }}>Phase 2: Advanced Concepts</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                         <input type="checkbox" className="dsa-checkbox" checked={phases.capstone} onChange={() => togglePhase(skillName, 'capstone')} />
                         <span style={{ fontSize: '0.95rem', color: phases.capstone ? 'var(--text-muted)' : 'var(--text-main)' }}>Phase 3: Capstone Project</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default SkillArchitect;
