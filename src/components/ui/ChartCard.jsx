import { Card } from './Card';
import { useI18n } from '../../i18n';

export function ChartCard({ title, subtitle, actions, children }) {
  const {t}=useI18n();
  return (
    <Card className="chart-card analytics-card">
      <div className="chart-card-head">
        <div>
          <h2>{t(title)}</h2>
          {subtitle && <p className="small muted">{t(subtitle)}</p>}
        </div>
        {actions && <div className="filters">{actions}</div>}
      </div>
      {children}
    </Card>
  );
}
export const AnalyticsCard = ChartCard;
