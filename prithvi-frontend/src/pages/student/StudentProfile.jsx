import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { useToast } from '../../components/shared/Toast';
import { useInView } from '../../hooks/useInView';
import CountUp from '../../components/shared/CountUp';
import ProgressRing from '../../components/shared/ProgressRing';
import './StudentProfile.css';

const AVATARS = ['🌿','🌍','🦋','🏔️','🔭','🌾'];
const AVATAR_NAMES = ['Forest Ranger','Earth Explorer','Nature Spirit','Mountain Climber','Eco Scientist','Green Farmer'];

const BADGE_DATA = {
  'tree-planter':     { name:'Tree Planter',     icon:'🌳', rarity:'common',    desc:'Complete 3 tree planting tasks' },
  'waste-warrior':    { name:'Waste Warrior',     icon:'♻️', rarity:'common',    desc:'Complete 3 waste segregation tasks' },
  'water-guardian':   { name:'Water Guardian',    icon:'💧', rarity:'rare',      desc:'Complete 3 water conservation tasks' },
  'energy-saver':     { name:'Energy Saver',      icon:'⚡', rarity:'rare',      desc:'Complete 2 energy audit tasks' },
  'eco-scholar':      { name:'Eco Scholar',       icon:'📚', rarity:'common',    desc:'Complete 5 lessons' },
  'quiz-master':      { name:'Quiz Master',       icon:'🎯', rarity:'rare',      desc:'Get 3 perfect quiz scores' },
  'streak-7':         { name:'Streak Warrior',    icon:'🔥', rarity:'uncommon',  desc:'Maintain a 7-day streak' },
  'streak-30':        { name:'Monthly Guardian',  icon:'🏅', rarity:'epic',      desc:'Maintain a 30-day streak' },
  'climate-champion': { name:'Climate Champion',  icon:'🌍', rarity:'epic',      desc:'Earn 500 eco-points' },
  'eco-legend':       { name:'Eco Legend',        icon:'👑', rarity:'legendary', desc:'Earn 2000 eco-points' },
};

const RARITY_COLORS = {
  common: '#22c55e', uncommon: '#38bdf8', rare: '#a78bfa', epic: '#f59e0b', legendary: '#f59e0b',
};

const LEVELS = [
  { name:'Earth Seedling', threshold:0, icon:'🌱' },
  { name:'Eco Sprout', threshold:100, icon:'🌿' },
  { name:'Green Warrior', threshold:250, icon:'🌳' },
  { name:'Earth Guardian', threshold:500, icon:'🌍' },
  { name:'Nature Champion', threshold:1000, icon:'🦋' },
  { name:'Planet Protector', threshold:2000, icon:'👑' },
];

const INTERESTS = [
  '🌳 Trees & Forests','💧 Water Conservation','🌬️ Air Quality','🦋 Wildlife',
  '♻️ Waste Management','☀️ Solar Energy','🌾 Sustainable Farming','🌊 Ocean Health',
  '🌡️ Climate Action','🏙️ Urban Greening','🐝 Pollinators','🌿 Organic Living',
];

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [points, setPoints] = useState(null);
  const [badges, setBadges] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', avatarId: 1, interests: [], ecoPledge: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [statsRef, statsInView] = useInView();

  useEffect(() => {
    Promise.all([
      api.get('/points/my'),
      api.get('/points/badges'),
      api.get('/points/history?limit=20'),
    ]).then(([p, b, h]) => {
      setPoints(p.data.points);
      setBadges(b.data.badges || []);
      setHistory(h.data.history || []);
    }).finally(() => setLoading(false));

    if (user) {
      setForm({ name: user.name || '', avatarId: user.avatarId || 1, interests: user.interests || [], ecoPledge: user.ecoPledge || '' });
    }
  }, [user]);

  const totalPoints = points?.totalPoints || user?.ecoPoints || 0;
  const currentLevel = LEVELS.find(l => l.name === (points?.level || user?.level)) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1] || null;
  const xpPct = nextLevel
    ? Math.min(100, ((totalPoints - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100)
    : 100;
  const earnedBadges = badges.filter(b => b.earned);
  const streak = points?.stats?.currentStreak || user?.streakDays || 0;

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', form);
      setUser(res.data.user);
      setEditing(false);
      toast('Profile updated! 🌱', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Update failed', 'error');
    } finally { setSaving(false); }
  };

  const toggleInterest = (tag) => {
    setForm(p => ({
      ...p,
      interests: p.interests.includes(tag) ? p.interests.filter(i => i !== tag) : [...p.interests, tag],
    }));
  };

  if (loading) return (
    <div className="profile-loading">
      <div className="prithvi-skeleton-shimmer" style={{ height: 200, borderRadius: 20, marginBottom: 20 }} />
      <div className="prithvi-skeleton-shimmer" style={{ height: 300, borderRadius: 16 }} />
    </div>
  );

  return (
    <div className="student-profile">
      {/* ── PROFILE HERO ── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div className={`profile-avatar-ring rarity-${earnedBadges.length > 5 ? 'legendary' : earnedBadges.length > 3 ? 'epic' : 'common'}`}>
              <div className="profile-avatar-circle">
                {AVATARS[(user?.avatarId || 1) - 1]}
              </div>
            </div>
            <div className="profile-level-badge prithvi-text-pop-in">
              {currentLevel.icon} Level {LEVELS.indexOf(currentLevel) + 1}
            </div>
          </div>

          {/* Name + meta */}
          <div className="profile-hero-info">
            <h1 className="profile-name">{user?.name}</h1>
            <div className="profile-meta-row">
              <span className="profile-school">🏫 {user?.school?.split(',')[0]}</span>
              <span className="profile-grade">📋 {user?.grade} • Section {user?.section || '—'}</span>
            </div>
            {user?.ecoPledge && (
              <div className="profile-pledge">
                <span className="pledge-quote">"</span>{user.ecoPledge}<span className="pledge-quote">"</span>
              </div>
            )}
          </div>

          {/* Edit button */}
          <button className="profile-edit-btn prithvi-btn-lift-hover prithvi-btn-scale-click"
            onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        </div>

        {/* Quick stats bar */}
        <div className="profile-stats-bar" ref={statsRef}>
          {[
            { icon:'🌱', value: totalPoints, label:'Eco-Points' },
            { icon:'🏅', value: earnedBadges.length, label:'Badges Earned' },
            { icon:'📚', value: points?.stats?.lessonsCompleted || 0, label:'Lessons Done' },
            { icon:'✅', value: points?.stats?.tasksCompleted || 0, label:'Tasks Done' },
            { icon:'🔥', value: streak, label:'Day Streak' },
          ].map((s, i) => (
            <div key={i} className="profile-stat">
              <span className="profile-stat-icon">{s.icon}</span>
              <span className="profile-stat-value">
                {statsInView ? <CountUp to={s.value} duration={1000 + i * 100} /> : 0}
              </span>
              <span className="profile-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="lessons-tabs" style={{ marginBottom: 24 }}>
        {[['overview','Overview'],['badges','Badges'],['history','Points History'],['interests','Interests']].map(([v,l]) => (
          <button key={v} className={`tab-btn ${activeTab===v?'active':''}`} onClick={() => setActiveTab(v)}>{l}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="profile-overview">
          <div className="profile-overview-grid">
            {/* XP Progress */}
            <div className="dash-card prithvi-card-lift-hover">
              <h3 className="profile-card-heading">🌍 Level Progress</h3>
              <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                <ProgressRing percentage={xpPct} size={120} thickness={12} color="#22c55e"
                  label={`${Math.round(xpPct)}%`} sublabel="to next" />
                <div>
                  <div style={{ fontFamily:'Baloo 2', fontSize:22, fontWeight:700, color:'#1a2e1a' }}>
                    {currentLevel.icon} {currentLevel.name}
                  </div>
                  <div style={{ fontSize:13, color:'#7a907a', margin:'6px 0' }}>
                    {totalPoints.toLocaleString('en-IN')} total XP
                  </div>
                  {nextLevel && (
                    <div style={{ fontSize:12, color:'#22c55e', fontWeight:700 }}>
                      🌟 {(nextLevel.threshold - totalPoints).toLocaleString()} XP to {nextLevel.name}
                    </div>
                  )}
                  {/* Level milestones */}
                  <div className="profile-milestones">
                    {LEVELS.map((l, i) => (
                      <div key={l.name} className={`profile-milestone ${LEVELS.indexOf(currentLevel) >= i ? 'done' : ''}`}
                        title={l.name}>
                        <span>{l.icon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Streak card */}
            <div className="dash-card prithvi-card-lift-hover">
              <h3 className="profile-card-heading">
                <span className={streak > 0 ? 'prithvi-streak-fire-flicker' : ''}>🔥</span>
                {' '}Activity Streak
              </h3>
              <div style={{ fontFamily:'Baloo 2', fontSize:48, fontWeight:800, color:'#f59e0b', lineHeight:1 }}>
                {streak} <span style={{ fontSize:18, color:'#7a907a' }}>days</span>
              </div>
              <div style={{ fontSize:13, color:'#7a907a', margin:'8px 0 16px' }}>
                Longest: {points?.stats?.longestStreak || streak} days
              </div>
              <div className="profile-streak-grid">
                {Array.from({ length: 28 }).map((_, i) => {
                  const active = i >= 28 - streak;
                  return <div key={i} className={`streak-dot ${active?'active':''} ${i===27?'today':''}`} />;
                })}
              </div>
            </div>

            {/* Task category breakdown */}
            <div className="dash-card prithvi-card-lift-hover">
              <h3 className="profile-card-heading">📊 Task Breakdown</h3>
              {Object.entries(points?.stats?.tasksByCategory || {}).length === 0 ? (
                <div style={{ color:'#7a907a', fontSize:14, padding:'20px 0' }}>Complete tasks to see your breakdown!</div>
              ) : Object.entries(points?.stats?.tasksByCategory || {}).map(([cat, count]) => (
                <div key={cat} className="profile-cat-bar">
                  <span className="profile-cat-label">{cat.replace(/_/g,' ')}</span>
                  <div className="profile-cat-track">
                    <div className="profile-cat-fill" style={{ width:`${Math.min(100, count * 20)}%` }} />
                  </div>
                  <span className="profile-cat-count">{count}</span>
                </div>
              ))}
            </div>

            {/* Recent badges */}
            <div className="dash-card prithvi-card-lift-hover">
              <h3 className="profile-card-heading">🏅 Recent Badges</h3>
              {earnedBadges.length === 0 ? (
                <div style={{ color:'#7a907a', fontSize:14, padding:'20px 0' }}>Complete tasks to earn badges!</div>
              ) : (
                <div className="profile-badges-mini">
                  {earnedBadges.slice(0, 6).map(badge => {
                    const data = BADGE_DATA[badge.id] || { name: badge.id, icon:'🏅', rarity:'common' };
                    return (
                      <div key={badge.id} className="profile-badge-mini prithvi-badge-unlock-pop"
                        title={`${data.name}: ${data.desc}`}
                        style={{ borderColor: RARITY_COLORS[data.rarity] }}>
                        <span>{data.icon}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BADGES TAB ── */}
      {activeTab === 'badges' && (
        <div className="profile-badges-grid">
          {Object.entries(BADGE_DATA).map(([id, data]) => {
            const earned = badges.find(b => b.id === id)?.earned;
            return (
              <div key={id} className={`profile-badge-card prithvi-card-lift-hover ${earned ? 'earned' : 'locked'}`}>
                <div className="profile-badge-icon-wrap" style={{ borderColor: earned ? RARITY_COLORS[data.rarity] : '#e2e8f0' }}>
                  <span style={{ fontSize: 36, filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.4 }}>
                    {data.icon}
                  </span>
                  {!earned && <div className="profile-badge-lock">🔒</div>}
                  {earned && (
                    <div className="profile-badge-rarity-dot" style={{ background: RARITY_COLORS[data.rarity] }} />
                  )}
                </div>
                <div className="profile-badge-name">{data.name}</div>
                <div className="profile-badge-rarity" style={{ color: RARITY_COLORS[data.rarity] }}>{data.rarity}</div>
                <div className="profile-badge-desc">{data.desc}</div>
                {earned && <div className="profile-badge-earned-chip">✓ Earned</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <div className="dash-card">
          <h3 className="profile-card-heading">📋 Points History</h3>
          {history.length === 0 ? (
            <div className="no-results"><span>📋</span><p>No points history yet. Complete tasks and lessons!</p></div>
          ) : (
            <div className="profile-history-list">
              {history.map((entry, i) => (
                <div key={i} className="profile-history-row" style={{ animationDelay:`${i*0.03}s` }}>
                  <div className="history-icon">
                    {entry.source === 'task' ? '✅' : entry.source === 'lesson' ? '📚' : entry.source === 'game' ? '🎮' : '🌱'}
                  </div>
                  <div className="history-body">
                    <div className="history-reason">{entry.reason || 'Eco action completed'}</div>
                    <div className="history-date">{new Date(entry.earnedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                  </div>
                  <div className="history-amount" style={{ color: entry.amount > 0 ? '#22c55e' : '#ef4444' }}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount} XP
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── INTERESTS TAB ── */}
      {activeTab === 'interests' && (
        <div className="dash-card">
          <h3 className="profile-card-heading">🌱 Your Eco Interests</h3>
          <p style={{ fontSize:14, color:'#7a907a', marginBottom:20 }}>
            These help personalize your lessons and task recommendations.
          </p>
          <div className="interest-tags">
            {INTERESTS.map(tag => {
              const selected = (user?.interests || []).includes(tag);
              return (
                <div key={tag} className={`interest-tag-display ${selected ? 'selected' : ''}`}>
                  {tag}
                </div>
              );
            })}
          </div>
          <button className="s-btn-green prithvi-btn-ripple" style={{ marginTop:20 }} onClick={() => setEditing(true)}>
            Edit Interests →
          </button>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editing && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setEditing(false)}>
          <div className="modal-card" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 style={{ fontFamily:'Baloo 2', fontSize:20, color:'#1a2e1a' }}>Edit Your Profile ✏️</h3>
              <button className="modal-close" onClick={() => setEditing(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {/* Name */}
              <div>
                <label className="profile-field-label">Full Name</label>
                <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}
                  className="profile-input" placeholder="Your name" />
              </div>

              {/* Avatar */}
              <div>
                <label className="profile-field-label">Choose Avatar</label>
                <div className="profile-avatar-grid">
                  {AVATARS.map((a, i) => (
                    <div key={i} className={`profile-avatar-opt ${form.avatarId === i+1 ? 'selected' : ''}`}
                      onClick={() => setForm(p=>({...p, avatarId:i+1}))}>
                      <span style={{ fontSize:28 }}>{a}</span>
                      <span style={{ fontSize:10, color:'#7a907a' }}>{AVATAR_NAMES[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="profile-field-label">Eco Interests <span style={{ color:'#7a907a', fontWeight:400 }}>(select at least 3)</span></label>
                <div className="interest-tags" style={{ marginTop:8 }}>
                  {INTERESTS.map(tag => (
                    <button key={tag} className={`interest-tag ${form.interests.includes(tag)?'selected':''}`}
                      onClick={() => toggleInterest(tag)}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pledge */}
              <div>
                <label className="profile-field-label">Eco Pledge <span style={{ color:'#7a907a', fontWeight:400 }}>(optional)</span></label>
                <textarea value={form.ecoPledge} onChange={e => setForm(p=>({...p,ecoPledge:e.target.value.slice(0,150)}))}
                  className="profile-textarea" placeholder="I pledge to reduce plastic use..." />
                <span className="char-count">{form.ecoPledge.length}/150</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="lp-nav-btn secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="lp-nav-btn primary prithvi-btn-ripple" onClick={saveProfile} disabled={saving}>
                {saving ? <span className="spinner" /> : 'Save Changes →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
