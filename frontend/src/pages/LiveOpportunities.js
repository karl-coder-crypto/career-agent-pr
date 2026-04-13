import React, { useState } from 'react';

function LiveOpportunities({ API_URL }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [skills, setSkills] = useState('');
  const [role, setRole] = useState('');
  const [jobType, setJobType] = useState('Job');
  const [duration, setDuration] = useState('6 Months+');
  const [location, setLocation] = useState('Remote');

  const handleLiveSearch = async () => {
    if (!skills.trim() || !role.trim()) {
      alert("Please define core skills and preferred roles to initialize scanning protocol.");
      return;
    }
    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`${API_URL}/api/get-live-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, role, jobType, duration, location })
      });
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-col page-fade-in opportunities-page">
      <div className="header-box">
        <h1>Real-Time Job Hunter</h1>
        <p>Manually configure parameters referencing Live Web Extraction metrics.</p>
      </div>
      
      <div className="glass filter-container" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="input-group-row">
          <input type="text" placeholder="Desired Role (e.g. SDE Intern, Frontend Developer)" value={role} onChange={e => setRole(e.target.value)} />
          <input type="text" placeholder="Core Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <select value={jobType} onChange={e => setJobType(e.target.value)} className="glass-dropdown">
            <option value="Free Internship">Free Internship</option>
            <option value="Paid Internship">Paid Internship</option>
            <option value="Job">Job</option>
          </select>
          
          <select value={duration} onChange={e => setDuration(e.target.value)} className="glass-dropdown">
            <option value="1 Month">1 Month</option>
            <option value="3 Months">3 Months</option>
            <option value="6 Months+">6 Months+</option>
          </select>

          <select value={location} onChange={e => setLocation(e.target.value)} className="glass-dropdown">
            <option value="Remote">Remote</option>
            <option value="Office">Office</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        
        <button onClick={handleLiveSearch} className="action-btn neon-glow-btn" disabled={loading} style={{ alignSelf: 'flex-end', marginTop: '10px' }}>
          {loading ? 'Scanning Real-Time Network...' : 'Commence Hunter Protocol'}
        </button>
      </div>

      <div className="job-grid">
        {!hasSearched ? (
           <p style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1', opacity: 0.7 }}>Awaiting Search Protocol Implementation...</p>
        ) : loading ? (
           <p className="processing-text" style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>Querying Neural Aggregates...</p> 
        ) : jobs.length === 0 ? (
           <p style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>No live roles matching conditions found. Broaden search constraints.</p>
        ) : (
           jobs.map((job, idx) => (
             <div key={idx} className="job-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="job-logo">
                    {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'X'}
                  </div>
                  <div className="job-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                     <h3 className="job-company">{job.companyName}</h3>
                     <span className="job-role" style={{ fontSize: '0.9rem', opacity: '0.8' }}>{job.duration}</span>
                  </div>
                </div>
                <div>
                  <div className="job-role" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{job.role}</div>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
                    <span>{job.stipend}</span>
                  </div>
                </div>
                <button className="action-btn neon-glow-btn apply-btn" onClick={() => window.open(job.url || '#', '_blank')} style={{ marginTop: 'auto' }}>
                   Apply Now
                </button>
             </div>
           ))
        )}
      </div>
    </div>
  );
}

export default LiveOpportunities;
