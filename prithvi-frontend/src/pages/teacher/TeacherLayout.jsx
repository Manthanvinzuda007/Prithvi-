import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './TeacherLayout.css';

const NAV = [
  { path: '/teacher', label: 'Dashboard', icon: '🏠' },
  { path: '/teacher/task-review', label: 'Task Review', icon: '✅', badge: true },
  { path: '/teacher/assign-task', label: 'Assign Tasks', icon: '📋' },
  { path: '/teacher/lessons', label: 'Lesson Builder', icon: '📚' },
  { path: '/teacher/students', label: 'Students', icon: '👥' },
  { path: '/teacher/analytics', label: 'Analytics', icon: '📊' },
];

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    api.get('/tasks').then(r => {
      const tasks = r.data.tasks || [];
      const pending = tasks.reduce((acc, t) => acc + (t.submissions?.filter(s => s.status === 'pending').length || 0), 0);
      setPendingCount(pending);
    }).catch(() => {});
    api.get('/users/notifications').then(r => setNotifications(r.data.notifications || [])).catch(() => {});
  }, [location.pathname]);

  const isActive = (path) => path === '/teacher' ? location.pathname === '/teacher' : location.pathname.startsWith(path);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="teacher-layout" data-theme="teacher">
      <aside className="t-sidebar">
        <div className="t-sidebar-top">
          <div className="t-logo" onClick={() => navigate('/teacher')}>
            <span>🌍</span>
            <span className="t-logo-text">PRITHVI</span>
          </div>
          <div className="t-portal-label">Teacher Portal</div>
        </div>

        <div className="t-profile">
          <div className="t-profile-avatar">👩‍🏫</div>
          <div>
            <div className="t-profile-name">{user?.name}</div>
            <div className="t-profile-subject">{user?.subject || 'Environmental Science'}</div>
          </div>
        </div>

        <nav className="t-nav">
          {NAV.map(item => (
            <button key={item.path}
              className={`t-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}>
              <span className="t-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span className="t-nav-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="t-sidebar-bottom">
          <button className="t-logout" onClick={() => { logout(); navigate('/'); }}>🚪 Logout</button>
        </div>
      </aside>

      <div className="t-main">
        <header className="t-header">
          <div className="t-breadcrumb">
            Home › {NAV.find(n => isActive(n.path))?.label || 'Dashboard'}
          </div>
          <div className="t-header-right">
            <div className="s-notif-wrap" style={{ position: 'relative' }}>
              <button className="t-header-btn" onClick={() => { setShowNotif(p => !p); }}>
                🔔 {unread > 0 && <span className="notif-badge">{unread}</span>}
              </button>
              {showNotif && (
                <div className="notif-dropdown" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <div className="notif-header">Notifications</div>
                  {notifications.length === 0
                    ? <div className="notif-empty">No notifications</div>
                    : notifications.slice(0, 6).map(n => (
                      <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                        <span>{n.message}</span>
                        <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="t-header-avatar">👩‍🏫</div>
          </div>
        </header>

        <main className="t-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
