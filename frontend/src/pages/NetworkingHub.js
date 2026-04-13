import React, { useState } from 'react';

function NetworkingHub({ API_URL }) {
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [managerName, setManagerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [outreachData, setOutreachData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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
      <div className="header-box">
        <h1>Networking Hub</h1>
        <p>Aegis Automated Outreach Generator</p>
      </div>

      <div className="glass panel">
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
          className="action-btn neon-glow-btn" 
          disabled={loading || !companyName || !targetRole}
          onClick={generateOutreach}
          style={{ marginTop: '20px', width: '100%' }}
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
