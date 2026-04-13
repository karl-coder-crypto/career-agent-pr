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

  // SVG Logic for Circular Progress
  const circleRadius = 50;
  const strokeWidth = 10;
  const normalizedRadius = circleRadius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Calculate dash offset based on actual score if available
  const strokeDashoffset = analysisResult ? circumference - (analysisResult.score / 100) * circumference : circumference;

  return (
    <div className="layout-col page-fade-in opportunities-page">
       <div className="header-box">
        <h1>ATS Scanner</h1>
        <p>Aegis Protocol Document Parsing</p>
      </div>

      <div className="glass panel">
         <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
           Paste your raw resume content below to evaluate syntax, keyword compatibility, and structural formatting against standard ATS systems.
         </p>
         <textarea 
           value={resumeText} 
           placeholder="Paste raw resume text here..." 
           onChange={(e) => setResumeText(e.target.value)} 
           style={{ minHeight: '180px' }}
         />
         <button disabled={loading} onClick={analyzeResume} className="action-btn">
          {loading ? 'Scanning Document...' : 'Analyze Resume'}
        </button>
        {errorMsg && <div className="feedback-banner" style={{borderColor: 'red', color: '#ff6b6b'}}>{errorMsg}</div>}
      </div>

      {analysisResult && (
        <div className="archive-section" style={{ animation: 'pageFadeIn 0.5s ease forwards' }}>
          <h2>Evaluation Complete</h2>
          <div className="glass ats-result-grid">
            
            <div className="score-container">
              <svg height={circleRadius * 2} width={circleRadius * 2} className="score-ring">
                <circle
                   stroke="rgba(0,0,0,0.2)"
                   fill="transparent"
                   strokeWidth={strokeWidth}
                   r={normalizedRadius}
                   cx={circleRadius}
                   cy={circleRadius}
                />
                <circle
                   stroke="var(--accent-primary)"
                   fill="transparent"
                   strokeWidth={strokeWidth}
                   strokeDasharray={circumference + ' ' + circumference}
                   style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s ease-out' }}
                   strokeLinecap="round"
                   r={normalizedRadius}
                   cx={circleRadius}
                   cy={circleRadius}
                />
              </svg>
              <div className="score-text-overlay">
                <span className="score-num">{analysisResult.score}</span>
                <span className="score-label">/ 100</span>
              </div>
            </div>

            <div className="ats-details">
              <h4>Missing Critical Nodes</h4>
              <div className="keyword-pill-container">
                {analysisResult.missingKeywords.map((kw, i) => (
                  <span key={i} className="keyword-pill">{kw}</span>
                ))}
              </div>

              <h4 style={{ marginTop: '20px' }}>Aegis Improvement Suggestions</h4>
              <ul className="suggestion-list">
                {analysisResult.suggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeChecker;
