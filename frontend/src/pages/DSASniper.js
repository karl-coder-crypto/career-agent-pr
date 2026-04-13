import React, { useState, useEffect } from 'react';

function DSASniper({ API_URL }) {
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem('dsa-names');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [topic, setTopic] = useState('');
  const [company, setCompany] = useState('Any MNC');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  useEffect(() => {
    localStorage.setItem('dsa-names', JSON.stringify(completed));
  }, [completed]);

  const toggleProblem = (name) => {
    setCompleted(prev => 
      prev.includes(name) ? prev.filter(pName => pName !== name) : [...prev, name]
    );
  };

  const handleSearch = async () => {
    if (!topic.trim()) {
      alert("Specify an algorithmic framework or topic (e.g., Dynamic Programming, Trees) to parse indices.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/get-dsa-problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, company })
      });
      const data = await response.json();
      setProblems(Array.isArray(data) ? data : []);
    } catch (err) {
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (problemName) => {
    setLoadingExplain(true);
    setExplanation({ title: problemName, text: "Generating neural intuition matrices..." });
    try {
      const response = await fetch(`${API_URL}/api/explain-dsa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemName })
      });
      const data = await response.json();
      setExplanation({ title: problemName, text: data.reply });
    } catch (err) {
      setExplanation({ title: problemName, text: "Explanation offline." });
    } finally {
      setLoadingExplain(false);
    }
  };

  const generateLink = (type, problemName) => {
    const encoded = encodeURIComponent(problemName);
    if (type === 'solve') return `https://leetcode.com/problemset/all/?search=${encoded}`;
    if (type === 'discuss') return `https://leetcode.com/discuss/interview-question?currentPage=1&orderBy=hot&query=${encoded}`;
    return '#';
  };

  return (
    <div className="layout-col page-fade-in opportunities-page">
      <div className="header-box">
        <h1>DSA Sniper Dashboard</h1>
        <p>Unlimited Web-Indexed Architecture Execution Algorithm Tracker.</p>
      </div>

      <div className="progress-container glass" style={{ padding: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Lifetime Algorithms Mastered</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success-neon)', textShadow: '0 0 20px var(--success-neon)' }}>
            {completed.length}
          </div>
        </div>
      </div>

      <div className="glass filter-container" style={{ padding: '20px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
         <div className="input-group-row">
          <input type="text" placeholder="Algorithm Topic (e.g., Backtracking, Arrays, Fast & Slow Pointers)" value={topic} onChange={e => setTopic(e.target.value)} />
          <select value={company} onChange={e => setCompany(e.target.value)} className="glass-dropdown" style={{ flex: '0.4' }}>
            <option value="Any MNC">Any MNC</option>
            <option value="Google">Google</option>
            <option value="Amazon">Amazon</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Meta">Meta</option>
            <option value="Apple">Apple</option>
            <option value="TCS/Infosys">TCS / Infosys</option>
          </select>
        </div>
        <button onClick={handleSearch} className="action-btn neon-glow-btn" disabled={loading} style={{ alignSelf: 'flex-end', marginTop: '10px' }}>
          {loading ? 'Executing Indexing Sweep...' : 'Deploy Sniper Search'}
        </button>
      </div>

      <div className="dsa-grid" style={{ minHeight: '200px' }}>
        {loading ? (
           <p className="processing-text" style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>Accessing proprietary problem datasets natively...</p> 
        ) : problems.length === 0 ? (
           <p style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1', opacity: 0.7 }}>Awaiting search query configuration.</p>
        ) : (
          <div className="glass dsa-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {problems.map((prob, idx) => (
                <div key={idx} className="dsa-problem-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <input 
                      type="checkbox" 
                      checked={completed.includes(prob.name)} 
                      onChange={() => toggleProblem(prob.name)} 
                      className="dsa-checkbox"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '1.2rem', color: completed.includes(prob.name) ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: completed.includes(prob.name) ? 'line-through' : 'none', fontWeight: 'bold' }}>
                        {prob.name}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: prob.difficulty === 'Easy' ? 'var(--success-neon)' : prob.difficulty === 'Medium' ? 'var(--accent-primary)' : 'var(--accent-secondary)' }}>
                        {prob.difficulty || 'Unrated'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="power-btn" onClick={() => window.open(generateLink('discuss', prob.name), '_blank')}>📑 Discuss</button>
                    <button className="power-btn" onClick={() => handleExplain(prob.name)}>💡 AI Approach</button>
                    <button className="power-btn solve" onClick={() => window.open(generateLink('solve', prob.name), '_blank')}>🚀 LeetCode</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {explanation && (
        <div className="explanation-modal-overlay" onClick={() => !loadingExplain && setExplanation(null)}>
          <div className="explanation-modal glass" onClick={e => e.stopPropagation()}>
             <h3 style={{ borderBottom: '1px solid var(--accent-primary)', paddingBottom: '10px', marginBottom: '15px' }}>{explanation.title}</h3>
             <div className="explanation-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {explanation.text}
             </div>
             <button className="action-btn" onClick={() => setExplanation(null)} style={{ marginTop: '20px', width: '100%' }} disabled={loadingExplain}>
               Dismiss
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DSASniper;
