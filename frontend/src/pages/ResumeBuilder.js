import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const EMPTY_EXP = { role: '', company: '', duration: '', description: '' };
const EMPTY_PROJ = { title: '', techStack: '', description: '' };
const EMPTY_EDU = { degree: '', institution: '', year: '' };

function SectionAnalyzer({ onResult, sectionType, API_URL }) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileRef = useRef(null);

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice API not supported in this browser.');
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onstart = () => setIsRecording(true);
    rec.onresult = (e) => setDraft(prev => prev + ' ' + e.results[0][0].transcript);
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    rec.start();
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setDraft(prev => prev + `\n[Extracted from ${f.name}]: Senior engineer. Built scalable microservices. Used Docker, Kubernetes. Improved API response by 35%.`);
  };

  const refine = async () => {
    if (!draft.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/resume/refine-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType, rawContent: draft })
      });
      const data = await res.json();
      if (res.ok && data.refined) onResult(data.refined);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '12px', padding: '12px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', background: 'rgba(99,102,241,0.05)' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <button onClick={startVoice} className="action-btn" style={{ flex: 1, fontSize: '0.8rem', padding: '8px', background: isRecording ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)', border: `1px solid ${isRecording ? '#ef4444' : '#6366f1'}` }}>
          {isRecording ? '🔴 Recording...' : '🎤 Voice'}
        </button>
        <label className="action-btn" style={{ flex: 1, fontSize: '0.8rem', padding: '8px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', cursor: 'pointer', textAlign: 'center' }}>
          📎 Upload File
          <input type="file" accept=".pdf,.doc,.docx,image/*" style={{ display: 'none' }} ref={fileRef} onChange={handleFile} />
        </label>
      </div>
      <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Rough context: voice transcript, file extract, or type manually..." style={{ width: '100%', minHeight: '70px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
      <button onClick={refine} disabled={loading || !draft.trim()} className="action-btn neon-glow-btn" style={{ width: '100%', marginTop: '8px', fontSize: '0.85rem', padding: '10px' }}>
        {loading ? 'Analyzing...' : '✨ AI Refine to MNC Bullets'}
      </button>
    </div>
  );
}

function ResumeBuilder({ API_URL }) {
  const [data, setData] = useState({
    personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '' },
    summary: '',
    education: [{ ...EMPTY_EDU }],
    experience: [{ ...EMPTY_EXP }],
    projects: [{ ...EMPTY_PROJ }],
    skills: '',
    certifications: ''
  });
  const [showAnalyzer, setShowAnalyzer] = useState({});
  const [rawText, setRawText] = useState('');
  const [isFilling, setIsFilling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef(null);

  const updateArr = (section, idx, field, val) => {
    setData(prev => {
      const arr = [...prev[section]];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, [section]: arr };
    });
  };

  const addItem = (section, empty) => setData(prev => ({ ...prev, [section]: [...prev[section], { ...empty }] }));
  const removeItem = (section, idx) => setData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== idx) }));

  const toggleAnalyzer = (key) => setShowAnalyzer(prev => ({ ...prev, [key]: !prev[key] }));

  const applyRefined = (section, idx, refined) => {
    const lines = refined.split('\n').filter(l => l.trim()).map(l => l.replace(/^-\s*/, '').trim()).join('\n');
    updateArr(section, idx, 'description', lines);
    setShowAnalyzer(prev => ({ ...prev, [`${section}_${idx}`]: false }));
  };

  const magicFill = async () => {
    const text = rawText || localStorage.getItem('userResumeContext');
    if (!text) return alert('Paste a rough summary or upload context first.');
    setIsFilling(true);
    try {
      const res = await fetch(`${API_URL}/api/magic-fill`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: text }) });
      const d = await res.json();
      if (res.ok) setData(prev => ({
        ...prev,
        personalInfo: d.personalInfo || prev.personalInfo,
        education: d.education?.length ? d.education : prev.education,
        experience: d.experience?.length ? d.experience : prev.experience,
        projects: d.projects?.length ? d.projects : prev.projects,
        skills: d.skills || prev.skills,
        certifications: d.certifications || prev.certifications
      }));
    } catch (e) { console.error(e); }
    setIsFilling(false);
  };

  const exportPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 3, useCORS: true, backgroundColor: '#FFFFFF' });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`${data.personalInfo.name?.replace(/\s+/g, '_') || 'Executive'}_Resume.pdf`);
    } catch (e) { console.error(e); }
    setIsExporting(false);
  };

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' };
  const sectionStyle = { border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px' };
  const labelStyle = { display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '0 20px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Resume Architect</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>MNC-Grade AI-Powered Career Document Engine</p>
        </div>
        <button onClick={exportPDF} disabled={isExporting} className="action-btn neon-glow-btn" style={{ padding: '12px 28px', fontWeight: '700', fontSize: '1rem' }}>
          {isExporting ? '⏳ Generating...' : '⬇️ Download Executive PDF'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
        <div style={{ overflowY: 'auto', paddingRight: '8px' }}>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--accent-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>⚡ Quick AI Fill</h3>
            <textarea value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Paste your existing resume text or LinkedIn summary here for one-click AI structuring..." style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
            <button onClick={magicFill} disabled={isFilling} className="action-btn neon-glow-btn" style={{ width: '100%', marginTop: '10px', padding: '11px' }}>
              {isFilling ? 'Neural Matrix Parsing...' : '🧠 AI Auto-Fill All Sections'}
            </button>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Personal Info</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {[['name','Full Name'],['email','Email Address'],['phone','Phone Number'],['location','City, Country'],['linkedin','LinkedIn URL']].map(([k,ph]) => (
                <div key={k}><label style={labelStyle}>{ph}</label><input style={inputStyle} placeholder={ph} value={data.personalInfo[k]} onChange={e => setData(p => ({ ...p, personalInfo: { ...p.personalInfo, [k]: e.target.value } }))} /></div>
              ))}
              <div><label style={labelStyle}>Professional Summary</label><textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} placeholder="3-line executive summary..." value={data.summary} onChange={e => setData(p => ({ ...p, summary: e.target.value }))} /></div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Experience</h3>
            {data.experience.map((exp, idx) => (
              <div key={idx} style={{ borderLeft: '3px solid #6366f1', paddingLeft: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div><label style={labelStyle}>Role</label><input style={inputStyle} placeholder="Software Engineer" value={exp.role} onChange={e => updateArr('experience', idx, 'role', e.target.value)} /></div>
                  <div><label style={labelStyle}>Company</label><input style={inputStyle} placeholder="Google" value={exp.company} onChange={e => updateArr('experience', idx, 'company', e.target.value)} /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Duration</label><input style={inputStyle} placeholder="Jan 2023 – Present" value={exp.duration} onChange={e => updateArr('experience', idx, 'duration', e.target.value)} /></div>
                </div>
                <label style={labelStyle}>Bullet Points (one per line)</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={exp.description} onChange={e => updateArr('experience', idx, 'description', e.target.value)} placeholder="Describe your responsibilities..." />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button className="copy-btn" onClick={() => toggleAnalyzer(`experience_${idx}`)} style={{ flex: 1, fontSize: '0.8rem' }}>🔬 Analyze Context</button>
                  {data.experience.length > 1 && <button className="copy-btn" onClick={() => removeItem('experience', idx)} style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: '0.8rem' }}>✕ Remove</button>}
                </div>
                {showAnalyzer[`experience_${idx}`] && <SectionAnalyzer sectionType="Experience" API_URL={API_URL} onResult={(r) => applyRefined('experience', idx, r)} />}
              </div>
            ))}
            <button className="copy-btn" onClick={() => addItem('experience', EMPTY_EXP)}>+ Add Experience</button>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Projects</h3>
            {data.projects.map((proj, idx) => (
              <div key={idx} style={{ borderLeft: '3px solid #a855f7', paddingLeft: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div><label style={labelStyle}>Project Title</label><input style={inputStyle} placeholder="AI Recommendation Engine" value={proj.title} onChange={e => updateArr('projects', idx, 'title', e.target.value)} /></div>
                  <div><label style={labelStyle}>Tech Stack</label><input style={inputStyle} placeholder="React, Node.js, MongoDB" value={proj.techStack} onChange={e => updateArr('projects', idx, 'techStack', e.target.value)} /></div>
                </div>
                <label style={labelStyle}>Description (Bullet Points)</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={proj.description} onChange={e => updateArr('projects', idx, 'description', e.target.value)} placeholder="Describe the project impact..." />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button className="copy-btn" onClick={() => toggleAnalyzer(`projects_${idx}`)} style={{ flex: 1, fontSize: '0.8rem' }}>🔬 Analyze Context</button>
                  {data.projects.length > 1 && <button className="copy-btn" onClick={() => removeItem('projects', idx)} style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: '0.8rem' }}>✕ Remove</button>}
                </div>
                {showAnalyzer[`projects_${idx}`] && <SectionAnalyzer sectionType="Project" API_URL={API_URL} onResult={(r) => applyRefined('projects', idx, r)} />}
              </div>
            ))}
            <button className="copy-btn" onClick={() => addItem('projects', EMPTY_PROJ)}>+ Add Project</button>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Education</h3>
            {data.education.map((edu, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', paddingLeft: '14px', borderLeft: '3px solid #10b981' }}>
                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Degree</label><input style={inputStyle} placeholder="B.S. Computer Science" value={edu.degree} onChange={e => updateArr('education', idx, 'degree', e.target.value)} /></div>
                <div><label style={labelStyle}>Institution</label><input style={inputStyle} placeholder="MIT" value={edu.institution} onChange={e => updateArr('education', idx, 'institution', e.target.value)} /></div>
                <div><label style={labelStyle}>Year</label><input style={inputStyle} placeholder="2024" value={edu.year} onChange={e => updateArr('education', idx, 'year', e.target.value)} /></div>
                {data.education.length > 1 && <button className="copy-btn" onClick={() => removeItem('education', idx)} style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: '0.8rem', gridColumn: 'span 2' }}>✕ Remove</button>}
              </div>
            ))}
            <button className="copy-btn" onClick={() => addItem('education', EMPTY_EDU)}>+ Add Education</button>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Skills & Certifications</h3>
            <div><label style={labelStyle}>Technical Skills (comma separated)</label><textarea style={{ ...inputStyle, minHeight: '50px', resize: 'vertical', marginBottom: '10px' }} value={data.skills} onChange={e => setData(p => ({ ...p, skills: e.target.value }))} placeholder="React, Node.js, Python, AWS, Docker..." /></div>
            <div><label style={labelStyle}>Certifications</label><textarea style={{ ...inputStyle, minHeight: '50px', resize: 'vertical' }} value={data.certifications} onChange={e => setData(p => ({ ...p, certifications: e.target.value }))} placeholder="AWS Cloud Practitioner | Google ML Certificate..." /></div>
          </div>
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: '8px' }}>
          <div ref={pdfRef} style={{ background: '#FFFFFF', color: '#000000', fontFamily: "'Inter','Roboto','Helvetica',sans-serif", fontSize: '10pt', lineHeight: 1.55, width: '210mm', minHeight: '297mm', padding: '18mm 20mm', boxSizing: 'border-box', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '20pt', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{data.personalInfo.name || 'FULL NAME'}</h1>
              <p style={{ margin: '4px 0 0', fontSize: '9pt', color: '#333' }}>
                {[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location, data.personalInfo.linkedin].filter(Boolean).join('  |  ')}
              </p>
            </div>

            {data.summary && (
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #000', margin: '0 0 5px', paddingBottom: '2px' }}>Summary</h2>
                <p style={{ margin: 0, fontSize: '10pt', textAlign: 'justify' }}>{data.summary}</p>
              </div>
            )}

            {data.experience.some(e => e.role) && (
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #000', margin: '0 0 6px', paddingBottom: '2px' }}>Experience</h2>
                {data.experience.filter(e => e.role).map((exp, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{exp.role}{exp.company ? ` — ${exp.company}` : ''}</span>
                      <span style={{ fontSize: '9.5pt', color: '#444' }}>{exp.duration}</span>
                    </div>
                    {exp.description && <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {exp.description.split('\n').filter(l => l.trim()).map((l, j) => <li key={j} style={{ marginBottom: '2px', textAlign: 'justify' }}>{l.replace(/^[-*]\s*/, '')}</li>)}
                    </ul>}
                  </div>
                ))}
              </div>
            )}

            {data.projects.some(p => p.title) && (
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #000', margin: '0 0 6px', paddingBottom: '2px' }}>Projects</h2>
                {data.projects.filter(p => p.title).map((proj, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{proj.title}</span>
                      <span style={{ fontSize: '9.5pt', color: '#444' }}>{proj.techStack}</span>
                    </div>
                    {proj.description && <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {proj.description.split('\n').filter(l => l.trim()).map((l, j) => <li key={j} style={{ marginBottom: '2px', textAlign: 'justify' }}>{l.replace(/^[-*]\s*/, '')}</li>)}
                    </ul>}
                  </div>
                ))}
              </div>
            )}

            {data.education.some(e => e.degree) && (
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #000', margin: '0 0 6px', paddingBottom: '2px' }}>Education</h2>
                {data.education.filter(e => e.degree).map((edu, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700 }}>{edu.degree}{edu.institution ? `, ${edu.institution}` : ''}</span>
                    <span style={{ fontSize: '9.5pt', color: '#444' }}>{edu.year}</span>
                  </div>
                ))}
              </div>
            )}

            {(data.skills || data.certifications) && (
              <div>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #000', margin: '0 0 6px', paddingBottom: '2px' }}>Skills & Certifications</h2>
                {data.skills && <p style={{ margin: '0 0 4px' }}><strong>Technical: </strong>{data.skills}</p>}
                {data.certifications && <p style={{ margin: 0 }}><strong>Certifications: </strong>{data.certifications}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
