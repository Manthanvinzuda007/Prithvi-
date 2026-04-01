import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInView } from '../../hooks/useInView';
import { attachRipple } from '../../utils/effects';
import './HomePage.css';

const TYPEWRITER_PHRASES = [
  'Learn. Play. Protect. 🌍',
  'पृथ्वी को बचाओ। 🌱',
  'Make Every Day Earth Day. ♻️',
];

const ECO_TIPS = [
  "Turning off the tap while brushing saves up to 8 liters per minute!",
  "A single tree absorbs ~22 kg of CO₂ per year.",
  "Recycling one aluminium can saves enough energy to run a TV for 3 hours.",
  "LED bulbs use 75% less energy than incandescent bulbs.",
  "Composting food waste reduces methane emissions from landfills.",
];

const LEAVES_CONFIG = [
  { top: '8%', left: '5%', delay: '0s', size: 28, dur: '10s' },
  { top: '15%', right: '8%', delay: '0.7s', size: 22, dur: '13s' },
  { top: '35%', left: '2%', delay: '1.2s', size: 18, dur: '9s' },
  { top: '55%', right: '4%', delay: '0.3s', size: 32, dur: '14s' },
  { top: '70%', left: '8%', delay: '1.8s', size: 20, dur: '11s' },
  { top: '20%', left: '30%', delay: '2.1s', size: 16, dur: '16s' },
  { top: '45%', right: '15%', delay: '0.9s', size: 24, dur: '12s' },
  { top: '80%', right: '20%', delay: '1.5s', size: 14, dur: '15s' },
];

// Particle dots config
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 2,
  color: ['#22c55e', '#fcd34d', '#38bdf8', '#4ade80', '#86efac'][i % 5],
  delay: `${Math.random() * 4}s`,
  dur: `${3 + Math.random() * 4}s`,
  opacity: 0.3 + Math.random() * 0.3,
}));

function StatCounter({ icon, value, suffix, label }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();

  useEffect(() => {
    if (!inView) return;
    const dur = 2000;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(value * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-icon">{icon}</span>
      <span className="stat-number prithvi-text-pop-in">{count.toLocaleString('en-IN')}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref}
      className={`feature-card prithvi-card-lift-hover prithvi-card-glow-border prithvi-text-fade-up ${inView ? 'visible' : ''}`}
      style={{ transitionDelay: delay }}>
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isErasing, setIsErasing] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const btnStudentRef = useRef();
  const btnTeacherRef = useRef();
  const [statsRef, statsInView] = useInView();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(user.role === 'teacher' ? '/teacher' : '/student');
  }, [user]);

  // Typewriter effect cycling through 3 phrases
  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx];
    let timeout;
    if (!isErasing) {
      if (typedText.length < phrase.length) {
        timeout = setTimeout(() => setTypedText(phrase.slice(0, typedText.length + 1)), 65);
      } else {
        timeout = setTimeout(() => setIsErasing(true), 1800);
      }
    } else {
      if (typedText.length > 0) {
        timeout = setTimeout(() => setTypedText(typedText.slice(0, -1)), 35);
      } else {
        setIsErasing(false);
        setPhraseIdx(p => (p + 1) % TYPEWRITER_PHRASES.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [typedText, isErasing, phraseIdx]);

  // Eco tip rotation
  useEffect(() => {
    const iv = setInterval(() => setTipIdx(p => (p + 1) % ECO_TIPS.length), 5000);
    return () => clearInterval(iv);
  }, []);

  // Attach ripple to CTA buttons
  useEffect(() => {
    if (btnStudentRef.current) attachRipple(btnStudentRef.current);
    if (btnTeacherRef.current) attachRipple(btnTeacherRef.current);
  }, []);

  // Parallax on scroll
  useEffect(() => {
    const leafLayer = document.querySelector('.leaves-layer');
    const handler = () => {
      if (leafLayer && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        leafLayer.style.transform = `translateY(${window.scrollY * 0.1}px)`;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg-dots" />

        {/* Floating leaves layer - prithvi-bg-floating-leaves */}
        <div className="leaves-layer">
          {LEAVES_CONFIG.map((l, i) => (
            <div key={i} className="prithvi-bg-leaf" style={{
              top: l.top, left: l.left, right: l.right,
              width: l.size, height: l.size,
              background: ['#22c55e','#4ade80','#86efac','#15803d','#fcd34d','#22c55e','#4ade80','#86efac'][i],
              animationDuration: l.dur,
              animationDelay: l.delay,
              opacity: 0.12,
            }} />
          ))}
        </div>

        {/* Particle dots - prithvi-bg-particle-dots */}
        <div className="particles-layer">
          {PARTICLES.map((p, i) => (
            <div key={i} className="prithvi-particle-dot" style={{
              left: p.left, top: p.top,
              width: p.size, height: p.size,
              background: p.color,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }} />
          ))}
        </div>

        {/* CSS Sun - prithvi-bg-sun-glow-pulse */}
        <div className="prithvi-bg-sun hero-sun" />

        <div className="hero-content">
          <div className="hero-badge">🌱 पृथ्वी को बचाओ • Save the Earth</div>

          {/* prithvi-text-gradient-flow on title */}
          <h1 className="hero-title prithvi-text-gradient-flow">PRITHVI</h1>
          <p className="hero-subtitle">पृथ्वी को बचाओ। खेलते हुए सीखो।</p>

          {/* prithvi-text-typewriter */}
          <h2 className="hero-headline prithvi-text-typewriter">
            {typedText}
          </h2>

          <p className="hero-desc">
            The gamified platform turning environmental education into real-world eco-action for{' '}
            <strong>10,000+ Indian students</strong>.
          </p>

          <div className="hero-cta-row">
            {/* prithvi-btn-slide-bg + prithvi-btn-lift-hover + prithvi-btn-ripple */}
            <button ref={btnStudentRef}
              className="btn-student prithvi-btn-lift-hover prithvi-btn-ripple prithvi-btn-scale-click"
              onClick={() => navigate('/register?role=student')}>
              <span>🌱 I'm a Student</span>
            </button>
            <button ref={btnTeacherRef}
              className="btn-teacher prithvi-btn-lift-hover prithvi-btn-ripple prithvi-btn-scale-click"
              onClick={() => navigate('/register?role=teacher')}>
              <span>📚 I'm a Teacher</span>
            </button>
          </div>

          <p className="hero-login-link">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="hero-login-span">Login here →</span>
          </p>
        </div>

        <div className="hero-scroll-indicator">
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats-bar" ref={statsRef}>
        <StatCounter icon="🌱" value={10000} suffix="+" label="Students Active" />
        <StatCounter icon="📋" value={500} suffix="+" label="Eco Tasks Done" />
        <StatCounter icon="🏫" value={100} suffix="+" label="Schools Joined" />
        <StatCounter icon="🏆" value={50000} suffix="+" label="Eco Points Earned" />
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <h2 className="section-heading">Why Prithvi?</h2>
        <p className="section-sub">Making environmental education experiential, not theoretical</p>
        <div className="features-grid">
          <FeatureCard icon="🎮" title="Gamified Learning" delay="0s"
            desc="Learn through quizzes, challenges, and interactive games that make environmental science fun and unforgettable." />
          <FeatureCard icon="🌍" title="Real-World Eco Missions" delay="0.15s"
            desc="Plant trees, audit your home's energy, segregate waste — earn Eco-Points for actions that actually help the planet." />
          <FeatureCard icon="🏆" title="Compete & Conquer" delay="0.3s"
            desc="School leaderboards, class challenges, and eco-events that build healthy competition around environmental action." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <h2 className="section-heading white">How It Works</h2>
        <div className="steps-row">
          {[
            { n: 1, title: 'Register & Customize', desc: 'Create your eco-profile, pick your avatar, choose your environmental interests.', icon: '👤' },
            { n: 2, title: 'Learn & Play', desc: 'Take interactive lessons, play eco-games, complete knowledge challenges.', icon: '📚' },
            { n: 3, title: 'Act & Earn', desc: 'Complete real-world eco-tasks, earn points, unlock badges, climb the leaderboard.', icon: '🌿' },
          ].map((s, i) => (
            <div key={s.n} className="step-item">
              <div className="step-number">{s.n}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < 2 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* TOPICS */}
      <section className="topics-section">
        <h2 className="section-heading">What Will You Learn?</h2>
        <p className="section-sub">50+ comprehensive lesson modules with quizzes, tasks, and challenges</p>
        <div className="topics-scroll scroll-hide">
          {['🌳 Forests','💧 Water Bodies','🌬️ Air Quality','🦋 Wildlife','♻️ Waste Mgmt',
            '☀️ Renewable Energy','🌾 Agriculture','🌊 Oceans','🌡️ Climate Change',
            '🏙️ Urban Ecology','🪸 Marine Life','🐾 Biodiversity'].map(t => (
            <span key={t} className="topic-pill prithvi-btn-scale-click">{t}</span>
          ))}
        </div>
        <div className="eco-tip-banner">
          <span className="tip-icon">💡</span>
          <span className="tip-text">{ECO_TIPS[tipIdx]}</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="footer-logo prithvi-text-gradient-flow">🌍 PRITHVI</div>
            <p>A Punjab Department of Higher Education Initiative</p>
            <p style={{ marginTop: 8, opacity: 0.5, fontSize: 12 }}>Aligned with NEP 2020 &amp; SDG Goals 4, 13, 15</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li onClick={() => navigate('/')}>Home</li>
              <li onClick={() => navigate('/login')}>Login</li>
              <li onClick={() => navigate('/register')}>Register</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Aligned With</h4>
            <ul>
              <li>SDG Goal 4 — Quality Education</li>
              <li>SDG Goal 13 — Climate Action</li>
              <li>SDG Goal 15 — Life on Land</li>
              <li>NEP 2020 Experiential Learning</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © 2024 Prithvi. Made with 🌱 for a greener India.
        </div>
      </footer>
    </div>
  );
}
