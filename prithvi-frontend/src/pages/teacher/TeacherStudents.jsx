import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './TeacherStudents.css';

const AVATARS = ['🌿','🌍','🦋','🏔️','🔭','🌾'];
const BADGE_ICONS = { 'tree-planter':'🌳','waste-warrior':'♻️','water-guardian':'💧','energy-saver':'⚡','eco-scholar':'📚','quiz-master':'🎯','streak-7':'🔥','streak-30':'🏅','climate-champion':'🌍','eco-legend':'👑' };

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('points');

  useEffect(() => { api.get('/users/students').then(r => setStudents(r.data.students || [])).finally(() => setLoading(false)); }, []);

  const filtered = students
    .filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.grade?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'points' ? b.totalPoints - a.totalPoints : a.name?.localeCompare(b.name));

  if (loading) return <div className="t-loading"><div className="spinner dark" /></div>;

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans', animation: 'fadeIn 300ms ease' }}>
      <div className="page-header">
        <h2 style={{ fontFamily: 'DM Serif Display', fontSize: 28, color: '#0f172a' }}>Students 👥</h2>
        <p style={{ color: '#64748b', marginTop: 4 }}>{students.length} students enrolled in your class</p>
      </div>

      <div className="review-filters" style={{ marginBottom: 24 }}>
        <div className="t-search-wrap">
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or grade..." />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="t-select" style={{ width: 180 }}>
          <option value="points">Sort by Points</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <div className="students-grid">
        {filtered.map((s, i) => (
          <div key={s.id} className="student-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="student-card-top">
              <div className="student-avatar-big">{AVATARS[(s.avatarId||1)-1]}</div>
              <div>
                <div className="student-name">{s.name}</div>
                <div className="student-meta">{s.grade} • Section {s.section || '—'}</div>
              </div>
              <div className="student-level-badge">{s.level?.split(' ').slice(-1)[0] || 'Seedling'}</div>
            </div>

            <div className="student-stats-row">
              <div className="student-stat">
                <span className="student-stat-value" style={{ color: '#22c55e' }}>{(s.totalPoints||0).toLocaleString()}</span>
                <span className="student-stat-label">Eco-Points</span>
              </div>
              <div className="student-stat">
                <span className="student-stat-value" style={{ color: '#f59e0b' }}>{s.badgeCount || 0}</span>
                <span className="student-stat-label">Badges</span>
              </div>
            </div>

            <div className="student-level-bar">
              <div className="student-level-fill" style={{ width: `${Math.min(100, ((s.totalPoints||0) / 2000) * 100)}%` }} />
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{s.level}</div>

            {s.interests?.length > 0 && (
              <div className="student-interests">
                {s.interests.slice(0,3).map(tag => <span key={tag} className="cat-chip" style={{ fontSize: 10 }}>{tag}</span>)}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1' }} className="t-empty">
            <span style={{ fontSize: 48 }}>👥</span>
            <p>{search ? 'No students found matching your search.' : 'No students enrolled yet.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
