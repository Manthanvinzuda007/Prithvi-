# 🌍 PRITHVI v3.0 — Gamified Environmental Education Platform
### Ultra Animated Edition — पृथ्वी को बचाओ। खेलते हुए सीखो।

---

## ⚡ Quick Start (2 terminals)

```bash
# Terminal 1 — Backend
cd prithvi-backend && npm install && node server.js
# → http://localhost:5000  (auto-seeds 9 users, 5 tasks, 2 lessons, 50 quiz Qs)

# Terminal 2 — Frontend  
cd prithvi-frontend && npm install && npm run dev
# → http://localhost:5173
```

### Demo Logins
| Role | Email | Password |
|------|-------|----------|
| 🎒 Student | arjun@school.edu | prithvi123 |
| 🎒 Student | ananya@school.edu | prithvi123 |
| 👩‍🏫 Teacher | priya@school.edu | prithvi123 |

---

## 📋 What's Built

### Backend — 100% Complete
- **7 route + controller pairs**: auth, users, tasks, lessons, points, games, contests
- **Atomic JSON DB** (`utils/db.js`) — no MongoDB needed, temp-file atomic writes
- **Gamification engine** (`utils/points.js`) — 6 levels, 10 badges, streak tracking, idempotent awards
- **JWT auth + bcrypt** — roles middleware (student/teacher guards)
- **31 API endpoints** — all CRUD, task review flow, server-side quiz scoring
- **Auto-seeder** — runs on first boot if `users.json` is empty

### Frontend — 28 JSX pages/components, 23 CSS files, 6,799 lines
**Shared:** `HomePage`, `LoginPage`, `RegisterPage`

**Student (9 pages):**
| Page | Key Features |
|------|-------------|
| `StudentDashboard` | EcoBuddy mascot, XP ring, streak calendar, badges, leaderboard, eco tips |
| `StudentExplore` | Topic grid, 3D tilt cards, Punjab local ecology spotlight, live search |
| `StudentLessons` | Lesson browser with progress tracking per chapter |
| `LessonPlayer` | Text/Fact/Warning/Quiz blocks, XP float on correct, confetti on completion |
| `StudentTasks` | Task cards with live countdown, submission modal, star rating |
| `StudentGames` | Quiz Blitz, Waste Sorter, Word Scramble, Tree Simulator |
| `StudentContests` | CSS podium, pledge wall with likes |
| `StudentProfile` | Full bio, all badges showcase, XP history, edit modal |
| `StudentLoadingPage` | Spinning Earth + orbiting leaves |

**Teacher (7 pages):**
| Page | Key Features |
|------|-------------|
| `TeacherDashboard` | KPI cards, SVG bar chart, activity feed, top performers |
| `TeacherTaskReview` | Approve/reject/resubmit with point adjustment |
| `TeacherAssignTask` | Step builder, 4 category grids, 4 templates |
| `TeacherLessons` | CMS block editor (text/fact/warning/quiz blocks) |
| `TeacherStudents` | Roster with XP bars, levels, interests |
| `TeacherAnalytics` | XP distribution chart, level breakdown, completion ring |
| `TeacherLoadingPage` | Skeleton shimmer + thin loading bar |

---

## 🎨 Effect System — `prithvi-[category]-[effect]`

**61 named effects** across 10 categories in `globals.css`:

```css
/* Cards */
prithvi-card-lift-hover  prithvi-card-tilt-3d  prithvi-card-glow-border
prithvi-card-hover-expand  prithvi-card-shimmer  prithvi-card-gradient-border

/* Buttons */
prithvi-btn-ripple  prithvi-btn-lift-hover  prithvi-btn-glow
prithvi-btn-slide-bg  prithvi-btn-scale-click

/* Text */
prithvi-text-typewriter  prithvi-text-gradient-flow
prithvi-text-fade-up  prithvi-text-pop-in

/* Games */
prithvi-quiz-correct-flash  prithvi-quiz-wrong-shake
prithvi-option-hover-glow  prithvi-timer-bar  prithvi-score-burst

/* Gamification */
prithvi-streak-fire-flicker  prithvi-badge-unlock-pop  prithvi-xp-float
prithvi-trophy-bounce

/* Loading */
prithvi-loader-earth  orbit-leaf  prithvi-skeleton-shimmer
```

**6 imperative JS triggers** in `src/utils/effects.js`:
```js
triggerXPFloat(el, amount)    // "+75 XP 🌱" floats up from element
triggerConfetti(x, y)         // 30 confetti pieces burst outward
triggerLeafRain()             // 20 leaves fall from top of screen
triggerXPExplosion(x, y)      // 3 concentric rings expand outward
triggerScoreBurst(el)         // Score number pulses gold
attachRipple(btn)             // Material ripple on button click
```

**3 custom hooks** in `src/hooks/useInView.js`:
```js
const [ref, inView] = useInView()    // IntersectionObserver (triggers once)
const scrolled = useScrolled(60)     // true when scrollY > 60px
const tiltRef = useTilt3D(12)        // 3D perspective tilt on mousemove
```

---

## 🎮 Games

| Game | Mechanic | Timer | Scoring |
|------|----------|-------|---------|
| ⚡ Quiz Blitz | 10 eco questions (50 total in DB) | 30s/Q | Server-side, +10 XP/correct |
| ♻️ Waste Sorter | Sort items → 5 bins (organic/plastic/glass/paper/e-waste) | None | +5 pts/correct |
| 🔤 Word Scramble | Unscramble eco vocabulary (10 words) | 45s/word | +10 + time bonus |
| 🌳 Tree Simulator | Virtual tree linked to real task XP (5 growth stages) | Persistent | — |

---

## 🌱 Gamification

### 6 Levels
`🌱 Earth Seedling (0)` → `🌿 Eco Sprout (100)` → `🌳 Green Warrior (250)` → `🌍 Earth Guardian (500)` → `🦋 Nature Champion (1000)` → `👑 Planet Protector (2000)`

### 10 Badges
`🌳 Tree Planter` `♻️ Waste Warrior` `💧 Water Guardian` `⚡ Energy Saver` `📚 Eco Scholar` `🎯 Quiz Master` `🔥 Streak Warrior (7d)` `🏅 Monthly Guardian (30d)` `🌍 Climate Champion (500 XP)` `👑 Eco Legend (2000 XP)`

---

## 🛠️ Tech Stack
React 18 + Vite | Plain CSS (no Tailwind) | React Router v6 | Axios | Node.js + Express 4 | JSON flat files (no DB needed) | JWT + bcryptjs | Google Fonts | Pure CSS @keyframes | Hand-coded SVG charts

---

## 🌍 Aligned With
NEP 2020 | SDG 4 (Quality Education) | SDG 13 (Climate Action) | SDG 15 (Life on Land) | Punjab Dept. of Higher Education

---

*Prithvi v3.0 — Built with 🌱 for a greener India* By M.S. Vinzuda
