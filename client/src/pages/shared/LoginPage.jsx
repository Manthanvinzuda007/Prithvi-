import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/shared/Toast';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(email, password);
      toast('Welcome back! 🌿', 'success');
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="login-left-bg-dots" />
        {[{top:'10%',left:'5%',delay:'0s',size:24},{top:'30%',right:'8%',delay:'0.8s',size:18},{top:'60%',left:'3%',delay:'1.5s',size:30},{top:'80%',right:'12%',delay:'0.4s',size:16}].map((s,i) => (
          <div key={i} className="login-leaf" style={{top:s.top,left:s.left,right:s.right,animationDelay:s.delay,fontSize:s.size}}>🍃</div>
        ))}

        {/* CSS Tree Scene */}
        <div className="tree-scene">
          <div className="scene-sun" />
          <div className="scene-sky" />
          <div className="tree">
            <div className="tree-crown tree-crown-1" />
            <div className="tree-crown tree-crown-2" />
            <div className="tree-crown tree-crown-3" />
            <div className="tree-trunk" />
          </div>
          <div className="scene-bird scene-bird-1">🐦</div>
          <div className="scene-bird scene-bird-2">🐦</div>
          <div className="scene-book">📖</div>
          <div className="scene-grass" />
        </div>

        <div className="login-quote">
          <p className="quote-hindi">हर छोटा कदम, पृथ्वी के लिए बड़ा बदलाव है।</p>
          <p className="quote-english">"Every small step is a big change for Earth."</p>
          <span className="quote-attr">— Prithvi Platform</span>
        </div>

        <div className="login-stat-pill">
          🌱 <strong>248</strong> students logged in today
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className={`login-form-wrap ${shake ? 'shake' : ''}`}>
          <div className="login-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            🌍 PRITHVI
          </div>
          <h1 className="login-heading">Welcome Back! 👋</h1>
          <p className="login-sub">Sign in to continue your eco-journey</p>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button className={`role-btn ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>
              🎒 Student
            </button>
            <button className={`role-btn ${role === 'teacher' ? 'active' : ''}`} onClick={() => setRole('teacher')}>
              👨‍🏫 Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="field-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@school.edu" required />
              </div>
            </div>

            <div className="field-group">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="login-extras">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <span className="forgot-link">Forgot Password?</span>
            </div>

            <button type="submit" className={`login-submit ${role}`} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In →'}
            </button>
          </form>

          <p className="login-register-link">
            New to Prithvi?{' '}
            <span onClick={() => navigate('/register')} style={{ color: '#22c55e', cursor: 'pointer', fontWeight: 700 }}>
              Create your account →
            </span>
          </p>

          <div className="demo-creds">
            <p><strong>Demo:</strong> arjun@school.edu / prithvi123</p>
            <p><strong>Teacher:</strong> priya@school.edu / prithvi123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
