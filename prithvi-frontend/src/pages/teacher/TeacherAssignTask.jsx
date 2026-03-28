import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../components/shared/Toast';
import './TeacherAssignTask.css';

const CATEGORIES = [
  { id: 'tree_planting', label: '🌳 Tree Planting' }, { id: 'waste_segregation', label: '♻️ Waste Segregation' },
  { id: 'energy_audit', label: '⚡ Energy Audit' }, { id: 'water_conservation', label: '💧 Water Conservation' },
  { id: 'nature_walk', label: '🦋 Nature Walk' }, { id: 'composting', label: '🌿 Composting' },
  { id: 'awareness_campaign', label: '📢 Awareness Campaign' }, { id: 'wildlife_observation', label: '🔭 Wildlife Observation' },
  { id: 'community_cleanup', label: '🧹 Community Cleanup' }, { id: 'environmental_survey', label: '📊 Environmental Survey' },
  { id: 'school_garden', label: '🌱 School Garden' }, { id: 'water_survey', label: '🚰 Water Survey' },
];

const TEMPLATES = [
  { title: 'Monthly Clean-Up Drive', category: 'community_cleanup', difficulty: 'Easy', ecoPointsReward: 60, description: 'Organize a community clean-up in your neighborhood or school area.', instructions: ['Choose a location (school, park, or street)', 'Gather gloves and trash bags', 'Collect litter for 1 hour', 'Segregate collected waste', 'Document before and after photos'], submissionRequirements: 'Submit description + before/after photos' },
  { title: 'Home Energy Audit', category: 'energy_audit', difficulty: 'Hard', ecoPointsReward: 150, description: "Audit your home's electricity consumption.", instructions: ['List all electrical appliances', 'Note wattage from labels', 'Estimate daily usage hours', 'Calculate monthly consumption', 'Propose 5 reduction strategies'], submissionRequirements: '200+ word report with energy table' },
  { title: 'Water Consumption Survey', category: 'water_survey', difficulty: 'Medium', ecoPointsReward: 80, description: 'Survey water usage in your home for 3 days.', instructions: ['Track water activities for 3 days', 'Note duration and frequency', 'Calculate daily per-person usage', 'Identify top water-wasting habits', 'Implement 2 changes'], submissionRequirements: '3-day survey log and implemented changes' },
  { title: 'Tree Planting Record', category: 'tree_planting', difficulty: 'Easy', ecoPointsReward: 75, description: 'Plant a native tree sapling and document the process.', instructions: ['Choose a native species', 'Prepare planting hole', 'Plant and water sapling', 'Mark with name and date', 'Photograph the process'], submissionRequirements: 'Description + photo link' },
];

export default function TeacherAssignTask() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [form, setForm] = useState({ title: '', category: '', description: '', instructions: [''], difficulty: 'Easy', ecoPointsReward: 75, deadline: '', assignedTo: 'all', submissionRequirements: '', ecoBenefit: '' });
  const [loading, setLoading] = useState(false);

  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addStep = () => up('instructions', [...form.instructions, '']);
  const updateStep = (i, v) => up('instructions', form.instructions.map((s, idx) => idx === i ? v : s));
  const removeStep = (i) => up('instructions', form.instructions.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!form.title || !form.category || !form.difficulty) { toast('Please fill in required fields', 'warning'); return; }
    setLoading(true);
    try {
      const deadline = form.deadline ? new Date(form.deadline).toISOString() : null;
      await api.post('/tasks', { ...form, instructions: form.instructions.filter(s => s.trim()), deadline });
      toast('Task published to all students! 🌱', 'success');
      setForm({ title: '', category: '', description: '', instructions: [''], difficulty: 'Easy', ecoPointsReward: 75, deadline: '', assignedTo: 'all', submissionRequirements: '', ecoBenefit: '' });
      navigate('/teacher/task-review');
    } catch (err) { toast(err.response?.data?.error || 'Failed to create task', 'error'); }
    finally { setLoading(false); }
  };

  const loadTemplate = (t) => { setForm(p => ({ ...p, ...t })); setActiveTab('create'); toast('Template loaded!', 'info'); };

  return (
    <div className="assign-task-page">
      <div className="page-header">
        <h2 style={{ fontFamily: 'DM Serif Display', fontSize: 28, color: '#0f172a' }}>Eco Task Manager 📋</h2>
        <p style={{ color: '#64748b', marginTop: 4 }}>Create and manage eco-tasks for your students</p>
      </div>

      <div className="lessons-tabs" style={{ marginBottom: 24 }}>
        {[['create','Create New Task'],['templates','Task Templates']].map(([v,l]) => (
          <button key={v} className={`tab-btn ${activeTab === v ? 'active' : ''}`} onClick={() => setActiveTab(v)} style={{ fontFamily: 'Plus Jakarta Sans' }}>{l}</button>
        ))}
      </div>

      {activeTab === 'create' && (
        <div className="t-card" style={{ maxWidth: 760 }}>
          {/* Section 1: Basic Info */}
          <div className="form-section">
            <h4 className="form-section-title">Basic Information</h4>
            <div className="t-field">
              <label>Task Title <span className="req">*</span></label>
              <input value={form.title} onChange={e => up('title', e.target.value)} placeholder="Tree Planting Drive" className="t-input" />
            </div>
            <div className="t-field">
              <label>Category <span className="req">*</span></label>
              <div className="cat-grid">
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`cat-choice ${form.category === c.id ? 'selected' : ''}`} onClick={() => up('category', c.id)}>{c.label}</button>
                ))}
              </div>
            </div>
            <div className="t-field">
              <label>Description</label>
              <textarea value={form.description} onChange={e => up('description', e.target.value)} placeholder="Describe this eco-mission..." className="t-textarea" rows={3} />
            </div>
          </div>

          {/* Section 2: Instructions */}
          <div className="form-section">
            <h4 className="form-section-title">Step-by-Step Instructions</h4>
            {form.instructions.map((step, i) => (
              <div key={i} className="step-row">
                <span className="step-num">{i + 1}</span>
                <input value={step} onChange={e => updateStep(i, e.target.value)}
                  placeholder={`Step ${i + 1}: e.g., Find a suitable location...`} className="t-input" style={{ flex: 1 }} />
                {form.instructions.length > 1 && (
                  <button className="step-del" onClick={() => removeStep(i)}>🗑️</button>
                )}
              </div>
            ))}
            <button className="add-step-btn" onClick={addStep}>+ Add Step</button>
          </div>

          {/* Section 3: Parameters */}
          <div className="form-section">
            <h4 className="form-section-title">Task Parameters</h4>
            <div className="t-params-row">
              <div className="t-field">
                <label>Difficulty <span className="req">*</span></label>
                <div className="diff-toggle">
                  {['Easy','Medium','Hard'].map(d => (
                    <button key={d} className={`diff-toggle-btn ${form.difficulty === d ? 'active-' + d.toLowerCase() : ''}`} onClick={() => up('difficulty', d)}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="t-field">
                <label>Eco-Points Reward</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="number" value={form.ecoPointsReward} onChange={e => up('ecoPointsReward', parseInt(e.target.value))} className="t-input" style={{ width: 120 }} min={10} max={300} />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[25,50,75,100,150].map(n => <button key={n} className="pts-preset" onClick={() => up('ecoPointsReward', n)}>{n}</button>)}
                  </div>
                </div>
              </div>
              <div className="t-field">
                <label>Deadline</label>
                <input type="datetime-local" value={form.deadline} onChange={e => up('deadline', e.target.value)} className="t-input" />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {[['Tomorrow', 1], ['3 Days', 3], ['1 Week', 7], ['2 Weeks', 14]].map(([l, d]) => (
                    <button key={d} className="pts-preset" onClick={() => {
                      const dt = new Date(); dt.setDate(dt.getDate() + d);
                      up('deadline', dt.toISOString().slice(0, 16));
                    }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Submission */}
          <div className="form-section">
            <h4 className="form-section-title">Submission Requirements</h4>
            <div className="t-field">
              <label>What should students submit?</label>
              <textarea value={form.submissionRequirements} onChange={e => up('submissionRequirements', e.target.value)}
                placeholder="Students must submit: description of activity + at least one photo..." className="t-textarea" rows={2} />
            </div>
            <div className="t-field">
              <label>Eco Benefit (optional)</label>
              <input value={form.ecoBenefit} onChange={e => up('ecoBenefit', e.target.value)} placeholder="Each tree absorbs ~22 kg of CO₂ per year..." className="t-input" />
            </div>
          </div>

          <div className="form-actions">
            <button className="t-btn-outline" onClick={() => navigate('/teacher')}>Cancel</button>
            <button className="t-btn-primary" onClick={submit} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Publish Task →'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="templates-grid">
          {TEMPLATES.map((t, i) => (
            <div key={i} className="t-card template-card">
              <span className="cat-chip" style={{ marginBottom: 10, display: 'inline-block' }}>{CATEGORIES.find(c => c.id === t.category)?.label}</span>
              <h4 style={{ fontFamily: 'DM Serif Display', fontSize: 18, color: '#0f172a', marginBottom: 8 }}>{t.title}</h4>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.6 }}>{t.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`diff-chip ${t.difficulty.toLowerCase()}`}>{t.difficulty}</span>
                  <span className="pts-badge">🌱 {t.ecoPointsReward} pts</span>
                </div>
                <button className="t-btn-primary" style={{ height: 34, padding: '0 16px', fontSize: 13 }} onClick={() => loadTemplate(t)}>Use Template →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
