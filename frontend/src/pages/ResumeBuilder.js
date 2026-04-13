import React, { useState, useRef } from 'react';
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
  
  const [isFilling, setIsFilling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef(null);

  const handleMagicFill = async () => {
    const rawText = localStorage.getItem('userResumeContext');
    if (!rawText) {
      alert("Please analyze a resume in the ATS Scanner first to establish context.");
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
        setData(generatedJSON);
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
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
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
    <div className="layout-col page-fade-in opportunities-page builder-page">
      <div className="header-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>ATS Resume Builder</h1>
          <p>Strict PDF compilation driven by Context</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="action-btn neon-glow-btn" onClick={handleMagicFill} disabled={isFilling}>
            {isFilling ? 'Parsing Neural Matrix...' : '✨ Magic AI Fill'}
          </button>
          <button className="action-btn" onClick={exportPDF} disabled={isExporting}>
            {isExporting ? 'Rasterizing...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="builder-split">
        <div className="glass panel editor-side">
          <h3>Personal Info</h3>
          <div className="input-group-row">
            <input type="text" placeholder="Full Name" value={data.personalInfo.name} onChange={e => updateRootField('personalInfo', 'name', e.target.value)} />
          </div>
          <div className="input-group-row">
            <input type="email" placeholder="Email" value={data.personalInfo.email} onChange={e => updateRootField('personalInfo', 'email', e.target.value)} />
            <input type="text" placeholder="Phone" value={data.personalInfo.phone} onChange={e => updateRootField('personalInfo', 'phone', e.target.value)} />
          </div>

          <h3>Experience</h3>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '15px', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '10px' }}>
              <div className="input-group-row">
                <input type="text" placeholder="Role" value={exp.role} onChange={e => updateNestedField('experience', idx, 'role', e.target.value)} />
                <input type="text" placeholder="Company" value={exp.company} onChange={e => updateNestedField('experience', idx, 'company', e.target.value)} />
                <input type="text" placeholder="Duration" value={exp.duration} onChange={e => updateNestedField('experience', idx, 'duration', e.target.value)} />
              </div>
              <textarea placeholder="Bullet points..." value={exp.description} onChange={e => updateNestedField('experience', idx, 'description', e.target.value)} style={{ minHeight: '60px' }}></textarea>
            </div>
          ))}
          <button className="copy-btn" onClick={() => addArrayItem('experience', { role: '', company: '', duration: '', description: '' })}>+ Add Experience</button>

          <h3 style={{ marginTop: '20px' }}>Projects</h3>
          {data.projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: '15px', borderLeft: '2px solid var(--accent-secondary)', paddingLeft: '10px' }}>
              <div className="input-group-row">
                <input type="text" placeholder="Project Title" value={proj.title} onChange={e => updateNestedField('projects', idx, 'title', e.target.value)} />
                <input type="text" placeholder="Tech Stack" value={proj.techStack} onChange={e => updateNestedField('projects', idx, 'techStack', e.target.value)} />
              </div>
              <textarea placeholder="Description" value={proj.description} onChange={e => updateNestedField('projects', idx, 'description', e.target.value)} style={{ minHeight: '60px' }}></textarea>
            </div>
          ))}
          <button className="copy-btn" onClick={() => addArrayItem('projects', { title: '', techStack: '', description: '' })}>+ Add Project</button>

          <h3 style={{ marginTop: '20px' }}>Education</h3>
          {data.education.map((edu, idx) => (
            <div key={idx} className="input-group-row">
              <input type="text" placeholder="Degree" value={edu.degree} onChange={e => updateNestedField('education', idx, 'degree', e.target.value)} />
              <input type="text" placeholder="Institution" value={edu.institution} onChange={e => updateNestedField('education', idx, 'institution', e.target.value)} />
              <input type="text" placeholder="Year" value={edu.year} onChange={e => updateNestedField('education', idx, 'year', e.target.value)} style={{ maxWidth: '100px' }} />
            </div>
          ))}
          <button className="copy-btn" onClick={() => addArrayItem('education', { degree: '', institution: '', year: '' })}>+ Add Education</button>

          <h3 style={{ marginTop: '20px' }}>Skills & Certifications</h3>
          <textarea placeholder="Skills (comma separated)" value={data.skills} onChange={e => setData({...data, skills: e.target.value})} style={{ minHeight: '50px' }}></textarea>
          <textarea placeholder="Certifications" value={data.certifications} onChange={e => setData({...data, certifications: e.target.value})} style={{ minHeight: '50px' }}></textarea>
        </div>

        <div className="preview-side">
          <div ref={pdfRef} className="ats-document">
            <h1 className="ats-name">{data.personalInfo.name || "YOUR NAME"}</h1>
            <p className="ats-contact">
              {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
              {data.personalInfo.email && data.personalInfo.phone && <span> | </span>}
              {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            </p>

            {data.experience.some(e => e.role) && (
              <div className="ats-section">
                <h2 className="ats-header">EXPERIENCE</h2>
                {data.experience.map((exp, i) => exp.role && (
                  <div key={i} className="ats-item">
                    <div className="ats-row">
                      <span className="ats-bold">{exp.role} - {exp.company}</span>
                      <span>{exp.duration}</span>
                    </div>
                    {exp.description && (
                      <ul className="ats-bullets">
                        {exp.description.split('\n').filter(l => l.trim()).map((line, j) => (
                          <li key={j}>{line.replace(/^-\s*/, '')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.projects.some(p => p.title) && (
              <div className="ats-section">
                <h2 className="ats-header">PROJECTS</h2>
                {data.projects.map((proj, i) => proj.title && (
                  <div key={i} className="ats-item">
                    <div className="ats-row">
                      <span className="ats-bold">{proj.title}</span>
                      <span>{proj.techStack}</span>
                    </div>
                    {proj.description && (
                      <ul className="ats-bullets">
                        {proj.description.split('\n').filter(l => l.trim()).map((line, j) => (
                          <li key={j}>{line.replace(/^-\s*/, '')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.education.some(e => e.degree) && (
              <div className="ats-section">
                <h2 className="ats-header">EDUCATION</h2>
                {data.education.map((edu, i) => edu.degree && (
                  <div key={i} className="ats-row">
                    <span className="ats-bold">{edu.degree}, {edu.institution}</span>
                    <span>{edu.year}</span>
                  </div>
                ))}
              </div>
            )}

            {(data.skills || data.certifications) && (
              <div className="ats-section">
                <h2 className="ats-header">SKILLS & CERTIFICATIONS</h2>
                {data.skills && <p><span className="ats-bold">Skills: </span>{data.skills}</p>}
                {data.certifications && <p><span className="ats-bold">Certifications: </span>{data.certifications}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
