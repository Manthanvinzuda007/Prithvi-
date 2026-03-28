const db = require('../utils/db');
const { awardPoints } = require('../utils/points');
const { createNotification } = require('../utils/notifications');
const { newId } = require('../utils/ids');

function getTasks(req, res) {
  const { status, category, sort } = req.query;
  let tasks = db.readDB('tasks');
  if (req.user.role === 'student') {
    tasks = tasks.filter(t => t.assignedTo === 'all' || (Array.isArray(t.assignedTo) && t.assignedTo.includes(req.user.id)));
    tasks = tasks.filter(t => t.status !== 'archived');
  } else {
    tasks = tasks.filter(t => t.createdBy === req.user.id);
  }
  if (category) tasks = tasks.filter(t => t.category === category);
  if (sort === 'deadline') tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  else if (sort === 'points') tasks.sort((a, b) => b.ecoPointsReward - a.ecoPointsReward);
  else tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  // For students, include their submission status
  if (req.user.role === 'student') {
    tasks = tasks.map(t => {
      const mySub = t.submissions?.find(s => s.studentId === req.user.id);
      return { ...t, mySubmission: mySub || null };
    });
  }
  res.json({ tasks });
}

function createTask(req, res) {
  const { title, description, instructions, submissionRequirements, category, difficulty, ecoPointsReward, deadline, assignedTo, ecoBenefit } = req.body;
  if (!title || !category || !difficulty) return res.status(400).json({ error: 'Title, category, and difficulty are required' });
  const task = db.insert('tasks', {
    id: newId(), title, description: description || '', instructions: instructions || [],
    submissionRequirements: submissionRequirements || '', category, difficulty,
    ecoPointsReward: ecoPointsReward || 50, deadline: deadline || null,
    createdBy: req.user.id, assignedTo: assignedTo || 'all',
    ecoBenefit: ecoBenefit || '', submissions: [], status: 'active',
    createdAt: new Date().toISOString(),
  });
  // Notify students
  const students = db.findAll('users', u => u.role === 'student');
  students.forEach(s => createNotification(s.id, 'new_task', `New task assigned: "${title}" 🌱`, task.id));
  res.status(201).json({ task });
}

function getTask(req, res) {
  const task = db.findOne('tasks', t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const result = { ...task };
  if (req.user.role === 'student') {
    result.mySubmission = task.submissions?.find(s => s.studentId === req.user.id) || null;
  }
  res.json({ task: result });
}

function updateTask(req, res) {
  const task = db.findOne('tasks', t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.createdBy !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  const updates = { ...req.body };
  delete updates.id; delete updates.submissions; delete updates.createdBy; delete updates.createdAt;
  db.update('tasks', t => t.id === req.params.id, () => updates);
  const updated = db.findOne('tasks', t => t.id === req.params.id);
  res.json({ task: updated });
}

function deleteTask(req, res) {
  const task = db.findOne('tasks', t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.createdBy !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  if (task.submissions?.length > 0) {
    db.update('tasks', t => t.id === req.params.id, () => ({ status: 'archived' }));
  } else {
    db.remove('tasks', t => t.id === req.params.id);
  }
  res.json({ message: 'Task deleted' });
}

function submitTask(req, res) {
  const { description, proofUrl, selfAssessmentStars } = req.body;
  if (!description) return res.status(400).json({ error: 'Description is required' });
  const task = db.findOne('tasks', t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const alreadySubmitted = task.submissions?.find(s => s.studentId === req.user.id && s.status !== 'rejected');
  if (alreadySubmitted) return res.status(409).json({ error: 'Already submitted this task' });
  const submission = {
    studentId: req.user.id, description, proofUrl: proofUrl || null,
    selfAssessmentStars: selfAssessmentStars || 0,
    submittedAt: new Date().toISOString(), status: 'pending',
    teacherComment: '', pointsAwarded: 0, reviewedAt: null,
  };
  const tasks = db.readDB('tasks');
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx !== -1) {
    // Remove old rejected submissions from this student before adding new one
    tasks[idx].submissions = tasks[idx].submissions.filter(s => s.studentId !== req.user.id);
    tasks[idx].submissions.push(submission);
    db.writeDB('tasks', tasks);
  }
  // Notify teacher
  const teacher = db.findOne('users', u => u.id === task.createdBy);
  if (teacher) createNotification(teacher.id, 'submission', `${req.user.name} submitted "${task.title}" for review 📋`, task.id);
  res.status(201).json({ submission });
}

function reviewTask(req, res) {
  const { decision, comment, pointsAwarded } = req.body;
  if (!['approved','rejected','resubmit'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' });
  const task = db.findOne('tasks', t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.createdBy !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  const studentId = req.params.studentId;
  const tasks = db.readDB('tasks');
  const taskIdx = tasks.findIndex(t => t.id === req.params.id);
  const subIdx = tasks[taskIdx].submissions.findIndex(s => s.studentId === studentId);
  if (subIdx === -1) return res.status(404).json({ error: 'Submission not found' });
  tasks[taskIdx].submissions[subIdx].status = decision === 'resubmit' ? 'rejected' : decision;
  tasks[taskIdx].submissions[subIdx].teacherComment = comment || '';
  tasks[taskIdx].submissions[subIdx].reviewedAt = new Date().toISOString();
  let pointsResult = null;
  if (decision === 'approved') {
    const pts = pointsAwarded !== undefined ? pointsAwarded : task.ecoPointsReward;
    tasks[taskIdx].submissions[subIdx].pointsAwarded = pts;
    pointsResult = awardPoints(studentId, pts, `Task approved: ${task.title}`);
    // Update student stats
    db.update('points', p => p.userId === studentId, p => ({
      stats: {
        ...p.stats, tasksCompleted: (p.stats.tasksCompleted || 0) + 1,
        tasksByCategory: { ...p.stats.tasksByCategory, [task.category]: ((p.stats.tasksByCategory || {})[task.category] || 0) + 1 }
      }
    }));
    createNotification(studentId, 'task_approved', `Your task "${task.title}" was approved! +${pts} Eco-Points 🌱`, task.id);
  } else if (decision === 'rejected') {
    createNotification(studentId, 'task_rejected', `Your task "${task.title}" needs changes. Check teacher feedback. 📝`, task.id);
  } else {
    createNotification(studentId, 'task_resubmit', `Please resubmit "${task.title}" with changes. 🔄`, task.id);
  }
  db.writeDB('tasks', tasks);
  res.json({ submission: tasks[taskIdx].submissions[subIdx], pointsResult });
}

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask, submitTask, reviewTask };
