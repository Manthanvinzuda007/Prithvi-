require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { seedIfEmpty } = require('./data/seeds/seed');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const d = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${color}[${res.statusCode}]\x1b[0m ${req.method} ${req.path} ${d}ms`);
  });
  next();
});

app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/users',    require('./routes/users.routes'));
app.use('/api/tasks',    require('./routes/tasks.routes'));
app.use('/api/lessons',  require('./routes/lessons.routes'));
app.use('/api/points',   require('./routes/points.routes'));
app.use('/api/games',    require('./routes/games.routes'));
app.use('/api/contests', require('./routes/contests.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', platform: 'Prithvi', version: '1.0.0', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));
app.use((err, req, res, next) => {
  console.error('\x1b[31m[ERROR]\x1b[0m', err.message);
  res.status(err.status || 500).json({ error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log('\n\x1b[32m🌍 Prithvi Backend Started\x1b[0m');
  console.log(`\x1b[36m   Server:\x1b[0m  http://localhost:${PORT}`);
  console.log(`\x1b[36m   Health:\x1b[0m  http://localhost:${PORT}/api/health`);
  await seedIfEmpty();
  console.log('\x1b[32m✓\x1b[0m  Data seeded and ready\n');
});
