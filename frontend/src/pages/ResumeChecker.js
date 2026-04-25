import React, { useState } from 'react';

function ResumeChecker({ API_URL }) {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const analyzeResume = async () => {
    setErrorMsg('');
    if (resumeText.trim().length < 20) {
      setErrorMsg("Please paste a comprehensive block of your resume text.");
      return;
    }
    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });
      const data = await response.json();
      if (response.ok) {
        setAnalysisResult(data);
        localStorage.setItem('userResumeContext', resumeText);
      } else {
        setErrorMsg(data.error || "Analysis failed.");
      }
    } catch (error) {
      setErrorMsg("Network connection error. Server offline.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: '"Inter", "Space Grotesk", sans-serif', width: '100%', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Decode the Resume</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>Helix DNA Sequencing Engine</p>
        </div>
        <button 
          className="pulse-btn"
          onClick={analyzeResume} 
          disabled={loading}
          style={{
            background: 'linear-gradient(90deg, #3366FF, #A855F7)',
            color: '#FFFFFF',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '24px',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.4s ease-in-out',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
        >
          {loading ? 'SEQUENCING...' : 'INITIALIZE SCAN'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', gridAutoFlow: 'dense' }}>
        <div className="ats-card" style={{ gridColumn: 'span 2', padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', transition: 'all 0.4s ease-in-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600' }}>Raw DNA Input</h3>
             {errorMsg && <span style={{ color: '#ef4444', fontSize: '0.85rem', padding: '4px 12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)' }}>{errorMsg}</span>}
          </div>
          <textarea 
            value={resumeText} 
            placeholder="Paste raw resume text here to evaluate syntax and structural formatting..." 
            onChange={(e) => setResumeText(e.target.value)} 
            style={{ 
              flexGrow: 1, 
              minHeight: '250px', 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-primary)', 
              fontSize: '0.95rem', 
              resize: 'none', 
              outline: 'none',
              fontFamily: 'monospace',
              lineHeight: '1.6'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="ats-card" style={{ padding: '32px', borderRadius: '24px', transition: 'all 0.4s ease-in-out' }}>
            <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600' }}>Sequencing Depth</h3>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                <span>Alignment Score</span>
                <span style={{ fontWeight: 'bold' }}>{analysisResult ? analysisResult.score : 0}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--input-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${analysisResult ? analysisResult.score : 0}%`, 
                  background: 'linear-gradient(90deg, #3366FF, #A855F7)',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
            </div>
          </div>

          <div className="ats-card" style={{ padding: '32px', borderRadius: '24px', flexGrow: 1, transition: 'all 0.4s ease-in-out' }}>
            <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600' }}>ATS Metrics</h3>
            {analysisResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h4 style={{ color: '#A855F7', margin: '0 0 12px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Missing Nodes</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysisResult.missingKeywords.map((kw, i) => (
                      <span key={i} style={{ background: 'rgba(168, 85, 247, 0.05)', color: '#A855F7', padding: '6px 14px', borderRadius: '16px', fontSize: '0.85rem', border: '1px solid rgba(168, 85, 247, 0.2)', transition: 'all 0.4s ease-in-out' }}>{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ color: '#3366FF', margin: '0 0 12px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Optimization Rails</h4>
                  <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {analysisResult.suggestions.map((sug, i) => (
                      <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#3366FF', fontSize: '1.2rem', lineHeight: '1' }}>&bull;</span>
                        <span style={{ lineHeight: '1.5' }}>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-secondary)' }}></span>
                Awaiting DNA input sequence...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeChecker;
