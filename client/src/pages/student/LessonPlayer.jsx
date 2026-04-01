import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../components/shared/Toast';
import { triggerXPFloat, triggerConfetti, triggerLeafRain, triggerXPExplosion, attachRipple } from '../../utils/effects';
import './LessonPlayer.css';

function TextBlock({ text }) {
  return <div className="lp-text">{text}</div>;
}
function FactBox({ text }) {
  return <div className="lp-fact-box"><span className="lp-box-icon">🌿 Did You Know?</span>{text}</div>;
}
function WarningBox({ text }) {
  return <div className="lp-warning-box"><span className="lp-box-icon">⚠️ Important</span>{text}</div>;
}
function TipBox({ text }) {
  return <div className="lp-tip-box"><span className="lp-box-icon">💡 Eco Tip</span>{text}</div>;
}

function QuizBlock({ block, quizResults, onAnswer, lessonId, chapterId }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const toast = useToast();
  const answered = quizResults?.[block.id];

  const handleSelect = async (idx) => {
    if (answered || revealed) return;
    setSelected(idx);
    setRevealed(true);
    const correct = idx === block.correctIndex;
    try {
      await api.put(`/lessons/${lessonId}/progress`, { quizId: block.id, selectedIndex: idx });
      if (correct) toast(`Correct! +${block.xpReward || 10} XP 🌟`, 'success');
    } catch {}
  };

  const displaySelected = answered ? answered.selectedIndex : selected;
  const displayRevealed = answered || revealed;

  return (
    <div className={`lp-quiz ${displayRevealed ? 'revealed' : ''}`}>
      <div className="lp-quiz-header">❓ Quick Check</div>
      <div className="lp-quiz-question">{block.question}</div>
      <div className="lp-quiz-options">
        {block.options.map((opt, i) => {
          let cls = '';
          if (displayRevealed) {
            if (i === block.correctIndex) cls = 'correct';
            else if (i === displaySelected && i !== block.correctIndex) cls = 'wrong';
          } else if (i === selected) cls = 'selected';
          return (
            <button key={i} className={`lp-option ${cls}`}
              onClick={() => handleSelect(i)} disabled={!!displayRevealed}>
              <span className="lp-option-letter">{['A','B','C','D'][i]}</span>
              {opt}
              {displayRevealed && i === block.correctIndex && <span className="lp-option-icon">✓</span>}
              {displayRevealed && i === displaySelected && i !== block.correctIndex && <span className="lp-option-icon">✗</span>}
            </button>
          );
        })}
      </div>
      {displayRevealed && block.explanation && (
        <div className="lp-explanation">
          <strong>Explanation:</strong> {block.explanation}
        </div>
      )}
    </div>
  );
}

export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const contentRef = useRef();

  useEffect(() => {
    Promise.all([
      api.get('/lessons'),
      api.get(`/lessons/${id}/progress`),
    ]).then(([lr, pr]) => {
      const found = lr.data.lessons?.find(l => l.id === id);
      setLesson(found);
      setProgress(pr.data.progress);
      // Start enrollment if not started
      if (!pr.data.progress) {
        api.post(`/lessons/${id}/enroll`).then(r => setProgress(r.data.progress)).catch(() => {});
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const chapter = lesson?.chapters?.[activeChapterIdx];
  const completedChapters = progress?.completedChapters || [];
  const isChapterDone = chapter && completedChapters.includes(chapter.id);
  const isLastChapter = lesson && activeChapterIdx === lesson.chapters.length - 1;
  const allQuizzesAnswered = !chapter ? true : (chapter.content || []).filter(b => b.type === 'quiz').every(q => progress?.quizResults?.[q.id]);

  const markChapterComplete = async () => {
    if (isChapterDone) return;
    try {
      const res = await api.put(`/lessons/${id}/progress`, { chapterId: chapter.id });
      setProgress(res.data.progress);
      if (res.data.xpAwarded) setXpEarned(p => p + res.data.xpAwarded);
      if (res.data.progress?.status === 'completed') {
        const earned = lesson.xpReward;
        setXpEarned(earned);
        setShowCompletion(true);
        // prithvi-confetti-burst + prithvi-leaf-rain + prithvi-xp-explosion
        setTimeout(() => {
          triggerConfetti();
          triggerLeafRain();
          triggerXPExplosion(window.innerWidth / 2, window.innerHeight / 2);
          if (contentRef.current) triggerXPFloat(contentRef.current, earned);
        }, 400);
      }
    } catch {}
  };

  const handleNext = async () => {
    if (!isChapterDone) await markChapterComplete();
    if (!isLastChapter) {
      setActiveChapterIdx(p => p + 1);
      contentRef.current?.scrollTo(0, 0);
    } else {
      if (!isChapterDone) await markChapterComplete();
      setShowCompletion(true);
    }
  };

  const renderBlock = (block, i) => {
    switch (block.type) {
      case 'text': return <TextBlock key={i} text={block.text} />;
      case 'fact_box': return <FactBox key={i} text={block.text} />;
      case 'warning_box': return <WarningBox key={i} text={block.text} />;
      case 'tip_box': return <TipBox key={i} text={block.text} />;
      case 'quiz': return <QuizBlock key={i} block={block} lessonId={id}
        quizResults={progress?.quizResults} onAnswer={() => {}} chapterId={chapter?.id} />;
      default: return null;
    }
  };

  if (loading) return <div className="dash-loading"><div className="spinner dark" /></div>;
  if (!lesson) return <div className="dash-loading"><p>Lesson not found.</p></div>;

  const totalChapters = lesson.chapters?.length || 1;
  const doneCount = completedChapters.length;

  return (
    <div className="lesson-player">
      {/* LEFT PANEL */}
      <aside className="lp-sidebar">
        <button className="lp-back" onClick={() => navigate('/student/lessons')}>← Back to Lessons</button>
        <div className="lp-lesson-title">{lesson.title}</div>
        <div className="lp-progress-label">{doneCount} / {totalChapters} chapters</div>
        <div className="lp-progress-track">
          <div className="lp-progress-fill" style={{ width: `${(doneCount / totalChapters) * 100}%` }} />
        </div>
        <div className="lp-chapters">
          {lesson.chapters?.map((ch, i) => {
            const done = completedChapters.includes(ch.id);
            const active = i === activeChapterIdx;
            return (
              <button key={ch.id} className={`lp-chapter-btn ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                onClick={() => { setActiveChapterIdx(i); contentRef.current?.scrollTo(0,0); }}>
                <span className="lp-ch-num">{done ? '✓' : i + 1}</span>
                <span className="lp-ch-title">{ch.title}</span>
              </button>
            );
          })}
        </div>
        <div className="lp-sidebar-meta">
          <span>🌟 +{lesson.xpReward} XP on completion</span>
          <span>⏱ ~{lesson.durationMinutes} min</span>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <div className="lp-content" ref={contentRef}>
        <div className="lp-content-inner">
          <div className="lp-chapter-header">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="cat-chip">{lesson.category}</span>
              <span className="diff-chip easy">{lesson.difficulty}</span>
            </div>
            <h2 className="lp-chapter-title">{chapter?.title}</h2>
          </div>

          <div className="lp-blocks">
            {(chapter?.content || []).map((block, i) => renderBlock(block, i))}
          </div>

          <div className="lp-nav-bar">
            <button className="lp-nav-btn secondary"
              disabled={activeChapterIdx === 0}
              onClick={() => { setActiveChapterIdx(p => p - 1); contentRef.current?.scrollTo(0,0); }}>
              ← Previous
            </button>
            <span className="lp-nav-progress">Chapter {activeChapterIdx + 1} of {totalChapters}</span>
            {isLastChapter ? (
              <button className="lp-nav-btn primary" onClick={handleNext} disabled={!allQuizzesAnswered || completing}>
                {completing ? <span className="spinner" /> : 'Complete Lesson 🎉'}
              </button>
            ) : (
              <button className="lp-nav-btn primary" onClick={handleNext}>
                Next Chapter →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COMPLETION MODAL */}
      {showCompletion && (
        <div className="modal-backdrop">
          <div className="lp-completion-card">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                background: ['#22c55e','#f59e0b','#38bdf8','#fb7185','#a78bfa'][i % 5],
                animationDelay: `${Math.random() * 0.5}s`
              }} />
            ))}
            <div className="lp-completion-trophy">🏆</div>
            <h2>Lesson Complete! 🎉</h2>
            <p>You've mastered <strong>{lesson.title}</strong></p>
            <div className="lp-xp-earned">+{lesson.xpReward} XP Earned!</div>
            <div className="lp-completion-btns">
              <button className="lp-nav-btn secondary" onClick={() => navigate('/student/lessons')}>Back to Lessons</button>
              <button className="lp-nav-btn primary" onClick={() => navigate('/student')}>Go to Dashboard →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
