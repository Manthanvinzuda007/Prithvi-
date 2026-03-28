import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './StudentLessons.css';

export default function StudentLessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    api.get('/lessons').then(r => setLessons(r.data.lessons || [])).finally(() => setLoading(false));
  }, []);

  const filtered = lessons.filter(l => {
    if (tab === 'progress') return l.progress?.status === 'in_progress';
    if (tab === 'done') return l.progress?.status === 'completed';
    return true;
  });

  const catColors = { 'Forests & Trees': '#15803d', 'Water Conservation': '#0284c7', 'Biodiversity': '#7c3aed', 'Climate Change': '#ef4444', 'Waste Management': '#0891b2' };

  if (loading) return <div className="dash-loading"><div className="spinner dark" /></div>;

  return (
    <div className="lessons-page">
      <div className="page-header">
        <h2>My Lessons 📚</h2>
        <p>Complete lessons to earn XP and level up your eco-knowledge!</p>
      </div>

      <div className="lessons-tabs">
        {[['all','All Lessons'],['progress','In Progress'],['done','Completed']].map(([v,l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      <div className="lessons-grid">
        {filtered.map((lesson, i) => {
          const prog = lesson.progress;
          const pct = prog && lesson.chapters?.length ? Math.round((prog.completedChapters?.length || 0) / lesson.chapters.length * 100) : 0;
          const color = catColors[lesson.category] || '#22c55e';
          return (
            <div key={lesson.id} className="lesson-card" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="lesson-card-top" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                <span className="lesson-icon">📖</span>
                {prog?.status === 'completed' && <div className="lesson-done-badge">✓ Done</div>}
              </div>
              <div className="lesson-badges-row">
                <span className="cat-chip">{lesson.category}</span>
                <span className="diff-chip" style={{ background: '#f0fdf4', color: '#15803d' }}>{lesson.difficulty}</span>
              </div>
              <div className="lesson-body">
                <div className="lesson-title">{lesson.title}</div>
                <div className="lesson-desc">{lesson.description?.slice(0, 80)}...</div>
              </div>
              <div className="lesson-stats">
                <span>📖 {lesson.chapters?.length || 0} chapters</span>
                <span>⏱ {lesson.durationMinutes}m</span>
                <span className="lesson-xp">🌟 +{lesson.xpReward} XP</span>
              </div>
              {prog && pct > 0 && pct < 100 && (
                <div className="lesson-progress-bar">
                  <div className="lesson-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              )}
              <button className="lesson-action-btn" style={{ background: prog?.status === 'completed' ? '#64748b' : color }}
                onClick={() => navigate(`/student/lessons/${lesson.id}`)}>
                {!prog ? 'Start Lesson →' : prog.status === 'completed' ? 'Review ✓' : `Continue (${pct}%) →`}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="no-results" style={{ gridColumn: '1/-1' }}>
            <span style={{ fontSize: 48 }}>📚</span>
            <p>No lessons in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
