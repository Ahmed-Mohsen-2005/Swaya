import { Activity, Camera, Cpu, Radio } from 'lucide-react';
import { useI18n } from '../../i18n';

const icons = { activity: Activity, camera: Camera, cpu: Cpu, radio: Radio };

export function PageHeader({ title, subtitle, actions, chips, meta, badge }) {
  const { t } = useI18n();
  const defaultChips = chips || [
    ['Live Monitoring', 'activity', 'online'],
    ['AI Online', 'cpu', 'online'],
    ['Robot Connected', 'radio', 'online'],
    ['Camera Active', 'camera', 'online'],
  ];

  return (
    <section className="page-hero">
      <div className="page-hero-copy">
        <div className="page-hero-meta-row">
          {meta && <span className="eyebrow-meta">{typeof meta === 'object' ? `${t(meta.label)}: ${t(meta.value)}` : t(meta)}</span>}
          {badge && <span className="hero-alert-badge">{typeof badge === 'object' ? t(badge.label, badge.vars) : t(badge)}</span>}
        </div>
        <h1>{t(title)}</h1>
        {subtitle && <p>{typeof subtitle === 'object' ? t(subtitle.label, subtitle.vars) : t(subtitle)}</p>}
        <div className="system-chips">{defaultChips.map(([label, icon, status = 'online']) => {
          const Icon = typeof icon === 'string' ? icons[icon] || Activity : icon;
          return <span className={`system-chip ${status}`} key={label}><Icon size={13}/>{t(label)}</span>;
        })}</div>
      </div>
      {actions && <div className="page-hero-actions">{actions}</div>}
    </section>
  );
}
