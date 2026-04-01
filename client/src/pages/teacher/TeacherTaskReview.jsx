import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/shared/Toast';
import './TeacherTaskReview.css';

export default function TeacherTaskReview() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [comments, setComments] = useState({});
  const [points, setPoints] = useState({});
  const [reviewing, setReviewing] = useState({});

  const load = () => Promise.all([api.get('/tasks'), api.get('/users/students')])
    .then(([t, s]) => { setTasks(t.data.tasks || []); setStudents(s.data.students || []); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const allSubmissions = tasks.flatMap(t =>
    (t.submissions || []).map(s => ({
      ...s, taskId: t.id, taskTitle: t.title, taskCategory: t.category,
      taskDifficulty: t.difficulty, defaultPts: t.ecoPointsReward,
      taskDeadline: t.deadline
    }))
  ).filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search) {
      const student = students.find(st => st.id === s.studentId);
      return student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.taskTitle?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const pending = tasks.flatMap(t => (t.submissions || []).filter(s => s.status === 'pending')).length;
  const approved = tasks.flatMap(t => (t.submissions || []).filter(s => s.status === 'approved')).length;
  const rejected = tasks.flatMap(t => (t.submissions || []).filter(s => s.status === 'rejected')).length;

  const review = async (taskId, studentId, decision, subKey) => {
    const pts = points[subKey] ?? tasks.find(t => t.id === taskId)?.ecoPointsReward ?? 50;
    const comment = comments[subKey] || (decision === 'approved' ? 'Great work!' : '');
    if (decision === 'rejected' && !comment.trim()) {
      toast('Please add feedback before rejecting', 'warning'); return;
    }
    setReviewing(p => ({ ...p, [subKey]: true }));
    try {
      await api.put(`/tasks/${taskId}/review/${studentId}`, { decision, comment, pointsAwarded: parseInt(pts) });
      toast(decision === 'approved' ? `Approved! ${pts} pts awarded 🌱` : 'Submission rejected', decision === 'approved' ? 'success' : 'warning');
      await load();
    } catch (err) {
      toast(err.response?.data?.error || 'Review failed', 'error');
    } finally { setReviewing(p => ({ ...p, [subKey]: false })); }
  };

  if (loading) return <div className="t-loading"><div className="spinner dark" /></div>;

  return (
    <div className="task-review-page">
      <div className="page-header">
        <h2 style={{ fontFamily: 'DM Serif Display', fontSize: 28, color: '#0f172a' }}>Task Submissions Review ✅</h2>
        <p style={{ color: '#64748b', marginTop: 4 }}>Review and approve student task completions</p>
      </div>

      {/* Stats bar */}
      <div className="review-stats-bar">
        <div className="review-stat amber"><span>{pending}</span> Pending Review</div>
        <div className="review-stat green"><span>{approved}</span> Approved</div>
        <div className="review-stat red"><span>{rejected}</span> Rejected</div>
      </div>

      {/* Filters */}
      <div className="review-filters">
        <div className="t-search-wrap">
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or task..." />
        </div>
        <div className="lessons-tabs" style={{ marginBottom: 0 }}>
          {[['pending','Pending'],['approved','Approved'],['rejected','Rejected'],['all','All']].map(([v,l]) => (
            <button key={v} className={`tab-btn ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)} style={{ fontFamily: 'Plus Jakarta Sans' }}>{l}</button>
          ))}
        </div>
      </div>

      {allSubmissions.length === 0 ? (
        <div className="t-card t-empty" style={{ marginTop: 24 }}>
          <span style={{ fontSize: 48 }}>✅</span>
          <h3 style={{ fontFamily: 'DM Serif Display' }}>All caught up!</h3>
          <p>No {filter === 'all' ? '' : filter} submissions right now.</p>
        </div>
      ) : allSubmissions.map((sub, i) => {
        const student = students.find(s => s.id === sub.studentId);
        const subKey = `${sub.taskId}-${sub.studentId}`;
        const isLate = sub.taskDeadline && new Date(sub.submittedAt) > new Date(sub.taskDeadline);
        return (
          <div key={subKey} className="review-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="review-card-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="review-student-avatar">👤</div>
                <div>
                  <div className="review-student-name">{student?.name || 'Unknown Student'}</div>
                  <div className="review-student-grade">{student?.grade} • {student?.school?.split(',')[0]}</div>
                </div>
              </div>
              <div className="review-status-area">
                <span className="review-timestamp">{new Date(sub.submittedAt).toLocaleString()}</span>
                <span className={`status-chip status-${sub.status}`}>
                  {sub.status === 'pending' ? '⏳ Pending' : sub.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                </span>
                {isLate && <span className="late-chip">Late Submission</span>}
              </div>
            </div>

            <div className="review-task-info">
              <span className="review-task-name">{sub.taskTitle}</span>
              <span className={`diff-chip ${sub.taskDifficulty?.toLowerCase()}`}>{sub.taskDifficulty}</span>
              <span className="cat-chip">{sub.taskCategory?.replace(/_/g, ' ')}</span>
            </div>

            <div className="review-submission-body">
              <div className="review-submission-label">What the student did:</div>
              <p className="review-submission-text">{sub.description}</p>
              {sub.proofUrl && (
                <div className="review-proof-link">
                  <span>📎 Proof:</span>
                  <a href={sub.proofUrl} target="_blank" rel="noreferrer">{sub.proofUrl}</a>
                </div>
              )}
            </div>

            {sub.status === 'pending' && (
              <div className="review-actions-area">
                <div className="review-points-row">
                  <label>Points to Award:</label>
                  <div className="review-pts-input">
                    <input type="number" min={0} max={sub.defaultPts}
                      value={points[subKey] ?? sub.defaultPts}
                      onChange={e => setPoints(p => ({ ...p, [subKey]: e.target.value }))} />
                    <span className="review-pts-max">Max: {sub.defaultPts}</span>
                  </div>
                </div>
                <div className="review-comment-row">
                  <label>Feedback for student:</label>
                  <textarea value={comments[subKey] || ''} onChange={e => setComments(p => ({ ...p, [subKey]: e.target.value }))}
                    placeholder="Great work! / Please resubmit with a clearer description..." className="review-comment" />
                </div>
                <div className="review-btn-row">
                  <button className="review-approve-btn" disabled={reviewing[subKey]}
                    onClick={() => review(sub.taskId, sub.studentId, 'approved', subKey)}>
                    {reviewing[subKey] ? <span className="spinner" /> : '✓ Approve & Award Points'}
                  </button>
                  <button className="review-reject-btn" disabled={reviewing[subKey]}
                    onClick={() => review(sub.taskId, sub.studentId, 'rejected', subKey)}>
                    ✗ Reject
                  </button>
                  <button className="review-resubmit-btn" disabled={reviewing[subKey]}
                    onClick={() => review(sub.taskId, sub.studentId, 'resubmit', subKey)}>
                    ↩ Request Resubmission
                  </button>
                </div>
              </div>
            )}

            {sub.status !== 'pending' && sub.teacherComment && (
              <div className={`review-teacher-note ${sub.status}`}>
                <strong>Your feedback:</strong> "{sub.teacherComment}"
                {sub.pointsAwarded > 0 && <span> — {sub.pointsAwarded} pts awarded</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
