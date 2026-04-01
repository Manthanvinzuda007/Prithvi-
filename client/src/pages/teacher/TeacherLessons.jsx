import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/shared/Toast';
import './TeacherLessons.css';

const EMPTY_LESSON = { title: '', category: 'Forests & Trees', difficulty: 'Beginner', description: '', xpReward: 100, durationMinutes: 20, status: 'draft', assignedTo: 'all', chapters: [{ id: Date.now().toString(), title: 'Chapter 1', order: 1, content: [] }] };

export default function TeacherLessons() {
  const toast = useToast();
  const [tab, setTab] = useState('list');
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState(EMPTY_LESSON);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/lessons').then(r => setLessons(r.data.lessons || [])).finally(() => setLoading(false));
  }, []);

  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const upChapter = (idx, key, val) => setForm(p => {
    const chs = [...p.chapters];
    chs[idx] = { ...chs[idx], [key]: val };
    return { ...p, chapters: chs };
  });
  const addChapter = () => {
    const newCh = { id: Date.now().toString(), title: `Chapter ${form.chapters.length + 1}`, order: form.chapters.length + 1, content: [] };
    setForm(p => ({ ...p, chapters: [...p.chapters, newCh] }));
    setActiveChapterIdx(form.chapters.length);
  };
  const addBlock = (type) => {
    const block = type === 'text' ? { type: 'text', text: '' }
      : type === 'fact_box' ? { type: 'fact_box', text: '' }
      : type === 'quiz' ? { type: 'quiz', id: `quiz-${Date.now()}`, question: '', options: ['','','',''], correctIndex: 0, explanation: '', xpReward: 10 }
      : { type, text: '' };
    upChapter(activeChapterIdx, 'content', [...(form.chapters[activeChapterIdx]?.content || []), block]);
  };
  const updateBlock = (chIdx, bIdx, updates) => {
    const chs = [...form.chapters];
    const content = [...chs[chIdx].content];
    content[bIdx] = { ...content[bIdx], ...updates };
    chs[chIdx] = { ...chs[chIdx], content };
    setForm(p => ({ ...p, chapters: chs }));
  };
  const removeBlock = (chIdx, bIdx) => {
    const chs = [...form.chapters];
    chs[chIdx].content = chs[chIdx].content.filter((_, i) => i !== bIdx);
    setForm(p => ({ ...p, chapters: chs }));
  };

  const publish = async (status) => {
    if (!form.title) { toast('Please add a lesson title', 'warning'); return; }
    setSaving(true);
    try {
      if (form.id) {
        await api.put(`/lessons/${form.id}`, { ...form, status });
        toast('Lesson updated!', 'success');
      } else {
        await api.post('/lessons', { ...form, status });
        toast(status === 'published' ? 'Lesson published to students! 📚' : 'Lesson saved as draft', 'success');
      }
      const r = await api.get('/lessons');
      setLessons(r.data.lessons || []);
      setTab('list'); setForm(EMPTY_LESSON); setActiveChapterIdx(0);
    } catch (err) { toast(err.response?.data?.error || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const deleteLesson = async (id) => {
    if (!confirm('Archive this lesson?')) return;
    await api.delete(`/lessons/${id}`);
    setLessons(p => p.filter(l => l.id !== id));
    toast('Lesson archived', 'info');
  };

  const ch = form.chapters[activeChapterIdx];

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans', animation: 'fadeIn 300ms ease' }}>
      <div className="page-header">
        <h2 style={{ fontFamily: 'DM Serif Display', fontSize: 28, color: '#0f172a' }}>Lesson Builder 📚</h2>
      </div>
      <div className="lessons-tabs" style={{ marginBottom: 24 }}>
        {[['list','My Lessons'],['create','Create Lesson']].map(([v,l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)} style={{ fontFamily: 'Plus Jakarta Sans' }}>{l}</button>
        ))}
      </div>

      {tab === 'list' && (
        <div>
          {loading ? <div className="t-loading"><div className="spinner dark" /></div> : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="t-btn-primary" onClick={() => { setForm(EMPTY_LESSON); setTab('create'); }}>+ Create New Lesson</button>
              </div>
              {lessons.length === 0 ? (
                <div className="t-card t-empty"><span style={{ fontSize: 48 }}>📚</span><p>No lessons yet. Create your first!</p></div>
              ) : (
                <div className="lessons-grid">
                  {lessons.map(l => (
                    <div key={l.id} className="lesson-card">
                      <div className="lesson-card-top" style={{ background: `linear-gradient(135deg, #15803d, #22c55e)` }}>
                        <span className="lesson-icon">📖</span>
                        <span className={`lesson-done-badge ${l.status === 'published' ? '' : 'draft-badge'}`}>{l.status === 'published' ? '🟢 Published' : '🟡 Draft'}</span>
                      </div>
                      <div className="lesson-badges-row"><span className="cat-chip">{l.category}</span></div>
                      <div className="lesson-body"><div className="lesson-title">{l.title}</div></div>
                      <div className="lesson-stats"><span>📖 {l.chapters?.length} ch</span><span>⏱ {l.durationMinutes}m</span><span className="lesson-xp">🌟 +{l.xpReward} XP</span></div>
                      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                        <button className="t-btn-primary" style={{ flex: 1, fontSize: 12, height: 34 }} onClick={() => { setForm(l); setTab('create'); }}>Edit</button>
                        <button className="t-btn-outline" style={{ fontSize: 12, height: 34, padding: '0 12px' }} onClick={() => deleteLesson(l.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'create' && (
        <div className="lesson-builder">
          {/* LEFT CONFIG */}
          <div className="lb-config t-card">
            <h4 className="form-section-title">Lesson Settings</h4>
            <div className="t-field"><label>Title *</label><input value={form.title} onChange={e => up('title', e.target.value)} placeholder="Lesson title..." className="t-input" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="t-field">
                <label>Category</label>
                <select value={form.category} onChange={e => up('category', e.target.value)} className="t-select">
                  {['Forests & Trees','Water Conservation','Air Quality','Wildlife','Waste Management','Renewable Energy','Agriculture','Climate Change'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="t-field">
                <label>Difficulty</label>
                <select value={form.difficulty} onChange={e => up('difficulty', e.target.value)} className="t-select">
                  {['Beginner','Intermediate','Advanced'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="t-field"><label>Description</label><textarea value={form.description} onChange={e => up('description', e.target.value)} className="t-textarea" rows={2} placeholder="Brief lesson overview..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="t-field"><label>XP Reward</label><input type="number" value={form.xpReward} onChange={e => up('xpReward', parseInt(e.target.value))} className="t-input" /></div>
              <div className="t-field"><label>Duration (min)</label><input type="number" value={form.durationMinutes} onChange={e => up('durationMinutes', parseInt(e.target.value))} className="t-input" /></div>
            </div>
            <h4 className="form-section-title" style={{ marginTop: 20 }}>Chapters</h4>
            {form.chapters.map((ch, i) => (
              <div key={ch.id} className={`lb-chapter-item ${i === activeChapterIdx ? 'active' : ''}`} onClick={() => setActiveChapterIdx(i)}>
                <span className="step-num">{i + 1}</span>
                <input value={ch.title} onChange={e => upChapter(i, 'title', e.target.value)}
                  className="lb-ch-input" onClick={e => e.stopPropagation()} placeholder="Chapter title" />
              </div>
            ))}
            <button className="add-step-btn" style={{ marginTop: 8, width: '100%' }} onClick={addChapter}>+ Add Chapter</button>
            <div className="form-actions" style={{ marginTop: 20 }}>
              <button className="t-btn-outline" onClick={() => publish('draft')} disabled={saving}>Save Draft</button>
              <button className="t-btn-primary" onClick={() => publish('published')} disabled={saving}>
                {saving ? <span className="spinner" /> : 'Publish Lesson →'}
              </button>
            </div>
          </div>

          {/* RIGHT EDITOR */}
          <div className="lb-editor t-card">
            {ch ? (
              <>
                <h4 className="form-section-title">Editing: {ch.title}</h4>
                <div className="block-toolbar">
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Add Block:</span>
                  {[['text','📄 Text'],['fact_box','🌿 Fact'],['warning_box','⚠️ Warning'],['tip_box','💡 Tip'],['quiz','❓ Quiz']].map(([t,l]) => (
                    <button key={t} className="block-add-btn" onClick={() => addBlock(t)}>{l}</button>
                  ))}
                </div>
                <div className="block-list">
                  {(ch.content || []).map((block, bi) => (
                    <div key={bi} className={`block-item block-${block.type}`}>
                      <div className="block-item-header">
                        <span className="block-type-label">{block.type?.replace('_', ' ')}</span>
                        <button className="step-del" onClick={() => removeBlock(activeChapterIdx, bi)}>🗑️</button>
                      </div>
                      {block.type !== 'quiz' ? (
                        <textarea value={block.text || ''} onChange={e => updateBlock(activeChapterIdx, bi, { text: e.target.value })} className="t-textarea" rows={3} placeholder="Content..." />
                      ) : (
                        <div className="quiz-editor">
                          <input value={block.question || ''} onChange={e => updateBlock(activeChapterIdx, bi, { question: e.target.value })} className="t-input" placeholder="Question text" style={{ marginBottom: 8 }} />
                          {(block.options || ['','','','']).map((opt, oi) => (
                            <div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                              <span className={`quiz-opt-label ${block.correctIndex === oi ? 'correct-label' : ''}`} onClick={() => updateBlock(activeChapterIdx, bi, { correctIndex: oi })}>{['A','B','C','D'][oi]}</span>
                              <input value={opt} onChange={e => { const opts = [...(block.options||['','','',''])]; opts[oi] = e.target.value; updateBlock(activeChapterIdx, bi, { options: opts }); }} className="t-input" placeholder={`Option ${['A','B','C','D'][oi]}`} />
                            </div>
                          ))}
                          <input value={block.explanation || ''} onChange={e => updateBlock(activeChapterIdx, bi, { explanation: e.target.value })} className="t-input" placeholder="Explanation for correct answer..." style={{ marginTop: 8 }} />
                        </div>
                      )}
                    </div>
                  ))}
                  {(ch.content || []).length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: 14 }}>
                      Add content blocks using the toolbar above
                    </div>
                  )}
                </div>
              </>
            ) : <div className="t-empty"><p>Select a chapter to edit its content</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
