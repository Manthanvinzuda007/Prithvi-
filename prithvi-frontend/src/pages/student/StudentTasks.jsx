import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/shared/Toast';
import { attachRipple } from '../../utils/effects';
import './StudentTasks.css';

function CountdownTimer({ deadline }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline) - Date.now();
      if (diff < 0) { setLabel('OVERDUE'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLabel(d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [deadline]);
  const isUrgent = new Date(deadline) - Date.now() < 86400000 && new Date(deadline) > Date.now();
  const isOverdue = new Date(deadline) < Date.now();
  return <span className={`timer-chip ${isUrgent ? 'urgent' : ''} ${isOverdue ? 'overdue-chip' : ''}`}>{label}</span>;
}

function SubmitModal({ task, onClose, onSuccess }) {
  const toast = useToast();
  const [desc, setDesc] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!desc.trim()) { toast('Please describe what you did!', 'warning'); return; }
    setLoading(true);
    try {
      await api.post(`/tasks/${task.id}/submit`, { description: desc, proofUrl: proofUrl || null, selfAssessmentStars: stars });
      toast('Task submitted! Your teacher will review it soon 🌱', 'success');
      onSuccess();
    } catch (err) {
      toast(err.response?.data?.error || 'Submission failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: 12, color: '#7a907a', fontWeight: 700, marginBottom: 4 }}>SUBMITTING PROOF FOR</div>
            <h3 style={{ fontFamily: 'Baloo 2', fontSize: 18, color: '#1a2e1a' }}>{task.title}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="submit-field">
            <label>Describe what you did: <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea value={desc} onChange={e => setDesc(e.target.value.slice(0, 500))}
              placeholder="I planted 2 saplings near my school. I chose Neem trees because..."
              className="submit-textarea" />
            <span className="char-count">{desc.length}/500</span>
          </div>
          <div className="submit-field">
            <label>Photo / Proof URL (optional):</label>
            <div className="reg-input-wrap">
              <span>🔗</span>
              <input value={proofUrl} onChange={e => setProofUrl(e.target.value)}
                placeholder="https://drive.google.com/your-photo-link" style={{ paddingLeft: 44, height: 46, border: '1.5px solid #d1fae5', borderRadius: 10, width: '100%', fontSize: 14, outline: 'none' }} />
            </div>
          </div>
          <div className="submit-field">
            <label>Self-assessment — how confident are you?</label>
            <div className="star-rating">
              {[1,2,3,4,5].map(n => (
                <button key={n} className={`star-btn ${n <= stars ? 'lit' : ''}`} onClick={() => setStars(n)}>★</button>
              ))}
            </div>
          </div>
          {task.submissionRequirements && (
            <div className="submit-requirements">
              <strong>📋 Required:</strong> {task.submissionRequirements}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="lp-nav-btn secondary" onClick={onClose}>Cancel</button>
          <button className="lp-nav-btn primary" onClick={submit} disabled={loading || !desc.trim()}>
            {loading ? <span className="spinner" /> : 'Submit for Review →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentTasks() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [submitTask, setSubmitTask] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = () => api.get('/tasks').then(r => setTasks(r.data.tasks || [])).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const getStatus = (task) => {
    const sub = task.mySubmission;
    if (!sub) return 'available';
    return sub.status;
  };

  const filtered = tasks.filter(t => {
    const s = getStatus(t);
    if (tab === 'active') return s === 'available' || s === 'rejected';
    if (tab === 'submitted') return s === 'pending';
    if (tab === 'completed') return s === 'approved';
    return true;
  });

  if (loading) return <div className="dash-loading"><div className="spinner dark" /></div>;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h2>My Eco Missions 🌿</h2>
        <p>Complete real-world tasks and earn Eco-Points</p>
      </div>

      <div className="lessons-tabs" style={{ marginBottom: 24 }}>
        {[['active','Active'],['submitted','Submitted'],['completed','Completed'],['all','All']].map(([v,l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      <div className="tasks-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: 48 }}>🌱</span>
            <p>No tasks in this category.</p>
          </div>
        )}
        {filtered.map(task => {
          const status = getStatus(task);
          const isExpanded = expanded === task.id;
          const sub = task.mySubmission;

          return (
            <div key={task.id} className={`task-card-full diff-${task.difficulty?.toLowerCase()}`}>
              <div className={`task-full-accent ${task.difficulty?.toLowerCase()}`} />
              <div className="task-full-body">
                <div className="task-full-top">
                  <div className="task-full-chips">
                    <span className={`diff-chip ${task.difficulty?.toLowerCase()}`}>{task.difficulty}</span>
                    <span className="cat-chip">{task.category?.replace(/_/g,' ')}</span>
                    <span className={`status-chip status-${status}`}>
                      {status === 'available' ? '🟡 Available' : status === 'pending' ? '🔵 Submitted' : status === 'approved' ? '🟢 Approved' : status === 'rejected' ? '🔴 Rejected' : status}
                    </span>
                  </div>
                  <div className="task-deadline-area">
                    {task.deadline && <CountdownTimer deadline={task.deadline} />}
                  </div>
                </div>

                <div className="task-full-title" onClick={() => setExpanded(isExpanded ? null : task.id)}
                  style={{ cursor: 'pointer' }}>{task.title}</div>
                <div className="task-full-desc">{task.description}</div>

                {isExpanded && (
                  <div className="task-expanded">
                    {task.instructions?.length > 0 && (
                      <div className="task-instructions">
                        <h4>📋 Step-by-Step Instructions:</h4>
                        <ol>{task.instructions.map((step, i) => <li key={i}>{step}</li>)}</ol>
                      </div>
                    )}
                    {task.submissionRequirements && (
                      <div className="task-req">
                        <h4>✅ Submission Requirements:</h4>
                        <p>{task.submissionRequirements}</p>
                      </div>
                    )}
                    {task.ecoBenefit && (
                      <div className="task-eco">
                        <span>🌍</span> <strong>Eco Impact:</strong> {task.ecoBenefit}
                      </div>
                    )}
                  </div>
                )}

                {sub?.status === 'approved' && (
                  <div className="task-teacher-comment approved">
                    ✓ Teacher: "{sub.teacherComment || 'Approved!'}" — +{sub.pointsAwarded} pts earned
                  </div>
                )}
                {sub?.status === 'rejected' && sub?.teacherComment && (
                  <div className="task-teacher-comment rejected">
                    Teacher feedback: "{sub.teacherComment}"
                  </div>
                )}

                <div className="task-full-footer">
                  <span style={{ fontSize: 13, color: '#7a907a' }}>Assigned by teacher</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="pts-badge">🌱 +{task.ecoPointsReward} pts</span>
                    {(status === 'available' || status === 'rejected') && (
                      <button className="s-btn-green" onClick={() => setSubmitTask(task)}>
                        {status === 'rejected' ? 'Resubmit →' : 'Submit Proof →'}
                      </button>
                    )}
                    {status === 'pending' && (
                      <button className="s-btn-outline" disabled>Submitted ✓</button>
                    )}
                    {status === 'approved' && (
                      <button className="s-btn-outline" disabled>Approved 🌟</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {submitTask && (
        <SubmitModal task={submitTask} onClose={() => setSubmitTask(null)} onSuccess={() => { setSubmitTask(null); load(); }} />
      )}
    </div>
  );
}
