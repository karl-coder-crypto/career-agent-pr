import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function NetworkingHub({ API_URL }) {
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [managerName, setManagerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [outreachData, setOutreachData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [searchRole, setSearchRole] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchExp, setSearchExp] = useState('');
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [hasSearched, setHasSearched] = useState(false);

  const handleNetworkSearch = async () => {
    if (!searchRole || !searchCompany) return;
    setLoadingRadar(true);
    setHasSearched(false);
    setProfiles([]);
    try {
      const response = await fetch(`${API_URL}/api/networking/fetch-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: searchRole, company: searchCompany, experience: searchExp || '0-2 years' })
      });
      const data = await response.json();
      setProfiles(Array.isArray(data) ? data : []);
    } catch(err) {
      console.error(err);
    }
    setLoadingRadar(false);
    setHasSearched(true);
  };

  const filteredProfiles = profiles.filter(p => {
    if (activeFilter === 'All') return true;
    const str = (p.current_role || "").toLowerCase();
    if (activeFilter === 'HR') return str.includes('hr') || str.includes('talent') || str.includes('recruiter');
    if (activeFilter === 'SDE') return str.includes('sde') || str.includes('engineer') || str.includes('developer');
    if (activeFilter === 'Lead') return str.includes('lead') || str.includes('manager') || str.includes('principal') || str.includes('staff') || str.includes('head');
    return true;
  });

  const generateOutreach = async () => {
    if (!companyName.trim() || !targetRole.trim()) return;
    setLoading(true);
    setOutreachData(null);
    const resumeContext = localStorage.getItem('userResumeContext') || "Skills: React, Node.js, Systems Design.";
    
    try {
      const response = await fetch(`${API_URL}/api/generate-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, targetRole, managerName, resumeContext })
      });
      const data = await response.json();
      if (response.ok) setOutreachData(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="layout-col page-fade-in opportunities-page">
      <div className="header-box" style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', display: 'flex', alignItems: 'center', gap: '15px', color: '#FFFFFF' }}>
          <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#3366FF" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v4"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
          Networking Hub
        </h1>
        <p>JARVIS Automated Outreach & Smart Connections</p>
      </div>

      <div className="glass panel" style={{ marginBottom: '30px', border: '1px solid var(--accent-primary)', boxShadow: '0 0 20px rgba(0,255,255,0.05)' }}>
        <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.4rem' }}>Smart Connections Engine</h3>
        <div className="input-group-row">
          <input 
            type="text" 
            placeholder="Field / Role (e.g. SDE, Data)" 
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Company (e.g. Google)" 
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Experience (e.g. 0-2 yrs)" 
            value={searchExp}
            onChange={(e) => setSearchExp(e.target.value)}
          />
        </div>
        <button 
          className="action-btn" 
          disabled={loadingRadar || !searchCompany || !searchRole}
          onClick={handleNetworkSearch}
          style={{ marginTop: '20px', width: '100%', fontFamily: '"Space Grotesk", sans-serif', fontWeight: '600' }}
        >
          {loadingRadar ? 'Scanning Architectures...' : 'Deploy Network Radar'}
        </button>
      </div>

      <AnimatePresence mode="wait">
         {loadingRadar && (
            <motion.div key="radar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'relative', height: '200px', marginBottom: '30px' }}>
                <div className="radar-container">
                   <div className="radar-sweep"></div>
                </div>
                <p style={{ textAlign: 'center', color: 'var(--accent-primary)', fontFamily: '"Space Grotesk", sans-serif', marginTop: '170px', fontWeight: 'bold', letterSpacing: '1px' }}>Searching LinkedIn Network...</p>
            </motion.div>
         )}

         {!loadingRadar && hasSearched && profiles.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', marginBottom: '30px' }}>
                <p style={{ color: 'var(--accent-secondary)', fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.2rem', fontWeight: 'bold' }}>No Targets Found. Radar clear.</p>
            </motion.div>
         )}

         {!loadingRadar && profiles.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ marginBottom: '40px' }}>
               <div className="filter-tabs">
                 {['All', 'HR', 'SDE', 'Lead'].map(f => (
                    <button key={f} className={activeFilter === f ? 'active' : ''} onClick={() => setActiveFilter(f)} style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                       Only {f === 'All' ? 'All' : f + "s"}
                    </button>
                 ))}
               </div>
               
               <div className="network-grid">
                  <AnimatePresence>
                    {filteredProfiles.map((p, i) => (
                       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={i} className="profile-card">
                           <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                               <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', margin: '0 0 10px 0', fontSize: '16px', color: '#FFFFFF' }}>{p.name}</h3>
                               <span style={{ background: 'rgba(51, 102, 255, 0.1)', color: '#3366FF', padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', border: '1px solid #3366FF' }}>{p.match_score}</span>
                            </div>
                            <p style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#71717A', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>{p.current_role}</p>
                          </div>
                          <button onClick={() => window.open(p.profile_url, '_blank')} className="action-btn" style={{ background: 'transparent', border: '1px solid #1A1A1A', color: '#FFFFFF', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '24px', cursor: 'pointer', fontFamily: '"Space Grotesk", sans-serif', fontWeight: '600', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> View Profile
                          </button>
                       </motion.div>
                    ))}
                  </AnimatePresence>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="glass panel" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.4rem' }}>Outreach Generator</h3>
        <div className="input-group-row">
          <input 
            type="text" 
            placeholder="Company Name (e.g. Google)" 
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Target Role (e.g. Frontend Intern)" 
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Hiring Manager Name (Optional)" 
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
          />
        </div>
        <button 
          className="action-btn" 
          disabled={loading || !companyName || !targetRole}
          onClick={generateOutreach}
          style={{ marginTop: '20px', width: '100%', fontFamily: '"Space Grotesk", sans-serif', fontWeight: '600' }}
        >
          {loading ? 'Drafting your message...' : 'Generate Outreach'}
        </button>
      </div>

      {outreachData && (
        <div className="outreach-cards-container">
          <div className="glass panel card-linkedin">
            <div className="card-header-outreach">
              <h3>LinkedIn Invite</h3>
              <button className="copy-btn" onClick={() => copyToClipboard(outreachData.linkedin, 'li')}>
                {copiedId === 'li' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="char-count">{outreachData.linkedin.length}/300 chars</p>
            <div className="outreach-body">{outreachData.linkedin}</div>
          </div>

          <div className="glass panel card-email">
            <div className="card-header-outreach">
              <h3>Cold Email</h3>
              <button className="copy-btn" onClick={() => copyToClipboard(`Subject: ${outreachData.email.subject}\n\n${outreachData.email.body}`, 'em')}>
                {copiedId === 'em' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="outreach-body">
              <strong>Subject:</strong> {outreachData.email.subject}
              <hr style={{ borderColor: 'var(--glass-border)', margin: '10px 0' }}/>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{outreachData.email.body}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NetworkingHub;
