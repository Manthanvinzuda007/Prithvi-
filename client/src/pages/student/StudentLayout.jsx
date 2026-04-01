import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './StudentLayout.css';

const NAV = [
  { path: '/student', label: 'Dashboard', icon: '🏠' },
  { path: '/student/explore', label: 'Explore', icon: '🔍' },
  { path: '/student/lessons', label: 'Lessons', icon: '📚' },
  { path: '/student/tasks', label: 'Tasks', icon: '✅' },
  { path: '/student/games', label: 'Games', icon: '🎮' },
  { path: '/student/contests', label: 'Contests', icon: '🏆' },
  { path: '/student/profile', label: 'My Profile', icon: '👤' },
];

const AVATARS = ['🌿','🌍','🦋','🏔️','🔭','🌾'];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [points, setPoints] = useState(user?.ecoPoints || 0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    api.get('/points/my').then(r => setPoints(r.data.points?.totalPoints || 0)).catch(() => {});
    api.get('/users/notifications').then(r => setNotifications(r.data.notifications || [])).catch(() => {});
  }, [location.pathname]);

  const unread = notifications.filter(n => !n.read).length;
  const avatar = AVATARS[(user?.avatarId || 1) - 1];

  const isActive = (path) => path === '/student' ? location.pathname === '/student' : location.pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="student-layout" data-theme="student">
      {/* SIDEBAR */}
      <aside className="s-sidebar">
        <div className="s-sidebar-logo" onClick={() => navigate('/student')}>
          <span className="logo-leaf">🌿</span>
          <span className="logo-text">PRITHVI</span>
        </div>

        <div className="s-sidebar-profile">
          <div className="s-avatar">{avatar}</div>
          <div>
            <div className="s-name">{user?.name?.split(' ')[0]}</div>
            <div className="s-level">{user?.level || 'Earth Seedling'}</div>
          </div>
        </div>

        <div className="s-points-pill">
          <span>🌱</span>
          <span>{points.toLocaleString('en-IN')} pts</span>
        </div>

        <nav className="s-nav">
          {NAV.map(item => (
            <button key={item.path}
              className={`s-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}>
              <span className="s-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="s-sidebar-bottom">
          <button className="s-logout" onClick={handleLogout}>🚪 Logout</button>
          <span className="s-version">Prithvi v1.0</span>
        </div>
      </aside>

      {/* MAIN */}
      <div className="s-main">
        <header className="s-header">
          <h1 className="s-page-title">
            {NAV.find(n => isActive(n.path))?.icon} {NAV.find(n => isActive(n.path))?.label || 'Dashboard'}
          </h1>
          <div className="s-header-right">
            <div className="s-notif-wrap" onClick={() => { setShowNotif(p => !p); if (!showNotif) { api.put('/users/notifications/read-all').catch(()=>{}); setNotifications(n => n.map(x => ({...x, read: true}))); } }}>
              <button className="s-notif-btn">🔔
                {unread > 0 && <span className="notif-badge">{unread}</span>}
              </button>
              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-header">Notifications</div>
                  {notifications.length === 0 ? <div className="notif-empty">No notifications yet 🌿</div> :
                    notifications.slice(0,6).map(n => (
                      <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                        <span>{n.message}</span>
                        <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="s-header-avatar">{avatar}</div>
          </div>
        </header>

        <main className="s-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="s-mobile-nav">
        {NAV.slice(0, 5).map(item => (
          <button key={item.path}
            className={`s-mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
