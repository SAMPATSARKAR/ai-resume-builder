import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Printer, Save, ChevronLeft, ChevronRight, Layout, RefreshCw, Check } from 'lucide-react';
import './App.css';

export default function App() {
  const [resume, setResume] = useState({
    title: 'My Software Engineer Resume',
    fullName: 'Sampat Sarkar',
    role: 'Full Stack MERN Developer',
    email: 'sampat7123@gmail.com',
    phone: '+91 7044962141',
    location: 'Punjab, India',
    summary: 'Results-driven software engineer specializing in scalable backend RESTful APIs, JWT authentication, and pagination using the MERN stack.',
    experience: '• Engineered WanderLust rental booking platform implementing 20+ RESTful API routes and RBAC authorization.\n• Built Quick AI full-stack SaaS with credit system and stateless JWT auth.\n• Designed AI Resume Builder with server-side pagination and real-time live preview.',
    education: 'Bachelor of Technology in Computer Science & Engineering (LPU) — CGPA 8.05',
    skills: 'C++, JavaScript, React.js, Node.js, Express.js, MongoDB, RESTful APIs, Git, Docker',
    templateType: 'modern'
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Pagination state for template gallery
  const [templates, setTemplates] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const fetchTemplates = async (p = 1) => {
    setGalleryLoading(true);
    try {
      const res = await fetch(`/api/resumes?page=${p}&limit=3`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (galleryOpen) fetchTemplates(page);
  }, [galleryOpen, page]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResume((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiEnhance = async (section) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/resumes/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, text: resume[section] })
      });
      const data = await res.json();
      if (data.success) {
        setResume((prev) => ({ ...prev, [section]: data.enhanced }));
      }
    } catch (err) {
      alert('AI Enhance failed: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleLoadTemplate = (t) => {
    setResume(t);
    setGalleryOpen(false);
  };

  return (
    <div className="resume-builder-app">
      {/* Top Navbar */}
      <header className="builder-header">
        <div className="header-left">
          <FileText className="brand-icon" size={24} />
          <h1>AI Resume Builder</h1>
          <span className="pill-mern">MERN Stack</span>
        </div>

        <div className="header-actions">
          <button className="btn-gallery" onClick={() => setGalleryOpen(!galleryOpen)}>
            <Layout size={16} />
            <span>Browse Templates (Paginated)</span>
          </button>
          <button className="btn-save" onClick={handleSave}>
            {saveSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{saveSuccess ? 'Saved to DB' : 'Save Resume'}</span>
          </button>
          <button className="btn-print" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Print / PDF</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="builder-workspace">
        {/* Left: Input Editor Panel */}
        <div className="editor-panel">
          <div className="editor-card">
            <h3>Personal Information</h3>
            <div className="form-grid-2">
              <input type="text" name="fullName" placeholder="Full Name" value={resume.fullName} onChange={handleInputChange} />
              <input type="text" name="role" placeholder="Target Job Title / Role" value={resume.role} onChange={handleInputChange} />
              <input type="email" name="email" placeholder="Email Address" value={resume.email} onChange={handleInputChange} />
              <input type="text" name="phone" placeholder="Phone Number" value={resume.phone} onChange={handleInputChange} />
              <input type="text" name="location" placeholder="Location (City, Country)" value={resume.location} onChange={handleInputChange} className="col-span-2" />
            </div>

            <div className="template-select-row">
              <label>Resume Template Style:</label>
              <select name="templateType" value={resume.templateType} onChange={handleInputChange}>
                <option value="modern">Modern Professional</option>
                <option value="classic">Classic Executive</option>
                <option value="minimal">Minimal Clean</option>
              </select>
            </div>
          </div>

          <div className="editor-card">
            <div className="section-title-with-ai">
              <h3>Professional Summary</h3>
              <button className="btn-ai" onClick={() => handleAiEnhance('summary')} disabled={aiLoading}>
                <Sparkles size={14} />
                <span>{aiLoading ? 'Enhancing...' : 'AI Enhance Summary'}</span>
              </button>
            </div>
            <textarea name="summary" rows="3" value={resume.summary} onChange={handleInputChange} />
          </div>

          <div className="editor-card">
            <div className="section-title-with-ai">
              <h3>Experience & Projects</h3>
              <button className="btn-ai" onClick={() => handleAiEnhance('experience')} disabled={aiLoading}>
                <Sparkles size={14} />
                <span>{aiLoading ? 'Enhancing...' : 'AI Polish Bullets'}</span>
              </button>
            </div>
            <textarea name="experience" rows="5" value={resume.experience} onChange={handleInputChange} />
          </div>

          <div className="editor-card">
            <h3>Education & Coursework</h3>
            <textarea name="education" rows="2" value={resume.education} onChange={handleInputChange} />
          </div>

          <div className="editor-card">
            <h3>Technical Skills</h3>
            <input type="text" name="skills" value={resume.skills} onChange={handleInputChange} />
          </div>
        </div>

        {/* Right: Real-time Live Document Preview */}
        <div className="preview-panel">
          <div className={`resume-paper ${resume.templateType}`}>
            <div className="paper-header">
              <h2>{resume.fullName || 'Your Full Name'}</h2>
              <p className="paper-role">{resume.role || 'Target Role'}</p>
              <div className="paper-contact">
                {resume.email && <span>{resume.email}</span>}
                {resume.phone && <span>• {resume.phone}</span>}
                {resume.location && <span>• {resume.location}</span>}
              </div>
            </div>

            <div className="paper-divider"></div>

            {resume.summary && (
              <div className="paper-section">
                <h4>PROFESSIONAL SUMMARY</h4>
                <p>{resume.summary}</p>
              </div>
            )}

            {resume.experience && (
              <div className="paper-section">
                <h4>EXPERIENCE & PROJECTS</h4>
                <pre>{resume.experience}</pre>
              </div>
            )}

            {resume.education && (
              <div className="paper-section">
                <h4>EDUCATION</h4>
                <p>{resume.education}</p>
              </div>
            )}

            {resume.skills && (
              <div className="paper-section">
                <h4>TECHNICAL SKILLS</h4>
                <p>{resume.skills}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paginated Template Gallery Drawer */}
      {galleryOpen && (
        <div className="gallery-modal-backdrop" onClick={() => setGalleryOpen(false)}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-header">
              <h3>Community Resume Templates (Server-Side Paginated)</h3>
              <button className="btn-close" onClick={() => setGalleryOpen(false)}>✕</button>
            </div>

            {galleryLoading ? (
              <p className="loading-text">Loading templates...</p>
            ) : (
              <div className="template-cards-grid">
                {templates.map((item) => (
                  <div key={item._id} className="template-card">
                    <h4>{item.title}</h4>
                    <p className="template-role">Role: <strong>{item.role}</strong></p>
                    <p className="template-preview">{item.summary.slice(0, 80)}...</p>
                    <button className="btn-load-template" onClick={() => handleLoadTemplate(item)}>
                      Load This Template
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="gallery-pagination">
              <button
                className="btn-page"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                className="btn-page"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
