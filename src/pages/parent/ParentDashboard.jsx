import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Heart, Shield, Smile, ThumbsUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLiveSessionStore } from '../../store/liveSessionStore';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { Button } from '../../components/ui/Button';
import { LiveLineChart } from '../../components/charts/SimpleCharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { generalState } from '../../utils/formatters';
import { useI18n } from '../../i18n';
import { PageHeader } from '../../components/ui/PageHeader';
import { dashboardService } from '../../services/dashboardService';
import { LoadingState } from '../../components/ui/StateViews';
import { relativeTime } from '../../utils/dashboardData';

const trend = [0, 1, 2, 3, 4, 5, 6].map((_, i) => ({ time: `09:${String(i * 5).padStart(2, '0')}`, attention: 62 + i * 3, engagement: 54 + i * 3, stress: 35 + Math.sin(i) * 6, socialInteraction: 50 + i * 2 }));

export default function ParentDashboard() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const live = useLiveSessionStore();
  const [dashboard, setDashboard] = useState(null);
  const liveChildMetrics = dashboard?.child ? live.currentStudentMetrics[dashboard.child.id] : null;
  useEffect(() => { dashboardService.getParentDashboard(user.id, live.status, liveChildMetrics).then(setDashboard); }, [user.id, live.status, liveChildMetrics]);
  if (!dashboard) return <LoadingState/>;
  const { child, recommendations, metrics, summary, loadedAt } = dashboard;
  const state = live.status === 'active' ? generalState(metrics) : 'Calm';

  return (
    <div className="grid">
      <PageHeader title="Parent overview" subtitle={`${child.shortName} ${t('is being monitored with supportive classroom insights.')}`} meta={{label:'Last updated', value:relativeTime(loadedAt)}}/>
      <div className="grid parent-overview-grid">
        <Card className="child-profile-card">
          <div className="priority-person"><div className="avatar avatar-lg">{child.shortName?.[0]}</div><div><h2>{child.fullName}</h2><p>{t('Inclusive Class A')}</p></div></div>
          <div className="parent-safe-details">
            <span>{t('Support level')}: <b>{t(summary.supportLevel)}</b></span>
            <span>{t('Current status')}: <b>{t(state)}</b></span>
            <span>{t('Last updated')}: <b>{t(relativeTime(loadedAt))}</b></span>
          </div>
        </Card>
        <Card className="glass"><div className="section-title"><h2>{t('Class status')}</h2><span className="badge green">{t(summary.currentState)}</span></div><h2 className="parent-status-line">{child.shortName} {t('is currently')} {t(state).toLowerCase()}.</h2><p className="muted"><Shield size={14}/> {t('Teacher monitoring is active when sessions run.')}</p></Card>
        <Card><h2 style={{ marginTop: 0 }}>{t('Live Support')}</h2><div className="live-support-visual"><div className="robot-face status-pulse"/><div><b>{t(summary.friendlyStress)}</b><p className="muted">{t('Safe and supported')}</p></div></div></Card>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <ChartCard title={`${child.shortName}'s Progress`} subtitle="Friendly trend view for today" actions={<><button className="pill active">{t('Today')}</button><Link className="analytics-link" to="/parent/progress">{t('View progress')}</Link></>}><LiveLineChart data={trend}/></ChartCard>
        <Card><h2 style={{ marginTop: 0 }}>{t("Today's Summary")}</h2>{[['Current status', state], ['Engagement', summary.friendlyEngagement], ['Stress', summary.friendlyStress], ['Support Received', 'Calm mode activated'], ['Alerts', 'None']].map(([a, b]) => <div className="summary-row" key={a}><b>{t(a)}</b><p className="muted">{t(b)}</p></div>)}</Card>
      </div>
      <div className="grid grid-4"><MetricCard icon={<Smile/>} label="Attention" value={`${metrics.attention}%`} status="weekly"/><MetricCard icon={<ThumbsUp/>} label="Engagement" value={`${metrics.engagement}%`} color="green" status={summary.friendlyEngagement}/><MetricCard icon={<Heart/>} label="Stress" value={`${metrics.stress}%`} color={metrics.stress < 45 ? 'green' : 'orange'} status={summary.friendlyStress}/><MetricCard icon={<CheckCircle2/>} label="Social" value={`${metrics.socialInteraction}%`} color="purple" status="improving"/></div>
      <div className="grid grid-3">
        <Card><h2 style={{ marginTop: 0 }}>{t('Home Recommendations')}</h2>{recommendations.map(r => <div className="student-card" key={r.id}><b>{r.title}</b><p className="muted">{r.simplifiedDescription}</p></div>)}<Link to="/parent/recommendations"><Button variant="outline" style={{ width: '100%' }}>{t('View Recommendations')}</Button></Link></Card>
        <Card><h2 style={{ marginTop: 0 }}>{t('Teacher Note')}</h2><p>{child.shortName} responded well after calm mode was activated and participated more actively.</p><p className="small muted">Mona Hassan, Teacher</p></Card>
        <Card><h2 style={{ marginTop: 0 }}>{t('Upcoming Session')}</h2><p><Calendar size={16}/> {t('Tomorrow, May 27')}<br/>09:00 AM - 09:40 AM<br/>{t('Inclusive Class A')}</p></Card>
      </div>
    </div>
  );
}
