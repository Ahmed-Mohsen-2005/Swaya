import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BellRing,
  Bot,
  BrainCircuit,
  ChevronLeft,
  Languages,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import logo from '../assets/swaya-horizontal.png';
import { Button } from '../components/ui/Button';
import { useI18n } from '../i18n';

const trustBadges = [
  ['Secure by design', ShieldCheck],
  ['Role-based access', LockKeyhole],
  ['Real-time support', Activity],
  ['Arabic & English', Languages],
];

const roleCards = [
  ['Teachers', Users, 'Live monitoring and classroom alerts'],
  ['Parents', UserRound, 'Friendly progress summaries'],
  ['Doctors', Stethoscope, 'Clinical insights and therapy planning'],
];

const visualSignals = [
  ['Robot connected', Bot],
  ['Live attention', Activity],
  ['Stress support', BrainCircuit],
  ['Teacher alert', BellRing],
];

export default function Welcome() {
  const { t, isArabic, toggleLanguage, dir } = useI18n();
  const ArrowIcon = isArabic ? ChevronLeft : ArrowRight;

  const scrollToRoles = () => {
    document.getElementById('landing-roles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing-shell" dir={dir}>
      <div className="landing-frame">
        <header className="landing-header">
          <Link to="/" className="landing-brand" aria-label="SWAYA">
            <img src={logo} className="landing-logo" alt="SWAYA" />
          </Link>
          <div className="landing-header-actions">
            <button className="landing-language" onClick={toggleLanguage} type="button">
              <Languages size={16} />
              <span>{isArabic ? 'English' : 'العربية'}</span>
            </button>
            <Link to="/login" className="landing-header-link">
              <Button variant="outline" className="landing-header-cta">{t('Enter Workspace')}</Button>
            </Link>
          </div>
        </header>

        <main className="landing-main">
          <section className="landing-hero">
            <div className="landing-copy">
              <span className="landing-eyebrow">
                <Sparkles size={14} />
                {t('Inclusive AI Monitoring Platform')}
              </span>
              <h1 className="landing-title">{t('See. Understand. Support.')}</h1>
              <div className="landing-subtitle">{t('Inclusive AI Monitoring Platform')}</div>
              <p className="landing-description">
                {t('Monitor classroom behavior, understand student needs, and support inclusive education through AI, robotics, and real-time insights.')}
              </p>

              <div className="landing-actions">
                <Link to="/login" className="landing-action-link">
                  <Button size="lg" className="landing-primary-cta">
                    {t('Enter Workspace')}
                    <ArrowIcon size={17} />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="landing-secondary-cta" onClick={scrollToRoles}>
                  {t('Learn More')}
                </Button>
              </div>

              <div className="landing-trust" aria-label={t('Platform trust badges')}>
                {trustBadges.map(([label, Icon]) => (
                  <span key={label} className="landing-trust-badge">
                    <Icon size={15} />
                    {t(label)}
                  </span>
                ))}
              </div>
            </div>

            <div className="landing-visual-wrap">
              <div className="landing-robot-stage" aria-hidden="true">
                <div className="landing-robot-glow" />
                <div className="landing-robot-halo halo-outer" />
                <div className="landing-robot-halo halo-inner" />

                <div className="landing-robot">
                  <div className="landing-robot-antenna" />
                  <div className="landing-robot-head">
                    <div className="landing-robot-face">
                      <span className="landing-robot-eye" />
                      <span className="landing-robot-eye" />
                    </div>
                  </div>
                  <div className="landing-robot-neck" />
                  <div className="landing-robot-body">
                    <div className="landing-robot-core">
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className="landing-robot-arm arm-left">
                    <span className="landing-robot-joint" />
                  </div>
                  <div className="landing-robot-arm arm-right">
                    <span className="landing-robot-joint" />
                  </div>
                  <div className="landing-robot-base">
                    <span className="landing-robot-leg leg-left" />
                    <span className="landing-robot-leg leg-right" />
                  </div>
                </div>

                <div className="landing-robot-platform" />

                <div className="landing-signal-field">
                  {visualSignals.map(([label, Icon], index) => (
                    <div key={label} className={`landing-signal-chip chip-${index + 1}`}>
                      <Icon size={15} />
                      <span>{t(label)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="landing-roles-section" id="landing-roles">
            <div className="landing-roles-header">
              <span>{t('Role-based access')}</span>
              <h2>{t('Built for every support role')}</h2>
            </div>
            {roleCards.map(([title, Icon, description]) => (
              <article className="landing-role-card" key={title}>
                <span className="landing-role-icon"><Icon size={18} /></span>
                <div>
                  <h2>{t(title)}</h2>
                  <p>{t(description)}</p>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
