import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function ResumeBuilder({ API_URL }) {
  const [data, setData] = useState({
    personalInfo: { name: '', email: '', phone: '' },
    education: [{ degree: '', institution: '', year: '' }],
    experience: [{ role: '', company: '', duration: '', description: '' }],
    projects: [{ title: '', techStack: '', description: '' }],
    skills: '',
    certifications: ''
  });
  
  const [rawText, setRawText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef(null);

  useEffect(() => {
    const cachedCtx = localStorage.getItem('userResumeContext');
    if (cachedCtx && !rawText) {
      setRawText(cachedCtx);
    }
  }, []);

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice API not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRawText((prev) => prev + " " + transcript);
    };
    recognition.onerror = (e) => {
      console.error(e);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRawText((prev) => prev + `\n[Simulated OCR extraction from ${file.name}]: Senior Software Engineer. Led a team of 4. Optimized database performance by 30%. Proficient in React, Node.js, and AWS. Certified Cloud Practitioner.\n`);
  };

  const handleMagicFill = async () => {
    if (!rawText.trim()) {
      alert("Please provide a summary via Voice, File, or Text first.");
      return;
    }
    setIsFilling(true);
    try {
      const response = await fetch(`${API_URL}/api/magic-fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: rawText })
      });
      const generatedJSON = await response.json();
      if (response.ok) {
        setData({
          personalInfo: generatedJSON.personalInfo || data.personalInfo,
          education: generatedJSON.education && generatedJSON.education.length > 0 ? generatedJSON.education : data.education,
          experience: generatedJSON.experience && generatedJSON.experience.length > 0 ? generatedJSON.experience : data.experience,
          projects: generatedJSON.projects && generatedJSON.projects.length > 0 ? generatedJSON.projects : data.projects,
          skills: generatedJSON.skills || data.skills,
          certifications: generatedJSON.certifications || data.certifications
        });
      }
    } catch (err) {
      console.error(err);
    }
    setIsFilling(false);
  };

  const exportPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 3, useCORS: true, backgroundColor: '#FFFFFF' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.personalInfo.name ? data.personalInfo.name.replace(/\s+/g, '_') : 'CareerPro'}_Resume.pdf`);
    } catch (err) {
      console.error(err);
    }
    
    setIsExporting(false);
  };

  const updateNestedField = (section, index, field, value) => {
    const updatedArray = [...data[section]];
    updatedArray[index][field] = value;
    setData({ ...data, [section]: updatedArray });
  };

  const addArrayItem = (section, emptyObj) => {
    setData({ ...data, [section]: [...data[section], emptyObj] });
  };

  const updateRootField = (section, field, value) => {
    setData({ ...data, [section]: { ...data[section], [field]: value } });
  };

  return (
    <div className="layout-col page-fade-in builder-page">
      <div className="header-box">
        <div>
          <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>MNC-Grade Resume Architect</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Automated structuring powered by Neural Context</p>
        </div>
      </div>

      <div className="builder-split">
        <div className="glass panel editor-side" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="collector-gateway" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--accent-secondary)' }}>1. Multi-Input Gateway (Collector)</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button 
                className="action-btn" 
                onClick={startVoiceRecording} 
                style={{ flex: 1, background: isRecording ? '#ef4444' : 'rgba(99, 102, 241, 0.2)', border: `1px solid ${isRecording ? '#ef4444' : '#6366f1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isRecording ? 'Recording...' : '🎤 Record Voice'}
              </button>
              
              <label className="action-btn" style={{ flex: 1, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                📄 Upload File (Mock)
                <input type="file" accept=".pdf,.doc,.docx,image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </div>
            <textarea 
              className="glass-input" 
              placeholder="Rough summary, parsed OCR text, or Voice transcript will appear here..." 
              value={rawText} 
              onChange={e => setRawText(e.target.value)} 
              style={{ minHeight: '120px', fontSize: '0.9rem' }}
            />
            <button className="action-btn neon-glow-btn" onClick={handleMagicFill} disabled={isFilling || !rawText} style={{ width: '100%', marginTop: '15px' }}>
              {isFilling ? 'Parsing Neural Matrix...' : '✨ AI AUTO-FILL'}
            </button>
          </div>

          <div style={{ padding: '0 5px' }}>
            <h3 style={{ marginBottom: '15px' }}>2. Manual Adjustments</h3>
            <div className="input-group-row">
              <input type="text" className="glass-input" placeholder="Full Name" value={data.personalInfo.name} onChange={e => updateRootField('personalInfo', 'name', e.target.value)} />
            </div>
            <div className="input-group-row">
              <input type="email" className="glass-input" placeholder="Email" value={data.personalInfo.email} onChange={e => updateRootField('personalInfo', 'email', e.target.value)} />
              <input type="text" className="glass-input" placeholder="Phone" value={data.personalInfo.phone} onChange={e => updateRootField('personalInfo', 'phone', e.target.value)} />
            </div>

            <h4 style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Experience</h4>
            {data.experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: '15px', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '10px' }}>
                <div className="input-group-row">
                  <input type="text" className="glass-input" placeholder="Role" value={exp.role} onChange={e => updateNestedField('experience', idx, 'role', e.target.value)} />
                  <input type="text" className="glass-input" placeholder="Company" value={exp.company} onChange={e => updateNestedField('experience', idx, 'company', e.target.value)} />
                  <input type="text" className="glass-input" placeholder="Duration" value={exp.duration} onChange={e => updateNestedField('experience', idx, 'duration', e.target.value)} />
                </div>
                <textarea className="glass-input" placeholder="Bullet points..." value={exp.description} onChange={e => updateNestedField('experience', idx, 'description', e.target.value)} style={{ minHeight: '60px' }}></textarea>
              </div>
            ))}
            <button className="copy-btn" onClick={() => addArrayItem('experience', { role: '', company: '', duration: '', description: '' })}>+ Add Experience</button>

            <h4 style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Projects</h4>
            {data.projects.map((proj, idx) => (
              <div key={idx} style={{ marginBottom: '15px', borderLeft: '2px solid var(--accent-secondary)', paddingLeft: '10px' }}>
                <div className="input-group-row">
                  <input type="text" className="glass-input" placeholder="Project Title" value={proj.title} onChange={e => updateNestedField('projects', idx, 'title', e.target.value)} />
                  <input type="text" className="glass-input" placeholder="Tech Stack" value={proj.techStack} onChange={e => updateNestedField('projects', idx, 'techStack', e.target.value)} />
                </div>
                <textarea className="glass-input" placeholder="Description" value={proj.description} onChange={e => updateNestedField('projects', idx, 'description', e.target.value)} style={{ minHeight: '60px' }}></textarea>
              </div>
            ))}
            <button className="copy-btn" onClick={() => addArrayItem('projects', { title: '', techStack: '', description: '' })}>+ Add Project</button>

            <h4 style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Education</h4>
            {data.education.map((edu, idx) => (
              <div key={idx} className="input-group-row">
                <input type="text" className="glass-input" placeholder="Degree" value={edu.degree} onChange={e => updateNestedField('education', idx, 'degree', e.target.value)} />
                <input type="text" className="glass-input" placeholder="Institution" value={edu.institution} onChange={e => updateNestedField('education', idx, 'institution', e.target.value)} />
                <input type="text" className="glass-input" placeholder="Year" value={edu.year} onChange={e => updateNestedField('education', idx, 'year', e.target.value)} style={{ maxWidth: '100px' }} />
              </div>
            ))}
            <button className="copy-btn" onClick={() => addArrayItem('education', { degree: '', institution: '', year: '' })}>+ Add Education</button>

            <h4 style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Skills & Certifications</h4>
            <textarea className="glass-input" placeholder="Skills (comma separated)" value={data.skills} onChange={e => setData({...data, skills: e.target.value})} style={{ minHeight: '50px', marginBottom: '10px' }}></textarea>
            <textarea className="glass-input" placeholder="Certifications" value={data.certifications} onChange={e => setData({...data, certifications: e.target.value})} style={{ minHeight: '50px' }}></textarea>
          </div>
        </div>

        <div className="preview-side" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <button className="action-btn" onClick={exportPDF} disabled={isExporting} style={{ width: '100%', maxWidth: '210mm', background: '#FFFFFF', color: '#000', fontWeight: 'bold' }}>
            {isExporting ? 'Rasterizing PDF...' : '⬇️ Download MNC PDF'}
          </button>
          
          <div ref={pdfRef} className="mnc-pdf-preview">
            <h1 className="mnc-name">{data.personalInfo.name || "YOUR NAME"}</h1>
            <p className="mnc-contact">
              {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
              {data.personalInfo.email && data.personalInfo.phone && <span> | </span>}
              {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            </p>

            {data.experience.some(e => e.role) && (
              <div className="mnc-section">
                <h2 className="mnc-header">EXPERIENCE</h2>
                {data.experience.map((exp, i) => exp.role && (
                  <div key={i} className="mnc-item">
                    <div className="mnc-row">
                      <span className="mnc-bold">{exp.role} - {exp.company}</span>
                      <span>{exp.duration}</span>
                    </div>
                    {exp.description && (
                      <ul className="mnc-bullets">
                        {exp.description.split('\n').filter(l => l.trim()).map((line, j) => {
                          const cleanLine = line.replace(/^-\s*/, '').replace(/^\*\s*/, '');
                          return cleanLine ? <li key={j}>{cleanLine}</li> : null;
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.projects.some(p => p.title) && (
              <div className="mnc-section">
                <h2 className="mnc-header">PROJECTS</h2>
                {data.projects.map((proj, i) => proj.title && (
                  <div key={i} className="mnc-item">
                    <div className="mnc-row">
                      <span className="mnc-bold">{proj.title}</span>
                      <span>{proj.techStack}</span>
                    </div>
                    {proj.description && (
                      <ul className="mnc-bullets">
                        {proj.description.split('\n').filter(l => l.trim()).map((line, j) => {
                           const cleanLine = line.replace(/^-\s*/, '').replace(/^\*\s*/, '');
                           return cleanLine ? <li key={j}>{cleanLine}</li> : null;
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.education.some(e => e.degree) && (
              <div className="mnc-section">
                <h2 className="mnc-header">EDUCATION</h2>
                {data.education.map((edu, i) => edu.degree && (
                  <div key={i} className="mnc-item mnc-row">
                    <span className="mnc-bold">{edu.degree}, {edu.institution}</span>
                    <span>{edu.year}</span>
                  </div>
                ))}
              </div>
            )}

            {(data.skills || data.certifications) && (
              <div className="mnc-section">
                <h2 className="mnc-header">SKILLS & CERTIFICATIONS</h2>
                {data.skills && <div className="mnc-item"><span className="mnc-bold">Skills: </span>{data.skills}</div>}
                {data.certifications && <div className="mnc-item"><span className="mnc-bold">Certifications: </span>{data.certifications}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
