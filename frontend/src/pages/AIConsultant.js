import React, { useState, useEffect } from 'react';

function AIConsultant({ API_URL }) {
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history`);
      const data = await response.json();
      setHistory(data);
    } catch (error) { }
  };

  const runAgent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/analyze-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: company, mySkills: skills })
      });
      const data = await response.json();
      setResult(data.message);
      fetchHistory(); // Immediate update to show 'Pending' state
      
      // Auto-refresh the registry after 4 seconds to catch the AI processing completion
      setTimeout(() => {
        fetchHistory();
      }, 4000);
    } catch (error) {
      setResult("Protocol connection failed.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="layout-col page-fade-in">
      <div className="header-box">
        <h1>Career Agent Pro</h1>
        <p>Aegis Protocol Standby</p>
      </div>

      <div className="glass panel">
        <input value={company} placeholder="Identify Target Org" onChange={(e) => setCompany(e.target.value)} />
        <textarea value={skills} placeholder="Input Competencies" onChange={(e) => setSkills(e.target.value)} />
        <button disabled={loading} onClick={runAgent} className="action-btn">
          {loading ? 'Processing...' : 'Engage Agent'}
        </button>
        {result && <div className="feedback-banner">{result}</div>}
      </div>

      <div className="archive-section">
        <h2>Market Registry</h2>
        <div className="glass pad-0">
          {history.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>Vector</th>
                  <th>Status</th>
                  <th>Analysis Feedback</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.companyName}</td>
                    <td className="trunc">{item.userSkills}</td>
                    <td>
                      <span className={item.isVerified ? 'badge valid' : 'badge sync'}>
                        {item.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {item.analysis ? (
                        <div className="analysis-text">{item.analysis}</div>
                      ) : (
                        <div className="processing-text">Processing...</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">Registry empty.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIConsultant;
