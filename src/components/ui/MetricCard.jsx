import { Card } from './Card';
import { useI18n } from '../../i18n';
export function MetricCard({icon, label, value, trend, color='blue', status}){
  const {t}=useI18n();
  const trendText = String(trend || '').trim().toLowerCase();
  const trendClass =
    trendText.includes('critical') || trendText.includes('urgent') || trendText.includes('high risk')
      ? 'critical'
      : trendText.startsWith('-') || trendText.includes('follow-up') || trendText.includes('needs') || trendText.includes('warning') || trendText.includes('moderate risk')
        ? 'warning'
        : trendText.startsWith('+') || trendText.includes('healthy') || trendText.includes('stable') || trendText.includes('resolved') || trendText.includes('good') || trendText.includes('improving')
          ? 'positive'
          : trendText.includes('info') || trendText.includes('updated')
          ? 'info'
          : 'info';
  return <Card className={`metric-card metric-${color}`}>
    <div className="metric-head"><span className="metric-icon">{icon}</span><div><div className="small muted">{t(label)}</div>{status && <b>{t(status)}</b>}</div></div>
    <div className="metric-value-row"><div className="metric-value">{value}</div>{trend && <span className={`trend-chip ${trendClass}`}>{t(trend)}</span>}</div>
    <div className="metric-spark"><span style={{width: value && String(value).includes('%') ? value : '62%'}}/></div>
  </Card>
}
