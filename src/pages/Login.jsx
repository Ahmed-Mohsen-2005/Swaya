import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, BrainCircuit, Eye, EyeOff, FileText, Languages, LockKeyhole, Mail, ShieldCheck, Stethoscope, UserRound, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { useI18n } from '../i18n';
import logo from '../assets/swaya-horizontal.png';
import icon from '../assets/logo-icon.png';

const roleConfig = {
  teacher: {
    email: 'teacher@swaya.demo',
    icon: Users,
    label: 'Teacher',
    description: 'Live classroom monitoring and student support workflows.',
    submitLabel: 'Enter Teacher Workspace',
  },
  doctor: {
    email: 'doctor@swaya.demo',
    icon: Stethoscope,
    label: 'Doctor',
    description: 'Clinical review, recommendations, and therapy planning.',
    submitLabel: 'Enter Doctor Workspace',
  },
  parent: {
    email: 'parent@swaya.demo',
    icon: UserRound,
    label: 'Parent',
    description: 'Parent-safe progress updates and home guidance.',
    submitLabel: 'Enter Parent Workspace',
  },
};

const features = [
  [BarChart3, 'Live classroom monitoring', 'Track attention, engagement, and stress signals in real time.'],
  [BrainCircuit, 'Behavioral analytics', 'Review trends and risk indicators with role-specific context.'],
  [ShieldCheck, 'Secure role-based access', 'Keep teachers, parents, and clinicians in the right workspace.'],
  [FileText, 'Reports and clinical insights', 'Use structured reports and recommendations for follow-up decisions.'],
];

export default function Login() {
  const nav = useNavigate();
  const { t, isArabic, toggleLanguage } = useI18n();
  const { login } = useAuthStore();
  const [role, setRole] = useState('teacher');
  const [email, setEmail] = useState(roleConfig.teacher.email);
  const [password, setPassword] = useState('demo123');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const pickRole = selectedRole => {
    setRole(selectedRole);
    setEmail(roleConfig[selectedRole].email);
    setErr('');
    setNote('');
    setEmailTouched(false);
    setPasswordTouched(false);
  };

  const submit = async event => {
    event.preventDefault();
    setErr('');
    setNote('');
    if (!email.trim()) {
      setErr('Email is required.');
      setEmailTouched(true);
      return;
    }
    if (!password.trim()) {
      setErr('Password is required.');
      setPasswordTouched(true);
      return;
    }
    setLoading(true);
    const user = await login(email, password, role);
    setLoading(false);
    if (user) {
      if (remember) localStorage.setItem('swaya_remember_login', 'true');
      else localStorage.removeItem('swaya_remember_login');
      nav(authService.getRedirectPath(user.role));
    } else {
      setErr('Invalid credentials for the selected role.');
    }
  };

  const activeRole = roleConfig[role];
  const hasEmailError = emailTouched && !email.trim();
  const hasPasswordError = passwordTouched && !password.trim();

  return (
    <div className="auth-shell">
      <button className="auth-language" type="button" onClick={toggleLanguage}>
        <Languages size={16} />
        {isArabic ? 'English' : 'العربية'}
      </button>

      <section className="auth-brand">
        <Link to="/"><img src={logo} className="auth-logo" alt="SWAYA" /></Link>
        <div className="auth-brand-copy">
          <span className="auth-eyebrow">{t('Secure monitoring platform')}</span>
          <h1>{t('Secure role-based access')}</h1>
          <p>{t('Access live monitoring, behavioral insights, reports, and stakeholder collaboration from one secure platform.')}</p>
        </div>

        <div className="auth-features">
          {features.map(([Icon, title, description]) => (
            <div className="auth-feature-card" key={title}>
              <span><Icon size={17} /></span>
              <div>
                <b>{t(title)}</b>
                <p>{t(description)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-panel-wrap">
        <form className="auth-panel" onSubmit={submit}>
          <div className="auth-panel-mark"><img src={icon} alt="SWAYA" /></div>
          <div className="auth-panel-head">
            <h2>{t('Sign in to SWAYA')}</h2>
            <p>{t('Select your role and continue to your secure dashboard.')}</p>
          </div>

          <div className="auth-role-tabs" role="tablist" aria-label={t('Role')}>
            {Object.entries(roleConfig).map(([key, item]) => {
              const Icon = item.icon;
              return (
                <button type="button" role="tab" aria-selected={role === key} className={role === key ? 'active' : ''} onClick={() => pickRole(key)} key={key}>
                  <Icon size={16} />
                  <span>{t(item.label)}</span>
                </button>
              );
            })}
          </div>

          <div className="auth-role-description">{t(activeRole.description)}</div>

          <div className="auth-form">
            <label>
              <span>{t('Email Address')}</span>
              <div className={`auth-input ${hasEmailError ? 'is-error' : ''}`}>
                <Mail size={17} />
                <input
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  autoComplete="email"
                  aria-invalid={hasEmailError}
                  placeholder={activeRole.email}
                />
              </div>
            </label>

            <label>
              <span>{t('Password')}</span>
              <div className={`auth-input ${hasPasswordError ? 'is-error' : ''}`}>
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  autoComplete="current-password"
                  aria-invalid={hasPasswordError}
                  placeholder={t('Enter your password')}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={t(showPassword ? 'Hide password' : 'Show password')}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <div className="auth-form-row">
              <label className="remember-control">
                <input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />
                <span>{t('Remember me')}</span>
              </label>
              <button type="button" className="forgot-link" onClick={() => setNote('Password reset is not connected in this demo environment.')}>
                {t('Forgot password?')}
              </button>
            </div>

            {err && <div className="auth-alert error">{t(err)}</div>}
            {note && <div className="auth-alert info">{t(note)}</div>}

            <Button type="submit" size="lg" className="auth-submit" style={{ width: '100%' }} loading={loading}>
              {t(activeRole.submitLabel)}
            </Button>
          </div>

          <div className="auth-demo-note">
            <b>{t('Demo environment enabled')}</b>
            <span>{t('Use the provided demo credentials for role-based preview.')}</span>
          </div>

          <div className="auth-trust">
            {['Secure access', 'Role-based permissions', 'Encrypted data flow', 'Arabic/English support'].map(item => (
              <span key={item}><ShieldCheck size={13} />{t(item)}</span>
            ))}
          </div>
        </form>
      </section>
    </div>
  );
}
