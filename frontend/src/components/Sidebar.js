import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/auth');
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="hamburger" onClick={toggleSidebar}>
        {isOpen ? (
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        )}
      </button>

      <div className={`sidebar glass ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <svg width="30" height="30" viewBox="0 0 120 120" style={{color: 'var(--accent-primary)', marginRight: '10px'}}>
             <polygon points="60,10 110,60 60,110 10,60" fill="currentColor" opacity="0.8" />
          </svg>
          Aegis Core
        </div>
        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', paddingBottom: '20px' }}>
          {!currentUser ? (
            <NavLink to="/auth" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)} style={{ marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', color: 'var(--text-primary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Login / Register
            </NavLink>
          ) : (
            <div className="nav-link" style={{ cursor: 'default', color: 'var(--accent-secondary)', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {currentUser.name || 'Verified Identity'}
            </div>
          )}
          <NavLink to="/consultant" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12h4l2-9 5 18 3-10h4"/></svg>
            AI Consultant
          </NavLink>
          <NavLink to="/opportunities" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            Live Opportunities
          </NavLink>
          <NavLink to="/resume-checker" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            ATS Scanner
          </NavLink>
          <NavLink to="/resume-builder" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Resume Editor
          </NavLink>
          <NavLink to="/dsa-sniper" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            DSA Sniper
          </NavLink>
          <NavLink to="/mock-interview" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Mock Interview
          </NavLink>
          <NavLink to="/networking-hub" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v4"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            Networking Hub
          </NavLink>
          <NavLink to="/skill-architect" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Skill Architect
          </NavLink>
          {currentUser && (
            <button className="nav-link" onClick={handleLogout} style={{ background: 'transparent', width: '100%', textAlign: 'left', marginTop: 'auto', color: '#ff4757', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Terminate Identity
            </button>
          )}
        </nav>
      </div>
      
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
}

export default Sidebar;
