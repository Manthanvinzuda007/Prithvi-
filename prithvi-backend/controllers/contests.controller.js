const db = require('../utils/db');
const { newId } = require('../utils/ids');

function getPledges(req, res) {
  const { page = 1, limit = 20, sort = 'newest' } = req.query;
  let pledges = db.readDB('pledges');
  if (sort === 'popular') pledges.sort((a,b) => b.likes - a.likes);
  else pledges.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = pledges.length;
  pledges = pledges.slice((page-1)*limit, page*limit);
  res.json({ pledges, total, page: parseInt(page) });
}

function createPledge(req, res) {
  const { text, category } = req.body;
  if (!text) return res.status(400).json({ error: 'Pledge text is required' });
  if (text.length > 150) return res.status(400).json({ error: 'Pledge must be under 150 characters' });
  const userPledges = db.findAll('pledges', p => p.userId === req.user.id);
  if (userPledges.length >= 3) return res.status(429).json({ error: 'Maximum 3 pledges per user' });
  const pledge = db.insert('pledges', {
    id: newId(), userId: req.user.id, userName: req.user.name, userAvatar: req.user.avatarId,
    text, category: category || 'General', likes: 0, likedBy: [],
    createdAt: new Date().toISOString()
  });
  res.status(201).json({ pledge });
}

function likePledge(req, res) {
  const pledge = db.findOne('pledges', p => p.id === req.params.id);
  if (!pledge) return res.status(404).json({ error: 'Pledge not found' });
  const liked = pledge.likedBy.includes(req.user.id);
  db.update('pledges', p => p.id === req.params.id, p => ({
    likes: liked ? p.likes - 1 : p.likes + 1,
    likedBy: liked ? p.likedBy.filter(id => id !== req.user.id) : [...p.likedBy, req.user.id]
  }));
  const updated = db.findOne('pledges', p => p.id === req.params.id);
  res.json({ liked: !liked, likeCount: updated.likes });
}

function deletePledge(req, res) {
  const pledge = db.findOne('pledges', p => p.id === req.params.id);
  if (!pledge) return res.status(404).json({ error: 'Pledge not found' });
  if (pledge.userId !== req.user.id && req.user.role !== 'teacher') return res.status(403).json({ error: 'Not authorized' });
  db.remove('pledges', p => p.id === req.params.id);
  res.json({ message: 'Pledge deleted' });
}

module.exports = { getPledges, createPledge, likePledge, deletePledge };
