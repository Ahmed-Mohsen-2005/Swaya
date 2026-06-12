import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, BarChart3, BookOpen, Camera, ChevronDown, ClipboardList, Edit3, FileText, HeartPulse, Home, KeyRound, Languages, LogOut, Menu, MessageSquare, NotebookPen, Settings, Shield, UserRound, Users } from 'lucide-react';
import logo from '../../assets/logo-horizontal.png';
import logoIcon from '../../assets/logo-icon.png';
import { useAuthStore } from '../../store/authStore';
import { PageTransition } from '../ui/PageTransition';
import { useI18n } from '../../i18n';
import { NotificationsDropdown } from './NotificationsDropdown';
import { GlobalSearch } from './GlobalSearch';

const navs = {
  teacher: [['/teacher/dashboard', Home, 'Overview'], ['/teacher/live-session', Activity, 'Live Session'], ['/teacher/students', Users, 'Students'], ['/teacher/sessions', BookOpen, 'Sessions'], ['/teacher/analytics', BarChart3, 'Class Analytics'], ['/teacher/reports', FileText, 'Reports'], ['/teacher/notes', NotebookPen, 'Notes']],
  doctor: [['/doctor/dashboard', Home, 'Overview'], ['/doctor/patients', Users, 'Patients'], ['/doctor/analytics', BarChart3, 'Analytics'], ['/doctor/therapy-plans', HeartPulse, 'Therapy Plans'], ['/doctor/reports', FileText, 'Reports'], ['/doctor/recommendations', ClipboardList, 'Recommendations'], ['/doctor/timeline', Activity, 'Timeline']],
  parent: [['/parent/dashboard', Home, 'Overview'], ['/parent/progress', BarChart3, 'Progress'], ['/parent/reports', FileText, 'Reports'], ['/parent/recommendations', HeartPulse, 'Recommendations'], ['/parent/sessions', BookOpen, 'Sessions'], ['/parent/messages', MessageSquare, 'Messages']],
};

const titles = {
  '/teacher/dashboard': ['Teacher Overview', 'Class insights and daily actions'], '/teacher/live-session': ['Live Class Session', 'Real-time monitoring and smart support'], '/teacher/students': ['Students', 'Assigned class students'], '/teacher/sessions': ['Sessions', 'Class session history'], '/teacher/analytics': ['Class Analytics', 'Trends, comparisons and follow-up'], '/teacher/reports': ['Reports', 'Educational and session reports'], '/teacher/notes': ['Notes', 'Session and student observations'],
  '/doctor/dashboard': ['Doctor Overview', 'Clinical insights and priority reviews'], '/doctor/patients': ['Patients', 'Assigned students and risk indicators'], '/doctor/analytics': ['Patient Analytics', 'Behavior trends and intervention response'], '/doctor/therapy-plans': ['Therapy Plans', 'Goals, strategies and recommendations'], '/doctor/reports': ['Reports', 'Clinical and parent-safe reports'], '/doctor/recommendations': ['Recommendations', 'Guidance for teachers and parents'], '/doctor/timeline': ['Behavior Timeline', 'Chronological behavioral events'],
  '/parent/dashboard': ['Parent Overview', 'Simple progress and live child status'], '/parent/progress': ['Child Progress', 'Friendly trends and achievements'], '/parent/reports': ['Reports', 'Parent-safe progress reports'], '/parent/recommendations': ['Recommendations', 'Home guidance and support'], '/parent/sessions': ['Session Summaries', 'Your child activity summaries'], '/parent/messages': ['Messages', 'Communication placeholder'],
  '/profile': ['Profile', 'Personal profile and professional account details.'], '/settings/account': ['Account Settings', 'Manage identity, preferences, and access settings.'], '/settings/security': ['Security', 'Update password and security preferences.'], '/notifications': ['Notifications', 'Review system alerts, session events, reports, and clinical updates.'],
};

function initialsFor(name) {
  return name?.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'SW';
}

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();
  const loc = useLocation();
  const { t, dir, isArabic, toggleLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef(null);
  const role = user?.role || 'teacher';
  const title = titles[loc.pathname] || titles['/' + role + '/dashboard'];
  const avatar = user?.avatarUrl || user?.avatar;
  const initials = initialsFor(user?.fullName);

  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const profileActions = [
    ['/profile', UserRound, 'View Profile'],
    ['/profile?picture=true', Camera, 'Change Profile Picture'],
    ['/profile?edit=name', Edit3, 'Edit Name'],
    ['/settings/security', KeyRound, 'Change Password'],
    ['/settings/account', Settings, 'Account Settings'],
  ];

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <div className="app-shell" dir={dir}>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="logo-row"><img src={logo} alt="SWAYA"/></div>
        <nav className="nav-list" aria-label="Primary">
          {navs[role].map(([to, Icon, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <Icon size={18}/>{t(label)}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-tip">
          <h4>{t(role === 'teacher' ? 'Intervention Insight' : role === 'doctor' ? 'Clinical Focus' : 'SWAYA supports you')}</h4>
          <p>{t(role === 'teacher' ? 'Use early interventions when stress begins to rise.' : role === 'doctor' ? 'Review behavior trends before updating therapy plans.' : 'Your child is supported with role-based insight.')}</p>
          <button className="sidebar-guidance" onClick={() => nav(role === 'teacher' ? '/teacher/notes' : role === 'doctor' ? '/doctor/recommendations' : '/parent/recommendations')}>{t('View guidance')}</button>
          <img src={logoIcon} alt="SWAYA icon"/>
        </div>
        <div className="sidebar-foot">SWAYA v1.0.0<br/>{t('Beta build')}</div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label={t(open ? 'Close menu' : 'Open menu')} onClick={() => setOpen(!open)}><Menu size={18}/></button>
            <div className="page-title">
              <h1>{t(title?.[0])}</h1>
              <p>{t(title?.[1])}</p>
            </div>
          </div>
          <GlobalSearch className="topbar-search"/>
          <div className="top-actions">
            <button className="language-toggle" onClick={toggleLanguage}>
              <Languages size={16}/><span>{isArabic ? 'English' : 'العربية'}</span>
            </button>
            <NotificationsDropdown open={notificationsOpen} setOpen={setNotificationsOpen} onOpen={() => setMenuOpen(false)}/>
            <div className="profile-menu-wrap" ref={menuRef}>
              <button className="profile-trigger" aria-label={t('Account menu')} aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => { setNotificationsOpen(false); setMenuOpen(value => !value); }}>
                {avatar ? <img className="avatar" src={avatar} alt=""/> : <span className="avatar">{initials}</span>}
                <span className="profile-copy">
                  <b>{user?.fullName}</b>
                  <span>{t(role)}</span>
                </span>
                <ChevronDown size={16} className={menuOpen ? 'chevron open' : 'chevron'}/>
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div className="profile-dropdown" role="menu" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.16 }}>
                    <div className="profile-dropdown-head">
                      {avatar ? <img className="avatar avatar-lg" src={avatar} alt=""/> : <span className="avatar avatar-lg">{initials}</span>}
                      <div><b>{user?.fullName}</b><span>{t(role)}</span></div>
                    </div>
                    <div className="profile-dropdown-list">
                      {profileActions.map(([to, Icon, label]) => (
                        <button key={label} role="menuitem" onClick={() => nav(to)}><Icon size={16}/>{t(label)}</button>
                      ))}
                    </div>
                    <div className="profile-dropdown-separator"/>
                    <button className="dropdown-logout" role="menuitem" onClick={handleLogout}><LogOut size={16}/>{t('Logout')}</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <div className="content">
          <AnimatePresence mode="wait"><PageTransition key={loc.pathname}><Outlet/></PageTransition></AnimatePresence>
        </div>
      </main>
    </div>
  );
}
