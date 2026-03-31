const db = require('../config/db');
const { awardPoints } = require('../utils/points');
const { createNotification } = require('../utils/notifications');
const { newId } = require('../utils/ids');

function getLessons(req, res) {
  let lessons = db.readDB('lessons');
  if (req.user.role === 'student') {
    lessons = lessons.filter(l => l.status === 'published' && (l.assignedTo === 'all' || (Array.isArray(l.assignedTo) && l.assignedTo.includes(req.user.id))));
    lessons = lessons.map(l => {
      const progress = db.findOne('lesson_progress', p => p.userId === req.user.id && p.lessonId === l.id);
      return { ...l, progress: progress || null };
    });
  } else {
    lessons = lessons.filter(l => l.createdBy === req.user.id);
  }
  res.json({ lessons });
}

function createLesson(req, res) {
  const lesson = db.insert('lessons', {
    id: newId(), ...req.body, createdBy: req.user.id, chapters: req.body.chapters || [],
    status: req.body.status || 'draft', createdAt: new Date().toISOString()
  });
  res.status(201).json({ lesson });
}

function updateLesson(req, res) {
  const lesson = db.findOne('lessons', l => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  if (lesson.createdBy !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  const updates = { ...req.body }; delete updates.id; delete updates.createdBy; delete updates.createdAt;
  db.update('lessons', l => l.id === req.params.id, () => updates);
  res.json({ lesson: db.findOne('lessons', l => l.id === req.params.id) });
}

function deleteLesson(req, res) {
  const lesson = db.findOne('lessons', l => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  if (lesson.createdBy !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  db.update('lessons', l => l.id === req.params.id, () => ({ status: 'archived' }));
  res.json({ message: 'Lesson archived' });
}

function enrollLesson(req, res) {
  const lesson = db.findOne('lessons', l => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  const existing = db.findOne('lesson_progress', p => p.userId === req.user.id && p.lessonId === req.params.id);
  if (existing) return res.json({ progress: existing });
  const progress = db.insert('lesson_progress', {
    id: newId(), userId: req.user.id, lessonId: req.params.id,
    status: 'in_progress', completedChapters: [], quizResults: {}, xpEarned: 0,
    startedAt: new Date().toISOString(), completedAt: null, lastAccessedAt: new Date().toISOString()
  });
  res.status(201).json({ progress });
}

function getProgress(req, res) {
  const progress = db.findOne('lesson_progress', p => p.userId === req.user.id && p.lessonId === req.params.id);
  res.json({ progress: progress || null });
}

function updateProgress(req, res) {
  const { chapterId, quizId, selectedIndex } = req.body;
  const lesson = db.findOne('lessons', l => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  let progress = db.findOne('lesson_progress', p => p.userId === req.user.id && p.lessonId === req.params.id);
  if (!progress) {
    progress = db.insert('lesson_progress', {
      id: newId(), userId: req.user.id, lessonId: req.params.id,
      status: 'in_progress', completedChapters: [], quizResults: {}, xpEarned: 0,
      startedAt: new Date().toISOString(), completedAt: null, lastAccessedAt: new Date().toISOString()
    });
  }
  let xpAwarded = 0; let leveledUp = false; let newBadges = [];
  const updates = { lastAccessedAt: new Date().toISOString() };
  if (chapterId && !progress.completedChapters.includes(chapterId)) {
    updates.completedChapters = [...progress.completedChapters, chapterId];
    const totalChapters = lesson.chapters?.length || 0;
    if (updates.completedChapters.length >= totalChapters) {
      updates.status = 'completed'; updates.completedAt = new Date().toISOString();
      const baseXP = lesson.xpReward || 100;
      const result = awardPoints(req.user.id, baseXP, `Lesson completed: ${lesson.title}`);
      xpAwarded = baseXP; leveledUp = result.leveledUp; newBadges = result.newBadges;
      db.update('points', p => p.userId === req.user.id, p => ({
        stats: { ...p.stats, lessonsCompleted: (p.stats.lessonsCompleted || 0) + 1 }
      }));
    }
  }
  if (quizId && selectedIndex !== undefined) {
    const quiz = findQuiz(lesson, quizId);
    if (quiz && !progress.quizResults[quizId]) {
      const correct = selectedIndex === quiz.correctIndex;
      const qxp = correct ? (quiz.xpReward || 10) : 0;
      updates.quizResults = { ...progress.quizResults, [quizId]: { selectedIndex, correct, answeredAt: new Date().toISOString() } };
      if (correct && qxp) {
        awardPoints(req.user.id, qxp, `Quiz correct: ${quiz.question?.slice(0,30)}`);
        xpAwarded += qxp;
      }
    }
  }
  db.update('lesson_progress', p => p.userId === req.user.id && p.lessonId === req.params.id, () => updates);
  const updated = db.findOne('lesson_progress', p => p.userId === req.user.id && p.lessonId === req.params.id);
  res.json({ progress: updated, xpAwarded, leveledUp, newBadges });
}

function findQuiz(lesson, quizId) {
  for (const ch of lesson.chapters || []) {
    for (const block of ch.content || []) {
      if (block.type === 'quiz' && block.id === quizId) return block;
    }
  }
  return null;
}

function getAnalytics(req, res) {
  const lesson = db.findOne('lessons', l => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  if (lesson.createdBy !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  const allProgress = db.findAll('lesson_progress', p => p.lessonId === req.params.id);
  const totalChapters = lesson.chapters?.length || 1;
  const completed = allProgress.filter(p => p.status === 'completed').length;
  const inProgress = allProgress.filter(p => p.status === 'in_progress').length;
  const students = db.findAll('users', u => u.role === 'student');
  const notStarted = students.length - allProgress.length;
  const avgCompletion = allProgress.length ? allProgress.reduce((acc, p) => acc + (p.completedChapters.length / totalChapters * 100), 0) / allProgress.length : 0;
  const perStudent = allProgress.map(p => {
    const user = db.findOne('users', u => u.id === p.userId);
    const correctQuizzes = Object.values(p.quizResults || {}).filter(q => q.correct).length;
    const totalQuizzes = Object.values(p.quizResults || {}).length;
    return {
      studentId: p.userId, studentName: user?.name || 'Unknown',
      progressPercent: Math.round(p.completedChapters.length / totalChapters * 100),
      quizScore: totalQuizzes ? Math.round(correctQuizzes / totalQuizzes * 100) : null,
      lastActivity: p.lastAccessedAt, status: p.status,
    };
  });
  res.json({ totalEnrolled: allProgress.length, completed, inProgress, notStarted, avgCompletionPercent: Math.round(avgCompletion), perStudent });
}

module.exports = { getLessons, createLesson, updateLesson, deleteLesson, enrollLesson, getProgress, updateProgress, getAnalytics };
