import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import CountUp from '../../components/shared/CountUp';
import ProgressRing from '../../components/shared/ProgressRing';
import EcoBuddy from '../../components/shared/EcoBuddy';
import { useInView } from '../../hooks/useInView';
import { triggerXPFloat, triggerConfetti, triggerLeafRain, attachRipple } from '../../utils/effects';
import './StudentDashboard.css';

const ECO_TIPS = [
  "Turning off the tap while brushing saves up to 8 liters of water per minute!",
  "A single tree absorbs ~22 kg of CO₂ per year and provides oxygen for 4 people.",
  "Recycling one aluminium can saves enough energy to run a TV for 3 hours.",
  "LED bulbs use 75% less energy and last 25× longer than incandescent bulbs.",
  "Composting food waste reduces methane emissions from landfills significantly.",
  "A 5-minute shower uses 35–70 litres of water. Shorter showers save the planet!",
  "One plastic bag takes up to 1,000 years to decompose in a landfill.",
];

const LEVELS = [
  { name: 'Earth Seedling', threshold: 0, icon: '🌱' },
  { name: 'Eco Sprout', threshold: 100, icon: '🌿' },
  { name: 'Green Warrior', threshold: 250, icon: '🌳' },
  { name: 'Earth Guardian', threshold: 500, icon: '🌍' },
  { name: 'Nature Champion', threshold: 1000, icon: '🦋' },
  { name: 'Planet Protector', threshold: 2000, icon: '👑' },
];

const BADGE_ICONS = {
  'tree-planter':'🌳','waste-warrior':'♻️','water-guardian':'💧',
  'energy-saver':'⚡','eco-scholar':'📚','quiz-master':'🎯',
  'streak-7':'🔥','streak-30':'🏅','climate-champion':'🌍','eco-legend':'👑',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Stat Card with prithvi-card-lift-hover + count-up on inView ── */
function StatCard({ label, value, icon, color, sub, prefix = '', delay = 0 }) {
  const [cardRef, inView] = useInView();
  return (
    <div ref={cardRef} className="stat-card prithvi-card-lift-hover"
      style={{ animationDelay: `${delay}s`, animation: 'slideInUp 400ms ease both' }}>
      <div className="stat-card-icon" style={{ background: color + '20' }}>{icon}</div>
      <div>
        <div className="stat-card-value" style={{ color }}>
          {prefix}
          {typeof value === 'number' && inView
            ? <CountUp to={value} duration={1200} />
            : (typeof value === 'number' ? 0 : value)}
        </div>
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-sub">{sub}</div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [tipIdx, setTipIdx] = useState(0);
  const [buddySpeech, setBuddySpeech] = useState('');
  const [loading, setLoading] = useState(true);
  const [newNotifs, setNewNotifs] = useState([]);

  // refs for XP float targets
  const pointsCardRef = useRef();
  const submitBtnRef = useRef();
  const xpBarRef = useRef();
  const [xpBarRef2, xpInView] = useInView();

  useEffect(() => {
    Promise.all([
      api.get('/points/my'),
      api.get('/tasks'),
      api.get('/users/leaderboard?limit=5'),
      api.get('/points/badges'),
      api.get('/users/notifications'),
    ]).then(([p, t, lb, b, n]) => {
      const pts = p.data.points;
      setPoints(pts);
      setTasks(t.data.tasks?.filter(t => !t.mySubmission || t.mySubmission.status === 'rejected').slice(0, 3) || []);
      setLeaderboard(lb.data.leaderboard || []);
      setBadges(b.data.badges || []);
      // Show XP float for any recent approvals in notifications
      const recentApprovals = (n.data.notifications || []).filter(n => n.type === 'task_approved' && !n.read);
      if (recentApprovals.length > 0) {
        setNewNotifs(recentApprovals);
      }
    }).finally(() => setLoading(false));

    const iv = setInterval(() => setTipIdx(p => (p + 1) % ECO_TIPS.length), 6000);
    return () => clearInterval(iv);
  }, []);

  // Trigger XP float for recent approval notifications
  useEffect(() => {
    if (newNotifs.length > 0 && pointsCardRef.current) {
      setTimeout(() => triggerXPFloat(pointsCardRef.current, '🎉'), 800);
    }
  }, [newNotifs]);

  const totalPoints = points?.totalPoints || user?.ecoPoints || 0;
  const currentLevelObj = LEVELS.find(l => l.name === (points?.level || user?.level)) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevelObj) + 1] || null;
  const xpPct = nextLevel
    ? Math.min(100, ((totalPoints - currentLevelObj.threshold) / (nextLevel.threshold - currentLevelObj.threshold)) * 100)
    : 100;
  const streak = points?.stats?.currentStreak || user?.streakDays || 0;
  const myRank = leaderboard.find(e => e.id === user?.id)?.rank;

  const showBuddySpeech = () => {
    const msgs = streak > 5
      ? [`कमाल हो! ${streak} day streak! 🔥`, 'You\'re unstoppable! 🌱', 'Earth loves you! 🌍']
      : ['Welcome back! 🌱', 'Let\'s protect Earth today!', 'Ready for eco-missions? 🎯'];
    setBuddySpeech(msgs[Math.floor(Math.random() * msgs.length)]);
    setTimeout(() => setBuddySpeech(''), 3000);
  };

  if (loading) {
    return (
      <div className="dash-loading">
        {/* Skeleton shimmer while loading */}
        <div style={{ width: '100%' }}>
          <div className="prithvi-skeleton-shimmer" style={{ height: 140, borderRadius: 20, marginBottom: 20 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
            {[1,2,3,4].map(i => <div key={i} className="prithvi-skeleton-shimmer" style={{ height: 88, borderRadius: 14 }} />)}
          </div>
          <div className="prithvi-skeleton-shimmer" style={{ height: 300, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">

      {/* ── GREETING BANNER ── */}
      <div className="greeting-banner" style={{ animation: 'slideInUp 400ms ease' }}>
        <div className="greeting-content">
          <h2 className="prithvi-text-fade-up visible">
            {getGreeting()}, {user?.name?.split(' ')[0]}! 🌿
          </h2>
          <p>{tasks.length > 0 ? `${tasks.length} task${tasks.length > 1 ? 's' : ''} pending — let's go!` : 'All tasks done! Great work! 🎉'}</p>
          {streak > 0 && (
            <div className="streak-badge">
              <span className="prithvi-streak-fire-flicker">🔥</span>
              {' '}{streak} day streak! Keep it up!
            </div>
          )}
        </div>
        <div className="greeting-buddy" onClick={showBuddySpeech} style={{ cursor: 'pointer', position: 'relative' }}>
          {buddySpeech && <div className="buddy-speech">{buddySpeech}</div>}
          <EcoBuddy size={90} mood={streak > 5 ? 'excited' : 'happy'} animated />
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="stats-row">
        <div ref={pointsCardRef}>
          <StatCard label="Total Eco-Points" value={totalPoints} icon="🌱" color="#22c55e"
            sub="+45 this week" delay={0} />
        </div>
        <StatCard label="Tasks Completed" value={points?.stats?.tasksCompleted || 0} icon="✅"
          color="#0284c7" sub={`${tasks.length} pending`} delay={0.08} />
        <StatCard label="Lessons Finished" value={points?.stats?.lessonsCompleted || 0} icon="📚"
          color="#f59e0b" sub="Keep learning!" delay={0.16} />
        <StatCard label="School Rank" value={myRank || 0} icon="🏆" prefix="#"
          color="#f59e0b" sub={myRank ? '↑ Top performer' : 'Earn to rank!'} delay={0.24} />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="dash-grid">
        {/* ── LEFT ── */}
        <div className="dash-left">

          {/* Level & XP Card */}
          <div className="dash-card level-card prithvi-card-lift-hover">
            <div className="level-header">
              <div className="level-avatar">
                <span style={{ fontSize: 32 }}>{['🌿','🌍','🦋','🏔️','🔭','🌾'][(user?.avatarId||1)-1]}</span>
              </div>
              <div>
                <div className="level-badge-chip prithvi-text-pop-in">⭐ Level {LEVELS.indexOf(currentLevelObj)+1}</div>
                <div className="level-name">{currentLevelObj.icon} {currentLevelObj.name}</div>
              </div>
              {/* Circular XP ring on right — prithvi-ring-animate */}
              <div style={{ marginLeft: 'auto' }}>
                <ProgressRing percentage={xpPct} size={80} thickness={8} color="#22c55e"
                  label={`${Math.round(xpPct)}%`} sublabel="to next" />
              </div>
            </div>

            {/* XP Bar — prithvi-progress-fill */}
            <div ref={xpBarRef2} className="xp-bar-wrap">
              <div className="xp-bar-label">
                <span>{totalPoints.toLocaleString('en-IN')} XP</span>
                {nextLevel && <span style={{ color:'#7a907a' }}>Next: {nextLevel.name} at {nextLevel.threshold}</span>}
              </div>
              <div className="xp-bar-track">
                <div className="xp-bar-fill prithvi-progress-fill"
                  style={{ '--target-width': `${xpPct}%` }}>
                  <div className="bar" style={{ width: xpInView ? `${xpPct}%` : '0%' }}>
                    {/* shimmer via ::after in CSS */}
                  </div>
                </div>
              </div>
              {nextLevel && <div className="xp-to-next">🌟 {nextLevel.threshold - totalPoints} XP to {nextLevel.name}</div>}
            </div>

            {/* Level milestones */}
            <div className="level-milestones">
              {LEVELS.map((l, i) => (
                <div key={l.name} className={`milestone ${LEVELS.indexOf(currentLevelObj) >= i ? 'done' : ''} ${l.name === currentLevelObj.name ? 'current' : ''}`}>
                  <span>{l.icon}</span>
                  <span className="milestone-name">{l.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tasks */}
          <div className="dash-card">
            <div className="section-head">
              <h3>🌿 Active Tasks</h3>
              <button className="view-all-btn prithvi-btn-lift-hover" onClick={() => navigate('/student/tasks')}>View All →</button>
            </div>
            {tasks.length === 0 ? (
              <div className="empty-tasks">
                <span style={{ fontSize: 48 }}>🎉</span>
                <p>All caught up! No pending tasks.</p>
                <button className="s-btn-outline" onClick={() => navigate('/student/tasks')}>Browse Tasks</button>
              </div>
            ) : tasks.map((task, i) => {
              const deadline = task.deadline ? new Date(task.deadline) : null;
              const hoursLeft = deadline ? (deadline - Date.now()) / 3600000 : Infinity;
              const isOverdue = hoursLeft < 0;
              const isUrgent = hoursLeft < 24 && !isOverdue;
              return (
                <div key={task.id} className="task-card-mini prithvi-card-lift-hover"
                  style={{ animationDelay: `${i * 0.1}s`, animation: 'slideInUp 300ms ease both' }}>
                  <div className={`task-diff-bar ${task.difficulty?.toLowerCase()}`} />
                  <div className="task-mini-body">
                    <div className="task-meta-row">
                      <span className={`diff-chip ${task.difficulty?.toLowerCase()}`}>{task.difficulty}</span>
                      <span className="cat-chip">{task.category?.replace(/_/g,' ')}</span>
                      {isOverdue ? <span className="overdue-chip">OVERDUE</span>
                        : deadline && <span className={`deadline-chip ${isUrgent?'urgent':''}`}>
                            {isUrgent ? `⚠️ ${Math.ceil(hoursLeft)}h left` : deadline.toLocaleDateString()}
                          </span>}
                    </div>
                    <div className="task-title">{task.title}</div>
                    <div className="task-desc">{task.description?.slice(0,80)}...</div>
                    <div className="task-footer">
                      <span className="pts-badge">🌱 +{task.ecoPointsReward} pts</span>
                      <button className="s-btn-green-sm prithvi-btn-ripple prithvi-btn-scale-click"
                        onClick={() => navigate('/student/tasks')}>
                        Submit →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended Lesson */}
          <div className="dash-card lesson-rec-card prithvi-card-hover-expand">
            <div className="lesson-rec-body">
              <div className="lesson-rec-icon">🌳</div>
              <div>
                <span className="cat-chip">Forests &amp; Trees</span>
                <div className="lesson-rec-title">The Secret Life of Punjab's Forests</div>
                <div className="lesson-rec-meta">
                  <span>🌟 +120 XP on completion</span>
                  <span>⏱ ~20 minutes</span>
                </div>
                <button className="s-btn-green prithvi-btn-ripple prithvi-btn-lift-hover"
                  onClick={() => navigate('/student/lessons')}>
                  Start Lesson →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="dash-right">

          {/* Points Ring */}
          <div className="dash-card points-ring-card prithvi-card-lift-hover">
            <h3>🌱 Eco-Points</h3>
            <div style={{ display:'flex', justifyContent:'center', marginTop:16 }}>
              <ProgressRing percentage={Math.min(100,xpPct)} size={160} thickness={12}
                color="#22c55e" label={totalPoints.toLocaleString('en-IN')} sublabel="Eco-Points" />
            </div>
            <div className="points-ring-level prithvi-text-pop-in">
              {currentLevelObj.icon} {currentLevelObj.name}
            </div>
          </div>

          {/* Streak */}
          <div className="dash-card streak-card prithvi-card-lift-hover">
            <h3>
              <span className={streak > 0 ? 'prithvi-streak-fire-flicker' : 'prithvi-streak-fire-flicker no-streak'}>🔥</span>
              {' '}Your Streak
            </h3>
            <div className="streak-count">
              {streak} <span>days</span>
            </div>
            <div className="streak-grid">
              {Array.from({ length: 28 }).map((_, i) => {
                const isActive = i >= 28 - streak;
                const isToday = i === 27;
                return <div key={i} className={`streak-dot ${isActive?'active':''} ${isToday?'today':''}`} />;
              })}
            </div>
            <div className="streak-stats">
              <span>🔥 Current: {streak} days</span>
              <span>⭐ Best: {points?.stats?.longestStreak || streak} days</span>
            </div>
          </div>

          {/* Badges */}
          <div className="dash-card prithvi-card-lift-hover">
            <div className="section-head">
              <h3>🏅 My Badges</h3>
              <span style={{ fontSize:12, color:'#7a907a' }}>{badges.filter(b=>b.earned).length} earned</span>
            </div>
            <div className="badges-grid">
              {badges.slice(0,6).map(badge => (
                <div key={badge.id}
                  className={`badge-item ${badge.earned ? 'earned prithvi-card-shimmer' : 'locked'}`}
                  title={badge.earned ? `${badge.name} — Earned!` : `${badge.name} — Keep going!`}>
                  <span>{BADGE_ICONS[badge.id] || '🏅'}</span>
                  {!badge.earned && <div className="badge-lock">🔒</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="dash-card prithvi-card-lift-hover">
            <div className="section-head">
              <h3>🏆 School Leaderboard</h3>
              <button className="view-all-btn" onClick={() => navigate('/student/contests')}>Full →</button>
            </div>
            <div className="lb-list">
              {leaderboard.slice(0,5).map((entry, i) => {
                const isMe = entry.id === user?.id;
                return (
                  <div key={entry.id||i} className={`lb-row ${isMe?'mine':''}`}
                    style={{ animation: `slideInUp 300ms ease ${i*0.05}s both` }}>
                    <div className={`lb-rank rank-${entry.rank}`}>
                      {entry.rank===1?'👑':entry.rank===2?'🥈':entry.rank===3?'🥉':entry.rank}
                    </div>
                    <div className="lb-avatar">{['🌿','🌍','🦋','🏔️','🔭','🌾'][(entry.avatarId||1)-1]}</div>
                    <div className="lb-info">
                      <span className="lb-name">{entry.name}{isMe&&<span className="you-chip">YOU</span>}</span>
                      <span className="lb-grade">{entry.grade}</span>
                    </div>
                    <div className="lb-pts" style={{ color:'#22c55e', fontWeight:800 }}>
                      {(entry.totalPoints||0).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eco Tip */}
          <div className="dash-card eco-tip-card">
            <div className="eco-tip-leaf">🌿</div>
            <h4>Eco Tip of the Day</h4>
            <p className="eco-tip-text">{ECO_TIPS[tipIdx]}</p>
            <div className="eco-tip-actions">
              <button className="tip-next prithvi-btn-scale-click"
                onClick={() => setTipIdx(p => (p+1) % ECO_TIPS.length)}>🔄 Next tip</button>
              <a className="tip-share prithvi-btn-scale-click"
                href={`https://wa.me/?text=${encodeURIComponent('🌍 Eco Tip: ' + ECO_TIPS[tipIdx] + ' — via Prithvi')}`}
                target="_blank" rel="noreferrer">📤 Share</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
