import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import CountUp from '../../components/shared/CountUp';
import './TeacherDashboard.css';

function BarChart({ students }) {
  if (!students?.length) return null;
  const sorted = [...students].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10);
  const max = Math.max(...sorted.map(s => s.totalPoints), 1);
  const avg = Math.round(sorted.reduce((a, s) => a + s.totalPoints, 0) / sorted.length);
  return (
    <div className="bar-chart">
      <div className="bar-chart-inner">
        {sorted.map((s, i) => (
          <div key={s.id || i} className="bar-wrap" title={`${s.name}: ${s.totalPoints} pts`}>
            <div className="bar-fill" style={{ height: `${(s.totalPoints / max) * 140}px` }}>
              <div className="bar-tooltip">{s.totalPoints}</div>
            </div>
            <div className="bar-label">{s.name?.split(' ')[0]}</div>
          </div>
        ))}
        <div className="bar-avg-line" style={{ bottom: `${(avg / max) * 140}px` }}>
          <span>avg</span>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [greeting] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  });

  useEffect(() => {
    Promise.all([
      api.get('/users/students'),
      api.get('/tasks'),
    ]).then(([s, t]) => {
      setStudents(s.data.students || []);
      setTasks(t.data.tasks || []);
    }).finally(() => setLoading(false));
  }, []);

  const allSubmissions = tasks.flatMap(t => (t.submissions || []).map(s => ({ ...s, taskTitle: t.title, taskId: t.id, taskCategory: t.category })));
  const pending = allSubmissions.filter(s => s.status === 'pending');
  const approved = allSubmissions.filter(s => s.status === 'approved');
  const avgXP = students.length ? Math.round(students.reduce((a, s) => a + (s.totalPoints || 0), 0) / students.length) : 0;
  const topStudent = [...students].sort((a, b) => b.totalPoints - a.totalPoints)[0];
  const activeTasks = tasks.filter(t => new Date(t.deadline) > Date.now() || !t.deadline).length;

  const recentActivity = allSubmissions
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 8)
    .map(s => {
      const student = students.find(st => st.id === s.studentId);
      return { ...s, studentName: student?.name || 'Unknown' };
    });

  const quickReview = async (taskId, studentId, decision) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await api.put(`/tasks/${taskId}/review/${studentId}`, {
        decision, pointsAwarded: task?.ecoPointsReward || 50, comment: decision === 'approved' ? 'Great work!' : ''
      });
      setTasks(prev => prev.map(t => t.id === taskId ? {
        ...t, submissions: t.submissions.map(s => s.studentId === studentId ? { ...s, status: decision === 'approved' ? 'approved' : 'rejected' } : s)
      } : t));
    } catch {}
  };

  if (loading) return <div className="t-loading"><div className="spinner dark" /></div>;

  const stats = [
    { label: 'Total Students', value: students.length, icon: '👥', color: '#3b82f6', sub: `+3 this week` },
    { label: 'Tasks Assigned', value: tasks.length, icon: '📋', color: '#22c55e', sub: `${activeTasks} active` },
    { label: 'Awaiting Review', value: pending.length, icon: '⏳', color: pending.length > 0 ? '#f59e0b' : '#22c55e', sub: `${approved.length} approved total` },
    { label: 'Avg Class XP', value: avgXP, icon: '🌟', color: '#7c3aed', sub: topStudent ? `Top: ${topStudent.name?.split(' ')[0]}` : '' },
  ];

  return (
    <div className="teacher-dashboard">
      {/* Welcome */}
      <div className="t-welcome-banner">
        <div>
          <h2>{greeting}, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's your class overview for today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="t-welcome-school">{user?.school}</div>
      </div>

      {/* Stats */}
      <div className="t-stats-row">
        {stats.map((s, i) => (
          <div key={i} className="t-stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="t-stat-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
            <div>
              <div className="t-stat-value" style={{ color: s.color }}>
                <CountUp to={s.value} duration={1000} />
              </div>
              <div className="t-stat-label">{s.label}</div>
              <div className="t-stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="t-dash-grid">
        {/* LEFT */}
        <div className="t-dash-left">
          {/* Pending Reviews */}
          <div className="t-card">
            <div className="t-section-head">
              <h3>Pending Reviews {pending.length > 0 && <span className="t-badge-count">{pending.length}</span>}</h3>
              <button className="t-view-all" onClick={() => navigate('/teacher/task-review')}>View All →</button>
            </div>
            {pending.length === 0 ? (
              <div className="t-empty">
                <span style={{ fontSize: 40 }}>✅</span>
                <p>All submissions reviewed! Great job.</p>
              </div>
            ) : pending.slice(0, 4).map((sub, i) => {
              const student = students.find(s => s.id === sub.studentId);
              return (
                <div key={i} className="t-review-row">
                  <div className="t-review-avatar">👤</div>
                  <div className="t-review-info">
                    <div className="t-review-name">{student?.name || 'Student'}</div>
                    <div className="t-review-task">{sub.taskTitle}</div>
                  </div>
                  <div className="t-review-time">{new Date(sub.submittedAt).toLocaleDateString()}</div>
                  <div className="t-review-actions">
                    <button className="t-approve-btn" onClick={() => quickReview(sub.taskId, sub.studentId, 'approved')}>✓</button>
                    <button className="t-reject-btn" onClick={() => quickReview(sub.taskId, sub.studentId, 'rejected')}>✗</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bar Chart */}
          <div className="t-card">
            <div className="t-section-head">
              <h3>Class Eco-Points Overview</h3>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Top 10 Students</span>
            </div>
            <BarChart students={students} />
            {students.length === 0 && <div className="t-empty"><p>No students yet.</p></div>}
          </div>

          {/* Activity Feed */}
          <div className="t-card">
            <div className="t-section-head">
              <h3>Recent Activity <span className="t-live-dot" /></h3>
            </div>
            {recentActivity.length === 0 ? <div className="t-empty"><p>No recent activity.</p></div> : (
              <div className="t-activity-feed">
                {recentActivity.map((a, i) => (
                  <div key={i} className="t-activity-row">
                    <div className="t-activity-dot" style={{ background: a.status === 'approved' ? '#22c55e' : '#f59e0b' }} />
                    <div className="t-activity-body">
                      <span className="t-activity-text">
                        <strong>{a.studentName}</strong> submitted <em>"{a.taskTitle}"</em>
                      </span>
                      <span className="t-activity-time">{new Date(a.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="t-dash-right">
          {/* Quick Actions */}
          <div className="t-card">
            <h3 style={{ fontFamily: 'DM Serif Display', fontSize: 18, color: '#0f172a', marginBottom: 16 }}>Quick Actions</h3>
            {[
              { label: '📋 Assign New Task', path: '/teacher/assign-task' },
              { label: '📚 Create Lesson', path: '/teacher/lessons' },
              { label: '👥 View Students', path: '/teacher/students' },
              { label: '✅ Review Submissions', path: '/teacher/task-review' },
            ].map(a => (
              <button key={a.path} className="t-quick-action" onClick={() => navigate(a.path)}>{a.label} →</button>
            ))}
          </div>

          {/* Top Performers */}
          <div className="t-card">
            <h3 style={{ fontFamily: 'DM Serif Display', fontSize: 18, color: '#0f172a', marginBottom: 16 }}>🏆 Top Performers</h3>
            {[...students].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5).map((s, i) => (
              <div key={s.id} className="t-top-row">
                <div className={`t-top-rank rank-t${Math.min(i+1, 4)}`}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
                <div className="t-top-info">
                  <span className="t-top-name">{s.name}</span>
                  <span className="t-top-grade">{s.grade}</span>
                </div>
                <span className="t-top-pts" style={{ color: '#22c55e', fontWeight: 700 }}>{(s.totalPoints||0).toLocaleString()}</span>
              </div>
            ))}
            {students.length === 0 && <div className="t-empty" style={{ padding: 0 }}><p>No students enrolled</p></div>}
          </div>

          {/* Task Completion Ring */}
          <div className="t-card">
            <h3 style={{ fontFamily: 'DM Serif Display', fontSize: 18, color: '#0f172a', marginBottom: 16 }}>Task Completion</h3>
            {(() => {
              const total = allSubmissions.length;
              const comp = approved.length;
              const pend = pending.length;
              const pct = total ? Math.round((comp / total) * 100) : 0;
              const circ = 2 * Math.PI * 54;
              const offset = circ - (pct / 100) * circ;
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <div style={{ position: 'relative', width: 130, height: 130 }}>
                      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={65} cy={65} r={54} fill="none" stroke="#e2e8f0" strokeWidth={12} />
                        <circle cx={65} cy={65} r={54} fill="none" stroke="#22c55e" strokeWidth={12}
                          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'DM Serif Display', fontSize: 28, color: '#0f172a' }}>{pct}%</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="t-ring-stats">
                    <div className="t-ring-stat" style={{ color: '#22c55e' }}>{comp} done</div>
                    <div className="t-ring-stat" style={{ color: '#f59e0b' }}>{pend} pending</div>
                    <div className="t-ring-stat" style={{ color: '#94a3b8' }}>{total} total</div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Teaching Tip */}
          <div className="t-card t-tip-card">
            <h4>💡 Today's Teaching Tip</h4>
            <p>Try a 5-minute "Eco Headlines" warm-up: ask students to share one environmental news story they read this week. It builds habit and awareness!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
