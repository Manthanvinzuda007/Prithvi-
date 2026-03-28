import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/shared/Toast';
import { triggerXPFloat, triggerConfetti, triggerLeafRain, triggerScoreBurst, attachRipple } from '../../utils/effects';
import { useTilt3D } from '../../hooks/useInView';
import './StudentGames.css';

const GAMES = [
  { id:'quiz', name:'Eco Quiz Blitz', icon:'⚡', desc:'10 questions · 30 seconds each', xp:'+100 XP', bg:'linear-gradient(135deg,#15803d,#22c55e)' },
  { id:'waste', name:'Waste Sorter', icon:'♻️', desc:'Sort waste into correct bins!', xp:'+80 XP', bg:'linear-gradient(135deg,#0891b2,#0e7490)' },
  { id:'carbon', name:'Carbon Calculator', icon:'🌍', desc:'Calculate your footprint', xp:'+50 XP', bg:'linear-gradient(135deg,#7c3aed,#6d28d9)' },
  { id:'scramble', name:'Eco Word Scramble', icon:'🔤', desc:'Unscramble eco-vocabulary', xp:'+60 XP', bg:'linear-gradient(135deg,#f59e0b,#d97706)' },
  { id:'tree', name:'Tree Growth Sim', icon:'🌳', desc:'Grow your virtual tree', xp:'+40 XP', bg:'linear-gradient(135deg,#15803d,#14532d)' },
  { id:'pledge', name:'Eco Pledge Wall', icon:'💬', desc:'Post & browse eco pledges', xp:'+20 XP', bg:'linear-gradient(135deg,#22c55e,#0284c7)' },
];

/* ─── 3D Tilt Game Card ─── */
function GameCard({ game, best, onPlay }) {
  const tiltRef = useTilt3D(10);
  const btnRef = useRef();
  useEffect(() => { if (btnRef.current) attachRipple(btnRef.current); }, []);
  return (
    <div ref={tiltRef} className="game-launch-card prithvi-card-tilt-3d prithvi-card-glow-border"
      style={{ background: game.bg }}>
      <div className="game-card-icon">{game.icon}</div>
      <div className="game-card-name">{game.name}</div>
      <div className="game-card-desc">{game.desc}</div>
      <div className="game-card-xp">{game.xp} per play</div>
      {best !== undefined && <div className="game-card-best">Best: {best} pts</div>}
      <button ref={btnRef} className="game-play-btn prithvi-btn-scale-click" onClick={() => onPlay(game.id)}>
        Play Now →
      </button>
    </div>
  );
}

/* ─── QUIZ BLITZ ─── */
function QuizBlitz({ onClose }) {
  const toast = useToast();
  const [phase, setPhase] = useState('select');
  const [difficulty, setDifficulty] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [results, setResults] = useState(null);
  const timerRef = useRef();
  const scoreRef = useRef();
  const optionRefs = useRef([]);
  const [score, setScore] = useState(0);

  const startTimer = useCallback(() => {
    setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(timerRef.current); handleTimeUp(); return 0; }
        return p - 1;
      });
    }, 1000);
  }, []);

  const handleTimeUp = useCallback(() => {
    setRevealed(true);
    setAnswers(p => [...p, { questionId: questions[current]?.id, selectedIndex: -1 }]);
    setTimeout(goNext, 1500);
  }, [current, questions]);

  const handleSelect = useCallback(async (idx) => {
    if (revealed) return;
    clearInterval(timerRef.current);
    setSelectedIdx(idx);
    setRevealed(true);
    const newAnswers = [...answers, { questionId: questions[current].id, selectedIndex: idx }];
    setAnswers(newAnswers);
    // Visual feedback happens after correctIndex is known from server
    setTimeout(() => goNext(newAnswers), 1200);
  }, [revealed, answers, questions, current]);

  const goNext = (ans = answers) => {
    if (current + 1 >= questions.length) { finishQuiz(ans); return; }
    setCurrent(p => p + 1);
    setSelectedIdx(null);
    setRevealed(false);
    startTimer();
  };

  const finishQuiz = async (ans) => {
    clearInterval(timerRef.current);
    try {
      const res = await api.post('/games/check-answers', { gameType: 'quiz_blitz', answers: ans });
      setResults(res.data);
      await api.post('/games/score', { gameType: 'quiz_blitz', score: res.data.score || 0 });
      // Celebration
      if (res.data.xpEarned > 0) {
        setTimeout(() => {
          if (scoreRef.current) triggerXPFloat(scoreRef.current, res.data.xpEarned);
          triggerConfetti();
          if (res.data.score >= 8) triggerLeafRain();
        }, 300);
      }
    } catch {}
    setPhase('done');
  };

  const startQuiz = async () => {
    try {
      const params = difficulty ? `?difficulty=${difficulty}&count=10` : '?count=10';
      const res = await api.get(`/games/questions${params}`);
      setQuestions(res.data.questions || []);
      setPhase('playing');
      setTimeout(startTimer, 100);
    } catch { toast('Failed to load questions', 'error'); }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const q = questions[current];
  const timePct = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 20 ? '#22c55e' : timeLeft > 10 ? '#f59e0b' : '#ef4444';
  const isUrgent = timeLeft <= 5;

  return (
    <div className="game-overlay">
      <div className="game-panel">
        <button className="game-close prithvi-btn-scale-click" onClick={onClose}>✕ Exit</button>

        {phase === 'select' && (
          <div className="game-select">
            <div style={{ fontSize:64, marginBottom:16 }}>⚡</div>
            <h2>Eco Quiz Blitz</h2>
            <p>10 questions · 30 seconds each · Earn XP for correct answers!</p>
            <div className="game-diff-select">
              {['','Easy','Medium','Hard'].map(d => (
                <button key={d}
                  className={`game-diff-btn prithvi-btn-scale-click ${difficulty===d?'active':''}`}
                  onClick={() => setDifficulty(d)}>
                  {d || 'All Topics'}
                </button>
              ))}
            </div>
            <button className="game-start-btn prithvi-btn-lift-hover prithvi-btn-ripple" onClick={startQuiz}>
              Start Quiz →
            </button>
          </div>
        )}

        {phase === 'playing' && q && (
          <div className="quiz-playing">
            <div className="quiz-hud">
              <span className="quiz-qnum">Q {current+1} / {questions.length}</span>
              {/* prithvi-timer-bar-deplete */}
              <div className="quiz-timer-track">
                <div className={`prithvi-timer-bar quiz-timer-fill ${isUrgent?'pulse':''}`}
                  style={{ width:`${timePct}%`, background:timerColor }} />
              </div>
              <span className="quiz-time" style={{ color:timerColor }}>⏱ {timeLeft}s</span>
            </div>

            {/* Score display — prithvi-score-burst on increase */}
            <div className="quiz-score-display" ref={scoreRef}>
              {score} pts
            </div>

            <div className="quiz-question-card">
              <div className="quiz-q-text">{q.question}</div>
              <div className="quiz-options">
                {q.options?.map((opt, i) => (
                  <button key={i}
                    ref={el => optionRefs.current[i] = el}
                    className={`quiz-option prithvi-option-hover-glow prithvi-btn-scale-click`}
                    onClick={() => handleSelect(i)}
                    disabled={revealed}>
                    <span className="quiz-letter">{['A','B','C','D'][i]}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === 'done' && results && (
          <div className="quiz-done">
            <div style={{ fontSize:64 }}>🏆</div>
            <h2>Quiz Complete!</h2>
            <div className="quiz-score-display large" ref={scoreRef}>
              <span style={{ fontFamily:'Baloo 2', fontSize:56, color:'#22c55e', fontWeight:800 }}>
                {results.score || 0}
              </span>
              <span style={{ color:'#7a907a', fontSize:14, display:'block' }}>points earned</span>
            </div>
            <div className="quiz-xp-earned">+{results.xpEarned || 0} XP Added!</div>
            <div className="quiz-breakdown">
              {results.breakdown?.map((r,i) => (
                <div key={i} className={`quiz-result-row ${r.correct?'correct':'wrong'}`}>
                  <span>{r.correct?'✓':'✗'}</span>
                  <span>Question {i+1}</span>
                  <span>{r.correct?`+${r.xpEarned} XP`:'—'}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button className="lp-nav-btn secondary prithvi-btn-scale-click" onClick={() => {
                setPhase('select'); setCurrent(0); setAnswers([]); setSelectedIdx(null); setRevealed(false); setResults(null); setScore(0);
              }}>Play Again</button>
              <button className="lp-nav-btn primary prithvi-btn-ripple" onClick={onClose}>Back to Games</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── WASTE SORTER ─── */
function WasteSorter({ onClose }) {
  const ITEMS = [
    { name:'Banana Peel', icon:'🍌', bin:'organic' },
    { name:'Plastic Bottle', icon:'🍶', bin:'plastic' },
    { name:'Newspaper', icon:'📰', bin:'paper' },
    { name:'Glass Jar', icon:'🫙', bin:'glass' },
    { name:'Food Scraps', icon:'🥗', bin:'organic' },
    { name:'Metal Can', icon:'🥫', bin:'glass' },
    { name:'Battery', icon:'🔋', bin:'ewaste' },
    { name:'Paper Cup', icon:'☕', bin:'paper' },
    { name:'Plastic Bag', icon:'🛍️', bin:'plastic' },
    { name:'Apple Core', icon:'🍎', bin:'organic' },
  ];
  const BINS = [
    { id:'organic', label:'Organic', icon:'🍃', color:'#22c55e' },
    { id:'plastic', label:'Plastic', icon:'🔵', color:'#0284c7' },
    { id:'glass',   label:'Glass/Metal', icon:'🟤', color:'#92400e' },
    { id:'paper',   label:'Paper', icon:'📄', color:'#6b7280' },
    { id:'ewaste',  label:'E-Waste', icon:'⚡', color:'#7c3aed' },
  ];
  const [score, setScore] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [done, setDone] = useState(false);
  const scoreRef = useRef();

  const handleBin = (bin) => {
    if (feedback) return;
    const item = ITEMS[itemIdx];
    const correct = bin === item.bin;
    const newScore = score + (correct ? 5 : 0);
    setFeedback(correct ? `✓ Correct! +5 pts` : `✗ Goes in ${BINS.find(b=>b.id===item.bin)?.label}!`);
    if (correct) { setScore(newScore); if (scoreRef.current) triggerScoreBurst(scoreRef.current); }
    setTimeout(() => {
      setFeedback('');
      if (itemIdx + 1 >= ITEMS.length) {
        setDone(true);
        if (newScore >= 35) triggerConfetti();
        api.post('/games/score', { gameType:'waste_sorter', score: newScore }).catch(()=>{});
      } else { setItemIdx(p => p+1); }
    }, 1000);
  };

  const item = ITEMS[itemIdx];
  return (
    <div className="game-overlay">
      <div className="game-panel">
        <button className="game-close prithvi-btn-scale-click" onClick={onClose}>✕ Exit</button>
        {!done ? (
          <div className="waste-game">
            <div className="waste-score-row">
              <span className="waste-score prithvi-score-burst" ref={scoreRef} style={{ fontFamily:'Baloo 2', fontSize:24, fontWeight:800, color:'#22c55e' }}>{score} pts</span>
              <span style={{ fontSize:13, color:'#7a907a' }}>{itemIdx+1} / {ITEMS.length}</span>
            </div>
            <div className="waste-item-display">
              <div className="waste-item-icon">{item.icon}</div>
              <div className="waste-item-name">{item.name}</div>
              <div className="waste-item-sub">Which bin does this go in?</div>
            </div>
            {feedback && (
              <div className={`waste-feedback ${feedback.startsWith('✓')?'correct':'wrong'}`}
                style={{ animation:'bounceIn 300ms ease' }}>
                {feedback}
              </div>
            )}
            <div className="waste-bins">
              {BINS.map(bin => (
                <button key={bin.id} className="waste-bin prithvi-btn-scale-click prithvi-btn-lift-hover"
                  style={{ borderColor:bin.color }} onClick={() => handleBin(bin.id)}>
                  <span style={{ fontSize:28 }}>{bin.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:bin.color }}>{bin.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="quiz-done">
            <div style={{ fontSize:64 }}>♻️</div>
            <h2>Well Sorted!</h2>
            <div className="quiz-score-display">
              <span style={{ fontFamily:'Baloo 2', fontSize:56, color:'#22c55e', fontWeight:800 }}>{score}</span>
              <div style={{ color:'#7a907a', fontSize:14 }}>out of {ITEMS.length * 5} points</div>
            </div>
            <p style={{ color:'#4a5e4a', marginTop:8 }}>You sorted {ITEMS.length} waste items!</p>
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button className="lp-nav-btn secondary prithvi-btn-scale-click" onClick={() => { setScore(0); setItemIdx(0); setDone(false); setFeedback(''); }}>Play Again</button>
              <button className="lp-nav-btn primary prithvi-btn-ripple" onClick={onClose}>Back to Games</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── WORD SCRAMBLE ─── */
function WordScramble({ onClose }) {
  const WORDS = [
    { word:'PHOTOSYNTHESIS', hint:'Process plants use to make food' },
    { word:'BIODIVERSITY', hint:'Variety of life on Earth' },
    { word:'COMPOSTING', hint:'Converting organic waste into fertilizer' },
    { word:'RENEWABLE', hint:'Energy that can be replenished naturally' },
    { word:'ECOSYSTEM', hint:'Community of organisms and their environment' },
    { word:'POLLUTION', hint:'Contamination of the environment' },
    { word:'DEFORESTATION', hint:'Clearing of forests' },
    { word:'CONSERVATION', hint:'Protection of natural resources' },
    { word:'SUSTAINABLE', hint:'Meeting needs without depleting future resources' },
    { word:'CHLOROPHYLL', hint:'Green pigment in plants' },
  ];
  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [done, setDone] = useState(false);
  const [hints, setHints] = useState(3);
  const timerRef = useRef();
  const scoreRef = useRef();

  const scramble = (w) => w.split('').sort(() => Math.random()-0.5).join('');

  useEffect(() => {
    setScrambled(scramble(WORDS[idx].word));
    setInput(''); setFeedback(''); setTimeLeft(45);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx]);

  const handleTimeout = () => {
    setFeedback(`⏱ Time's up! It was: ${WORDS[idx].word}`);
    setTimeout(nextWord, 1500);
  };

  const check = () => {
    const correct = input.trim().toUpperCase() === WORDS[idx].word;
    if (correct) {
      const pts = 10 + Math.floor(timeLeft / 5);
      setScore(p => p + pts);
      setFeedback(`✓ Correct! +${pts} pts`);
      if (scoreRef.current) triggerScoreBurst(scoreRef.current);
      setTimeout(nextWord, 1000);
    } else {
      setFeedback('✗ Try again!');
      setTimeout(() => setFeedback(''), 800);
    }
  };

  const useHint = () => {
    if (hints <= 0) return;
    setHints(p => p-1);
    const word = WORDS[idx].word;
    const revealed = word.slice(0, Math.ceil(word.length/3));
    setInput(revealed);
  };

  const nextWord = () => {
    if (idx + 1 >= WORDS.length) { setDone(true); triggerConfetti(); api.post('/games/score',{gameType:'word_scramble',score}).catch(()=>{}); }
    else setIdx(p => p+1);
  };

  const timePct = (timeLeft/45)*100;
  const timerColor = timeLeft > 30 ? '#22c55e' : timeLeft > 15 ? '#f59e0b' : '#ef4444';

  return (
    <div className="game-overlay">
      <div className="game-panel">
        <button className="game-close prithvi-btn-scale-click" onClick={onClose}>✕ Exit</button>
        {!done ? (
          <div style={{ textAlign:'center' }}>
            <div className="quiz-hud" style={{ marginBottom:16 }}>
              <span className="quiz-qnum">Word {idx+1}/{WORDS.length}</span>
              <div className="quiz-timer-track">
                <div className="prithvi-timer-bar" style={{ width:`${timePct}%`, background:timerColor }} />
              </div>
              <span className="quiz-time" style={{ color:timerColor }}>⏱ {timeLeft}s</span>
            </div>

            <div className="quiz-score-display" ref={scoreRef} style={{ fontSize:18 }}>{score} pts</div>

            <div style={{ fontSize:13, color:'#7a907a', marginBottom:16 }}>Hint: {WORDS[idx].hint}</div>

            <div className="scramble-tiles">
              {scrambled.split('').map((l,i) => (
                <div key={i} className="scramble-tile">{l}</div>
              ))}
            </div>

            <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key==='Enter' && check()}
              placeholder="Type your answer..." className="scramble-input" autoFocus />

            {feedback && <div className={`waste-feedback ${feedback.startsWith('✓')?'correct':'wrong'}`} style={{display:'inline-block',margin:'8px 0'}}>{feedback}</div>}

            <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:16 }}>
              <button className="game-diff-btn prithvi-btn-scale-click" onClick={useHint} disabled={hints<=0}>
                💡 Hint ({hints} left)
              </button>
              <button className="game-start-btn prithvi-btn-ripple" style={{ height:44, fontSize:15 }} onClick={check}>
                Check →
              </button>
            </div>
          </div>
        ) : (
          <div className="quiz-done">
            <div style={{ fontSize:64 }}>🔤</div>
            <h2>Scramble Complete!</h2>
            <div><span style={{ fontFamily:'Baloo 2', fontSize:56, color:'#22c55e', fontWeight:800 }}>{score}</span><div style={{ color:'#7a907a', fontSize:14 }}>points</div></div>
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button className="lp-nav-btn secondary" onClick={() => { setIdx(0); setScore(0); setDone(false); setHints(3); }}>Play Again</button>
              <button className="lp-nav-btn primary prithvi-btn-ripple" onClick={onClose}>Back to Games</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function TreeSimulator({ onClose, userPoints = 0 }) {
  const stage = userPoints >= 600 ? 5 : userPoints >= 350 ? 4 : userPoints >= 150 ? 3 : userPoints >= 50 ? 2 : 1;
  const stages = ['🌰 Seed','🌱 Sprout','🪴 Sapling','🌿 Growing','🌳 Full Tree'];
  const nextMilestone = [50,150,350,600,Infinity][stage-1];
  const pctToNext = stage < 5 ? Math.min(100, ((userPoints - [0,50,150,350,600][stage-1]) / (nextMilestone - [0,50,150,350,600][stage-1])) * 100) : 100;

  return (
    <div className="game-overlay">
      <div className="game-panel">
        <button className="game-close prithvi-btn-scale-click" onClick={onClose}>✕ Exit</button>
        <div className="tree-sim">
          <h2>🌳 Your Virtual Tree</h2>
          <p style={{ color:'#7a907a', fontSize:14 }}>Grows as you complete eco-tasks</p>
          <div className="tree-stage-display">
            {stage === 1 && <div className="tree-art tree-seed" style={{ animation:'treeGrow 800ms ease' }}>🌰</div>}
            {stage === 2 && <div className="tree-art tree-sprout" style={{ animation:'treeGrow 800ms ease' }}>🌱</div>}
            {stage === 3 && <div className="tree-art tree-sapling" style={{ animation:'treeGrow 800ms ease' }}>🪴</div>}
            {stage === 4 && <div className="tree-art tree-growing" style={{ animation:'treeGrow 800ms ease' }}>
              <div style={{ fontSize:80, animation:'buddyBob 2s ease-in-out infinite' }}>🌿</div>
            </div>}
            {stage === 5 && <div className="tree-art tree-full" style={{ animation:'treeGrow 800ms ease' }}>
              <div style={{ fontSize:100, animation:'buddyBob 3s ease-in-out infinite' }}>🌳</div>
            </div>}
          </div>
          <div className="tree-stage-name prithvi-text-pop-in">{stages[stage-1]}</div>
          <div className="tree-info">
            <div className="tree-stat">
              <span style={{ fontSize:24, fontFamily:'Baloo 2', fontWeight:800, color:'#22c55e' }}>{userPoints}</span>
              <span style={{ fontSize:12, color:'#7a907a' }}>Total XP</span>
            </div>
            <div className="tree-stat">
              <span style={{ fontSize:24, fontFamily:'Baloo 2', fontWeight:800, color:'#15803d' }}>~{Math.round(userPoints * 0.022)} kg</span>
              <span style={{ fontSize:12, color:'#7a907a' }}>CO₂ Saved</span>
            </div>
          </div>
          {stage < 5 && (
            <div style={{ width:'100%', marginTop:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#7a907a', marginBottom:6 }}>
                <span>Progress to next stage</span>
                <span>{Math.round(pctToNext)}%</span>
              </div>
              <div style={{ height:12, background:'#dcfce7', borderRadius:6, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pctToNext}%`, background:'linear-gradient(90deg,#22c55e,#86efac)', borderRadius:6, transition:'width 1s ease' }} />
              </div>
              <p style={{ fontSize:12, color:'#7a907a', marginTop:8, textAlign:'center' }}>
                {nextMilestone - userPoints} more XP to next stage!
              </p>
            </div>
          )}
          <button className="game-start-btn" style={{ marginTop:20 }} onClick={onClose}>
            Complete Tasks to Grow! 🌱
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN GAMES PAGE ─── */
export default function StudentGames() {
  const [activeGame, setActiveGame] = useState(null);
  const [scores, setScores] = useState([]);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    api.get('/games/scores/my').then(r => setScores(r.data.scores || [])).catch(()=>{});
    api.get('/points/my').then(r => setUserPoints(r.data.points?.totalPoints || 0)).catch(()=>{});
  }, []);

  const getBest = (id) => scores.find(s => s.gameType === id)?.score;

  return (
    <div className="games-page">
      <div className="page-header">
        <h2 className="prithvi-text-fade-up visible">Eco Games 🎮</h2>
        <p>Play. Learn. Earn Eco-Points.</p>
      </div>

      <div className="games-grid">
        {GAMES.map(game => (
          <GameCard key={game.id} game={game} best={getBest(game.id)} onPlay={setActiveGame} />
        ))}
      </div>

      {activeGame === 'quiz'     && <QuizBlitz onClose={() => setActiveGame(null)} />}
      {activeGame === 'waste'    && <WasteSorter onClose={() => setActiveGame(null)} />}
      {activeGame === 'tree'     && <TreeSimulator onClose={() => setActiveGame(null)} userPoints={userPoints} />}
      {activeGame === 'scramble' && <WordScramble onClose={() => setActiveGame(null)} />}
      {(activeGame === 'carbon' || activeGame === 'pledge') && (
        <div className="game-overlay" onClick={() => setActiveGame(null)}>
          <div className="game-panel" onClick={e => e.stopPropagation()} style={{ textAlign:'center', padding:48 }}>
            <button className="game-close prithvi-btn-scale-click" onClick={() => setActiveGame(null)}>✕ Exit</button>
            <div style={{ fontSize:64, marginBottom:16 }}>{GAMES.find(g=>g.id===activeGame)?.icon}</div>
            <h2 style={{ fontFamily:'Baloo 2', color:'#1a2e1a', marginBottom:8 }}>{GAMES.find(g=>g.id===activeGame)?.name}</h2>
            <p style={{ color:'#7a907a', marginBottom:28 }}>Coming in the next update! 🚀</p>
            <button className="game-start-btn prithvi-btn-ripple" onClick={() => setActiveGame(null)}>Back to Games</button>
          </div>
        </div>
      )}
    </div>
  );
}
