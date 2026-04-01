import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/shared/Toast';
import api from '../../utils/api';
import './RegisterPage.css';

const INTERESTS = ['🌳 Trees & Forests','💧 Water Conservation','🌬️ Air Quality','🦋 Wildlife',
  '♻️ Waste Management','☀️ Solar Energy','🌾 Sustainable Farming','🌊 Ocean Health',
  '🌡️ Climate Action','🏙️ Urban Greening','🐝 Pollinators','🌿 Organic Living'];

const AVATARS = ['🌿','🌍','🦋','🏔️','🔭','🌾'];

const SCHOOLS = ['Govt. Model Senior Secondary School, Chandigarh',
  'Govt. Sr. Sec. School, Ludhiana','DAV Public School, Amritsar',
  'Khalsa Model Sr. Sec. School, Patiala','Govt. Girls Sr. Sec. School, Jalandhar'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setUser } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(params.get('role') || 'student');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    school: '', grade: 'Class 9', section: '', subject: '',
    avatarId: 1, interests: [], ecoPledge: ''
  });
  const [loading, setLoading] = useState(false);
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const up = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const passwordStrength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const handleSchool = (v) => {
    up('school', v);
    setSchoolSuggestions(v.length > 1 ? SCHOOLS.filter(s => s.toLowerCase().includes(v.toLowerCase())) : []);
  };

  const toggleInterest = (tag) => {
    up('interests', form.interests.includes(tag)
      ? form.interests.filter(i => i !== tag)
      : [...form.interests, tag]);
  };

  const handleSubmit = async () => {
    if (form.interests.length < 3) { toast('Please select at least 3 interests!', 'warning'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password, role,
        school: form.school, grade: form.grade, section: form.section,
        subject: form.subject, avatarId: form.avatarId,
        interests: form.interests, ecoPledge: form.ecoPledge,
      };
      const res = await api.post('/auth/register', payload);
      localStorage.setItem('prithvi_token', res.data.token);
      setUser(res.data.user);
      setShowCelebration(true);
      setTimeout(() => navigate(role === 'teacher' ? '/teacher' : '/student'), 2500);
    } catch (err) {
      toast(err.response?.data?.error || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  const strengthPct = passwordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e', '#15803d'];

  return (
    <div className="register-page">
      {/* Floating leaves */}
      {[{top:'5%',left:'3%'},{top:'20%',right:'5%'},{top:'60%',left:'1%'},{top:'80%',right:'8%'}].map((s,i) => (
        <div key={i} className="reg-leaf" style={{...s, animationDelay: `${i*0.5}s`}}>🍃</div>
      ))}

      <div className="register-card">
        {/* Progress */}
        <div className="reg-progress">
          {[1,2,3].map(n => (
            <div key={n} className="reg-step-wrap">
              <div className={`reg-step-dot ${step > n ? 'done' : step === n ? 'active' : ''}`}>
                {step > n ? '✓' : n}
              </div>
              <span className="reg-step-label">
                {['Choose Role','Your Details','Your Profile'][n-1]}
              </span>
              {n < 3 && <div className={`reg-step-line ${step > n ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="reg-body" style={{animation:'fadeInScale 300ms ease'}}>
            <h2 className="reg-heading">Join Prithvi! 🌍</h2>
            <p className="reg-sub">First, tell us who you are</p>
            <div className="role-cards">
              <div className={`role-card ${role === 'student' ? 'selected' : ''}`} onClick={() => setRole('student')}>
                <span className="role-card-icon">🎒</span>
                <h3>I'm a Student</h3>
                <p>Learn, play games, complete eco-missions</p>
                <ul>
                  <li>✓ Earn Eco-Points</li>
                  <li>✓ Unlock Badges</li>
                  <li>✓ Join Competitions</li>
                </ul>
              </div>
              <div className={`role-card ${role === 'teacher' ? 'selected' : ''}`} onClick={() => setRole('teacher')}>
                <span className="role-card-icon">👨‍🏫</span>
                <h3>I'm a Teacher</h3>
                <p>Create lessons, assign tasks, track students</p>
                <ul>
                  <li>✓ Manage Students</li>
                  <li>✓ Create Content</li>
                  <li>✓ View Analytics</li>
                </ul>
              </div>
            </div>
            <button className="reg-btn" onClick={() => setStep(2)}>Continue →</button>
            <p className="reg-login">Already have an account? <span onClick={() => navigate('/login')}>Login →</span></p>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="reg-body" style={{animation:'fadeInScale 300ms ease'}}>
            <h2 className="reg-heading">Your Details 📝</h2>
            <div className="reg-fields">
              <div className="reg-field">
                <label>Full Name</label>
                <div className="reg-input-wrap">
                  <span>👤</span>
                  <input value={form.name} onChange={e => up('name', e.target.value)} placeholder="Arjun Sharma" />
                </div>
              </div>
              <div className="reg-field">
                <label>Email Address</label>
                <div className="reg-input-wrap">
                  <span>✉️</span>
                  <input type="email" value={form.email} onChange={e => up('email', e.target.value)} placeholder="you@school.edu" />
                  {form.email.includes('@') && <span className="field-ok">✓</span>}
                </div>
              </div>
              <div className="reg-field">
                <label>Password</label>
                <div className="reg-input-wrap">
                  <span>🔒</span>
                  <input type="password" value={form.password} onChange={e => up('password', e.target.value)} placeholder="Min 8 characters" />
                </div>
                {form.password && (
                  <div className="strength-meter">
                    <div className="strength-bars">
                      {[1,2,3,4].map(n => <div key={n} className="strength-bar" style={{background: n <= strengthPct ? strengthColors[strengthPct] : '#e2e8f0'}} />)}
                    </div>
                    <span style={{color: strengthColors[strengthPct], fontSize: 12, fontWeight: 700}}>{strengthLabels[strengthPct]}</span>
                  </div>
                )}
              </div>
              <div className="reg-field">
                <label>Confirm Password</label>
                <div className="reg-input-wrap">
                  <span>🔒</span>
                  <input type="password" value={form.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} placeholder="Repeat password" />
                  {form.confirmPassword && (
                    <span className={form.password === form.confirmPassword ? 'field-ok' : 'field-err'}>
                      {form.password === form.confirmPassword ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              </div>
              <div className="reg-field" style={{position:'relative'}}>
                <label>School / College Name</label>
                <div className="reg-input-wrap">
                  <span>🏫</span>
                  <input value={form.school} onChange={e => handleSchool(e.target.value)} placeholder="Start typing your school..." />
                </div>
                {schoolSuggestions.length > 0 && (
                  <div className="school-dropdown">
                    {schoolSuggestions.map(s => (
                      <div key={s} className="school-opt" onClick={() => { up('school', s); setSchoolSuggestions([]); }}>{s}</div>
                    ))}
                  </div>
                )}
              </div>
              {role === 'student' && (
                <div className="reg-row">
                  <div className="reg-field">
                    <label>Class / Grade</label>
                    <select value={form.grade} onChange={e => up('grade', e.target.value)} className="reg-select">
                      {['Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12','UG 1st Year','UG 2nd Year','UG 3rd Year'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="reg-field">
                    <label>Section</label>
                    <div className="reg-input-wrap">
                      <span>📋</span>
                      <input value={form.section} onChange={e => up('section', e.target.value)} placeholder="A" maxLength={3} />
                    </div>
                  </div>
                </div>
              )}
              {role === 'teacher' && (
                <div className="reg-field">
                  <label>Subject</label>
                  <div className="reg-input-wrap">
                    <span>📚</span>
                    <input value={form.subject} onChange={e => up('subject', e.target.value)} placeholder="Environmental Science" />
                  </div>
                </div>
              )}
            </div>
            <div className="reg-nav">
              <button className="reg-back" onClick={() => setStep(1)}>← Back</button>
              <button className="reg-btn" disabled={!form.name || !form.email || !form.password || form.password !== form.confirmPassword || !form.school}
                onClick={() => setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="reg-body" style={{animation:'fadeInScale 300ms ease'}}>
            <h2 className="reg-heading">Your Eco Profile 🌿</h2>

            <div className="avatar-section">
              <h4>Choose Your Eco-Avatar</h4>
              <div className="avatar-grid">
                {AVATARS.map((a, i) => (
                  <div key={i} className={`avatar-opt ${form.avatarId === i+1 ? 'selected' : ''}`}
                    onClick={() => up('avatarId', i+1)}>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="interests-section">
              <h4>What eco-topics excite you? <span className="interest-count">{form.interests.length}/3 min</span></h4>
              <div className="interest-tags">
                {INTERESTS.map(tag => (
                  <button key={tag} className={`interest-tag ${form.interests.includes(tag) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="reg-field">
              <label>Your Eco-Pledge <span style={{color:'#7a907a',fontWeight:400}}>(optional)</span></label>
              <textarea value={form.ecoPledge} onChange={e => up('ecoPledge', e.target.value.slice(0,150))}
                placeholder="I pledge to reduce plastic use in my home..." className="reg-textarea" />
              <span className="char-count">{form.ecoPledge.length}/150</span>
            </div>

            <div className="reg-nav">
              <button className="reg-back" onClick={() => setStep(2)}>← Back</button>
              <button className="reg-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Create My Account 🌱'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showCelebration && (
        <div className="celebration-overlay">
          {Array.from({length: 20}).map((_,i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random()*100}%`, background: ['#22c55e','#f59e0b','#38bdf8','#fb7185','#a78bfa'][i%5],
              animationDelay: `${Math.random()*0.5}s`
            }} />
          ))}
          <div className="celebration-card">
            <div style={{fontSize: 64}}>🎉</div>
            <h2>Welcome to Prithvi!</h2>
            <p>Your eco-journey begins now 🌱</p>
          </div>
        </div>
      )}
    </div>
  );
}
