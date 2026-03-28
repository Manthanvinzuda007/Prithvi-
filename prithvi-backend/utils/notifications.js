const db = require('./db');
const { newId } = require('./ids');

function createNotification(userId, type, message, relatedId = null) {
  return db.insert('notifications', {
    id: newId(), userId, type, message, relatedId, read: false,
    createdAt: new Date().toISOString()
  });
}

module.exports = { createNotification };
