import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useInView } from '../../hooks/useInView';
import CountUp from '../../components/shared/CountUp';
import ProgressRing from '../../components/shared/ProgressRing';
import './TeacherAnalytics.css';

const LEVEL_ORDER = ['Earth Seedling','Eco Sprout','Green Warrior','Earth Guardian','Nature Champion','Planet Protector'];

export default function TeacherAnalytics() {
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsRef, inView] = useInView();

  useEffect(() => {
    Promise.all([api.get('/users/students'), api.get('/tasks')])
      .then(([s, t]) => { setStudents(s.data.students || []); setTasks(t.data.tasks || []); })
      .finally(() => setLoading(false));
  }, []);

  // Computed stats
  const totalStudents = students.length;
  const avgXP = totalStudents ? Math.round(students.reduce((a,s) => a+(s.totalPoints||0),0) / totalStudents) : 0;
  const allSubs = tasks.flatMap(t => t.submissions || []);
  const approvedSubs = allSubs.filter(s => s.status === 'approved');
  const pendingSubs = allSubs.filter(s => s.status === 'pending');
  const completionRate = allSubs.length ? Math.round((approvedSubs.length / allSubs.length) * 100) : 0;

  // Level distribution
  const levelDist = LEVEL_ORDER.map(name => ({
    name, count: students.filter(s => s.level === name).length,
    color: ['#dcfce7','#86efac','#4ade80','#22c55e','#15803d','#14532d'][LEVEL_ORDER.indexOf(name)],
  }));
  const maxLevelCount = Math.max(...levelDist.map(l => l.count), 1);

  // Top performers
  const topStudents = [...students].sort((a,b) => (b.totalPoints||0) - (a.totalPoints||0)).slice(0,5);

  // Task category breakdown
  const tasksByCat = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  // XP distribution buckets
  const xpBuckets = [
    { label:'0–99', count: students.filter(s=>(s.totalPoints||0)<100).length },
    { label:'100–249', count: students.filter(s=>(s.totalPoints||0)>=100&&(s.totalPoints||0)<250).length },
    { label:'250–499', count: students.filter(s=>(s.totalPoints||0)>=250&&(s.totalPoints||0)<500).length },
    { label:'500–999', count: students.filter(s=>(s.totalPoints||0)>=500&&(s.totalPoints||0)<1000).length },
    { label:'1000+', count: students.filter(s=>(s.totalPoints||0)>=1000).length },
  ];
  const maxBucket = Math.max(...xpBuckets.map(b=>b.count), 1);

  if (loading) return <div className="t-loading"><div className="spinner dark" /></div>;

  return (
    <div className="teacher-analytics" style={{ fontFamily:'Plus Jakarta Sans,sans-serif', animation:'fadeIn 300ms ease' }}>
      <div className="page-header" style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:'DM Serif Display,serif', fontSize:28, color:'#0f172a' }}>Class Analytics 📊</h2>
        <p style={{ color:'#64748b', marginTop:4 }}>Performance overview for your class</p>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="analytics-kpi-row" ref={statsRef}>
        {[
          { label:'Total Students', value:totalStudents, icon:'👥', color:'#3b82f6', sub:'Enrolled in your class' },
          { label:'Average XP', value:avgXP, icon:'🌱', color:'#22c55e', sub:'Per student' },
          { label:'Task Completion', value:completionRate, icon:'✅', color:'#22c55e', suffix:'%', sub:`${approvedSubs.length} approved` },
          { label:'Pending Reviews', value:pendingSubs.length, icon:'⏳', color: pendingSubs.length>0?'#f59e0b':'#22c55e', sub:'Needs your attention' },
        ].map((k, i) => (
          <div key={i} className="t-card analytics-kpi prithvi-card-lift-hover">
            <div className="analytics-kpi-icon" style={{ background:k.color+'18', color:k.color }}>{k.icon}</div>
            <div>
              <div style={{ fontFamily:'DM Serif Display,serif', fontSize:32, color:'#0f172a', lineHeight:1 }}>
                {inView ? <CountUp to={k.value} duration={1000+i*100} suffix={k.suffix||''} /> : 0}
              </div>
              <div style={{ fontSize:12, color:'#64748b', fontWeight:600, marginTop:2 }}>{k.label}</div>
              <div style={{ fontSize:11, color:k.color, fontWeight:700, marginTop:2 }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-main-grid">
        {/* ── LEFT ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* XP Distribution Bar Chart */}
          <div className="t-card">
            <h3 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'#0f172a', marginBottom:20 }}>XP Distribution</h3>
            <div className="analytics-bar-chart">
              {xpBuckets.map((b, i) => (
                <div key={i} className="analytics-bar-col">
                  <div className="analytics-bar-track">
                    <div className="analytics-bar-fill bar-rect"
                      style={{ height:`${(b.count/maxBucket)*140}px`, background:'#22c55e', animationDelay:`${i*0.1}s` }}>
                      <div className="analytics-bar-tooltip">{b.count} students</div>
                    </div>
                  </div>
                  <div className="analytics-bar-label">{b.label}</div>
                  <div className="analytics-bar-count">{b.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Level Distribution */}
          <div className="t-card">
            <h3 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'#0f172a', marginBottom:20 }}>Level Distribution</h3>
            {levelDist.map(l => (
              <div key={l.name} className="analytics-level-bar">
                <div className="analytics-level-label">
                  <span>{l.name}</span>
                  <span style={{ marginLeft:'auto', color:'#22c55e', fontWeight:700 }}>{l.count}</span>
                </div>
                <div className="analytics-level-track">
                  <div className="analytics-level-fill bar-rect"
                    style={{ width:`${(l.count/maxLevelCount)*100}%`, background:l.color,
                      '--target-width':`${(l.count/maxLevelCount)*100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Task Categories */}
          <div className="t-card">
            <h3 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'#0f172a', marginBottom:20 }}>Tasks by Category</h3>
            {Object.entries(tasksByCat).length === 0
              ? <div className="t-empty"><p>No tasks created yet</p></div>
              : Object.entries(tasksByCat).map(([cat, count]) => (
                <div key={cat} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                  <span className="cat-chip" style={{ minWidth:120, textAlign:'center' }}>{cat.replace(/_/g,' ')}</span>
                  <div style={{ flex:1, height:8, background:'#f0fdf4', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(count/Math.max(...Object.values(tasksByCat)))*100}%`,
                      background:'#22c55e', borderRadius:4, transition:'width 1s ease' }} />
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:'#22c55e' }}>{count}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Completion ring */}
          <div className="t-card" style={{ textAlign:'center' }}>
            <h3 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'#0f172a', marginBottom:16 }}>Overall Completion</h3>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <ProgressRing percentage={completionRate} size={160} thickness={14} color="#22c55e"
                label={`${completionRate}%`} sublabel="completed" />
            </div>
            <div style={{ display:'flex', justifyContent:'space-around', marginTop:16 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'DM Serif Display,serif', fontSize:24, color:'#22c55e' }}>{approvedSubs.length}</div>
                <div style={{ fontSize:11, color:'#64748b' }}>Approved</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'DM Serif Display,serif', fontSize:24, color:'#f59e0b' }}>{pendingSubs.length}</div>
                <div style={{ fontSize:11, color:'#64748b' }}>Pending</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'DM Serif Display,serif', fontSize:24, color:'#94a3b8' }}>{allSubs.filter(s=>s.status==='rejected').length}</div>
                <div style={{ fontSize:11, color:'#64748b' }}>Rejected</div>
              </div>
            </div>
          </div>

          {/* Top performers */}
          <div className="t-card">
            <h3 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'#0f172a', marginBottom:16 }}>🏆 Top 5 Students</h3>
            {topStudents.map((s, i) => (
              <div key={s.id} className="analytics-top-row">
                <div className="analytics-top-rank" style={{ color:['#f59e0b','#94a3b8','#cd7c3c','#64748b','#64748b'][i] }}>
                  {i===0?'👑':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'#0f172a' }}>{s.name}</div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{s.grade}</div>
                </div>
                <div style={{ fontFamily:'DM Serif Display,serif', fontSize:20, color:'#22c55e', fontWeight:700 }}>
                  {(s.totalPoints||0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Students below average */}
          <div className="t-card">
            <h3 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'#0f172a', marginBottom:12 }}>⚠️ Needs Attention</h3>
            <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>Students below class average ({avgXP} XP)</p>
            {students.filter(s => (s.totalPoints||0) < avgXP).slice(0,5).map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
                <div style={{ fontSize:24 }}>👤</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{s.grade}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:'#f59e0b' }}>{s.totalPoints||0} XP</div>
              </div>
            ))}
            {students.filter(s => (s.totalPoints||0) < avgXP).length === 0 && (
              <div className="t-empty" style={{ padding:0 }}><p>All students are at or above average! 🎉</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
