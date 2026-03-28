import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { useToast } from '../../components/shared/Toast';
import './StudentContests.css';

export default function StudentContests() {
  const { user } = useAuth();
  const toast = useToast();
  const [leaderboard, setLeaderboard] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [lbPeriod, setLbPeriod] = useState('month');
  const [newPledge, setNewPledge] = useState('');
  const [pledgeCat, setPledgeCat] = useState('General');
  const [loading, setLoading] = useState(true);

  const AVATARS = ['🌿','🌍','🦋','🏔️','🔭','🌾'];

  useEffect(() => {
    Promise.all([
      api.get('/users/leaderboard?limit=20'),
      api.get('/contests/pledges?limit=12'),
    ]).then(([lb, p]) => {
      setLeaderboard(lb.data.leaderboard || []);
      setPledges(p.data.pledges || []);
    }).finally(() => setLoading(false));
  }, []);

  const submitPledge = async () => {
    if (!newPledge.trim()) return;
    try {
      const res = await api.post('/contests/pledges', { text: newPledge, category: pledgeCat });
      setPledges(p => [res.data.pledge, ...p]);
      setNewPledge('');
      toast('Pledge posted! 🌱', 'success');
    } catch (err) { toast(err.response?.data?.error || 'Failed to post', 'error'); }
  };

  const likePledge = async (id) => {
    try {
      const res = await api.post(`/contests/pledges/${id}/like`);
      setPledges(p => p.map(pl => pl.id === id ? { ...pl, likes: res.data.likeCount } : pl));
    } catch {}
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const PLEDGE_COLORS = ['#fef3c7','#f0fdf4','#eff6ff','#fff7ed','#fdf4ff'];

  if (loading) return <div className="dash-loading"><div className="spinner dark" /></div>;

  return (
    <div className="contests-page">
      {/* Contest Banner */}
      <div className="contest-banner">
        <div className="contest-banner-content">
          <div className="contest-chip">🌿 ACTIVE CHALLENGE</div>
          <h2>Green Warrior Challenge 2024</h2>
          <p>Compete to complete the most eco-tasks this month!</p>
          <div className="contest-prize">🏆 Top 3 students win the Green School Trophy</div>
        </div>
        <div className="contest-banner-right">
          <div className="contest-flame">🏆</div>
        </div>
      </div>

      <div className="contests-grid">
        {/* LEFT: Leaderboard */}
        <div className="contests-left">
          <div className="dash-card">
            <div className="section-head" style={{ marginBottom: 20 }}>
              <h3>🏆 School Leaderboard</h3>
              <div className="period-toggle">
                {['week','month','all'].map(p => (
                  <button key={p} className={`period-btn ${lbPeriod === p ? 'active' : ''}`} onClick={() => setLbPeriod(p)}>
                    {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {/* Podium */}
            <div className="podium">
              {[top3[1], top3[0], top3[2]].map((entry, i) => {
                if (!entry) return <div key={i} className="podium-slot" />;
                const heights = [80, 110, 60];
                const labels = ['2nd 🥈', '1st 👑', '3rd 🥉'];
                const colors = ['#94a3b8','#f59e0b','#cd7c3c'];
                return (
                  <div key={entry.id} className="podium-slot">
                    <div className="podium-avatar">{AVATARS[(entry.avatarId||1)-1]}</div>
                    <div className="podium-name">{entry.name?.split(' ')[0]}</div>
                    <div className="podium-pts" style={{ color: colors[i] }}>{(entry.totalPoints||0).toLocaleString('en-IN')}</div>
                    <div className="podium-platform" style={{ height: heights[i], background: colors[i] }}>
                      <span className="podium-label">{labels[i]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full table */}
            <div className="lb-table">
              {rest.map(entry => {
                const isMe = entry.id === user?.id;
                return (
                  <div key={entry.id} className={`lb-table-row ${isMe ? 'mine' : ''}`}>
                    <div className="lb-rank-num">{entry.rank}</div>
                    <div className="lb-avatar">{AVATARS[(entry.avatarId||1)-1]}</div>
                    <div className="lb-info">
                      <span className="lb-name">{entry.name} {isMe && <span className="you-chip">YOU</span>}</span>
                      <span className="lb-grade">{entry.grade}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                      <span className="lb-pts">{(entry.totalPoints||0).toLocaleString('en-IN')}</span>
                      <span className="lb-badge-count">{entry.badgeCount || 0} 🏅</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Pledge Wall */}
        <div className="contests-right">
          <div className="dash-card">
            <h3 style={{ fontFamily: 'Baloo 2', fontSize: 20, color: '#1a2e1a', marginBottom: 4 }}>💬 Community Pledge Wall</h3>
            <p style={{ fontSize: 13, color: '#7a907a', marginBottom: 20 }}>Students' promises to the planet</p>

            {/* New pledge input */}
            <div className="pledge-input-area">
              <select value={pledgeCat} onChange={e => setPledgeCat(e.target.value)} className="pledge-cat-select">
                {['General','Trees & Forests','Water Conservation','Waste Management','Energy','Climate Action'].map(c => <option key={c}>{c}</option>)}
              </select>
              <textarea value={newPledge} onChange={e => setNewPledge(e.target.value.slice(0,150))}
                placeholder="Share your eco-pledge..." className="pledge-textarea" />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 8 }}>
                <span className="char-count">{newPledge.length}/150</span>
                <button className="s-btn-green" onClick={submitPledge} disabled={!newPledge.trim()}>Post Pledge 🌱</button>
              </div>
            </div>

            {/* Pledge cards */}
            <div className="pledge-wall">
              {pledges.map((pledge, i) => (
                <div key={pledge.id} className="pledge-card"
                  style={{ background: PLEDGE_COLORS[i % PLEDGE_COLORS.length], transform: `rotate(${(i%3-1)*1.5}deg)` }}>
                  <div className="pledge-user">
                    <span>{AVATARS[(pledge.userAvatar||1)-1]}</span>
                    <span className="pledge-name">{pledge.userName}</span>
                    <span className="cat-chip" style={{ marginLeft: 'auto', fontSize: 10 }}>{pledge.category}</span>
                  </div>
                  <p className="pledge-text">"{pledge.text}"</p>
                  <div className="pledge-footer">
                    <button className="pledge-like" onClick={() => likePledge(pledge.id)}>
                      🌱 {pledge.likes}
                    </button>
                    <span style={{ fontSize: 11, color: '#7a907a' }}>{new Date(pledge.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {pledges.length === 0 && (
                <div style={{ textAlign: 'center', color: '#7a907a', padding: 32 }}>
                  <span style={{ fontSize: 32 }}>🌱</span>
                  <p>Be the first to post a pledge!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
