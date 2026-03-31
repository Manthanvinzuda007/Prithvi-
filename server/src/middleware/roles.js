function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. ${role === 'teacher' ? 'Teacher' : 'Student'} account required.` });
    }
    next();
  };
}

module.exports = {
  requireStudent: requireRole('student'),
  requireTeacher: requireRole('teacher'),
};
