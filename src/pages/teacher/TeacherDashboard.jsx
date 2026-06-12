import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, BarChart3, Eye, HeartPulse, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MetricCard } from '../../components/ui/MetricCard';
import { StudentsBarChart } from '../../components/charts/SimpleCharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { useI18n } from '../../i18n';
import { PageHeader } from '../../components/ui/PageHeader';
import { dashboardService } from '../../services/dashboardService';
import { relativeTime, systemChipsFromStatus } from '../../utils/dashboardData';
import { EmptyState, LoadingState } from '../../components/ui/StateViews';

export default function TeacherDashboard() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [, setClock] = useState(Date.now());
  const loadDashboard = () => {
    setLoading(true);
    dashboardService.getTeacherDashboard(user.id).then(data => { setDashboard(data); setLoading(false); });
  };
  useEffect(loadDashboard, [user.id]);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  if (loading && !dashboard) return <LoadingState/>;
  if (!dashboard) return <EmptyState title="No data yet" description="Content will appear here when available."/>;
  const { metrics, priorityStudents, analytics, systemStatus } = dashboard;
  const chart = analytics[period] || [];
  const chartSubtitle = period === 'today' ? 'Live session metrics over time' : period === 'week' ? 'Weekly class averages' : 'Monthly class averages';

  return (
    <div className="grid">
      <PageHeader
        title="Class monitoring workspace"
        subtitle={priorityStudents.length ? {label:'{{count}} students need attention today. Start a live session for real-time support actions.', vars:{count:priorityStudents.length}} : 'Class status is stable. Continue monitoring live classroom signals.'}
        meta={{ label: 'Last updated', value: relativeTime(dashboard.loadedAt) }}
        badge={{ label: '{{count}} students need attention', vars: { count: priorityStudents.length } }}
        chips={systemChipsFromStatus(systemStatus)}
        actions={<Link to="/teacher/live-session"><Button size="lg"><Activity size={17}/>{t('Start Live Session')}</Button></Link>}
      />
      <div className="grid grid-4">
        <MetricCard icon={<Users/>} label="Assigned Students" value={metrics.assignedStudents} trend="Inclusive Class A" status="active"/>
        <MetricCard icon={<BarChart3/>} label="Avg Attention" value={`${metrics.avgAttention}%`} trend={metrics.attentionTrend} status="stable"/>
        <MetricCard icon={<Activity/>} label="Avg Engagement" value={`${metrics.avgEngagement}%`} color="green" trend={metrics.engagementTrend} status="improving"/>
        <MetricCard icon={<AlertTriangle/>} label="Recent Alerts" value={metrics.recentAlerts} color="orange" trend={metrics.alertTrend} status="today"/>
      </div>
      <div className="grid grid-2 dashboard-main-grid">
        <ChartCard title="Class Snapshot" subtitle={chartSubtitle} actions={<><div className="filter-tabs chart-tabs"><button className={period==='today'?'active':''} onClick={()=>setPeriod('today')}>{t('Today')}</button><button className={period==='week'?'active':''} onClick={()=>setPeriod('week')}>{t('Week')}</button><button className={period==='month'?'active':''} onClick={()=>setPeriod('month')}>{t('Month')}</button></div><Link className="analytics-link" to="/teacher/analytics">{t('View analytics')}</Link></>}>
          {chart.length ? <StudentsBarChart data={chart}/> : <EmptyState title="No data yet" description="Content will appear here when available."/>}
        </ChartCard>
        <Card className="priority-card">
          <div className="section-title">
            <div>
              <h2 style={{ marginTop: 0 }}>{t('Priority Students')}</h2>
              <p className="small muted">{t('Students requiring active monitoring')}</p>
            </div>
          </div>
          <div className="priority-list">
            {priorityStudents.map(s => (
              <Link to={`/teacher/students/${s.id}`} className="priority-row" key={s.id}>
                <div className="priority-person">
                  <span className="avatar">{s.shortName?.slice(0, 1) || s.fullName?.slice(0, 1)}</span>
                  <div><b>{s.fullName}</b><p>{s.classification} · {s.autismLevel}</p></div>
                </div>
                <span className={`badge ${s.risk.level === 'High Risk' ? 'red' : 'orange'}`}>{t(s.risk.level)}</span>
                <div className="priority-metrics">
                  <span><Eye size={13}/>{s.baselineMetrics.attention}%</span>
                  <span><Activity size={13}/>{s.baselineMetrics.engagement}%</span>
                  <span><HeartPulse size={13}/>{t(s.risk.stressLabel)}</span>
                </div>
                <span className="priority-time">{t(s.lastSessionLabel)}</span>
                <span className="priority-action">{t('View Profile')}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
