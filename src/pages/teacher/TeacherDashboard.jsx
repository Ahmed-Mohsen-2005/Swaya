import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, BarChart3, Eye, HeartPulse, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { MetricCard } from '../../components/ui/MetricCard';
import { StudentsBarChart } from '../../components/charts/SimpleCharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { useI18n } from '../../i18n';
import { PageHeader } from '../../components/ui/PageHeader';
import { systemChipsFromStatus } from '../../utils/dashboardData';
import { EmptyState, LoadingState } from '../../components/ui/StateViews';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { displayName, initialsForEntity } from '../../utils/localization';

export default function TeacherDashboard() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teacherService.getTeacherDashboard(user.id).then(data => {
      if (cancelled) return;
      setDashboard(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const priorityStudents = useMemo(() => dashboard?.priorityStudents.slice(0, 4) || [], [dashboard]);

  if (loading && !dashboard) return <LoadingState />;
  if (!dashboard) return <EmptyState title="No data yet" description="Content will appear here when available." />;

  const chart = dashboard.analytics[period] || [];
  const chartSubtitle = period === 'today' ? 'Live session metrics over time' : period === 'week' ? 'Weekly class averages' : 'Monthly class averages';

  return (
    <div className="grid teacher-module-page">
      <PageHeader
        title="Class monitoring workspace"
        subtitle={priorityStudents.length ? { label: '{{count}} students need attention today. Start a live session for real-time support actions.', vars: { count: priorityStudents.length } } : 'Class status is stable. Continue monitoring live classroom signals.'}
        meta={{ label: 'Last updated', value: 'just now' }}
        badge={priorityStudents.length ? { label: '{{count}} students need attention', vars: { count: priorityStudents.length } } : 'Class status is stable'}
        chips={systemChipsFromStatus(dashboard.systemStatus)}
        actions={<Link to="/teacher/live-session"><Button size="lg"><Activity size={17} />{t('Start Live Session')}</Button></Link>}
      />

      <div className="grid grid-4">
        <MetricCard icon={<Users />} label="Assigned Students" value={dashboard.metrics.assignedStudents} trend="Inclusive Class A" status="stable" />
        <MetricCard icon={<BarChart3 />} label="Avg Attention" value={`${dashboard.metrics.avgAttention}%`} trend={dashboard.metrics.attentionTrend} status="stable" />
        <MetricCard icon={<Activity />} label="Avg Engagement" value={`${dashboard.metrics.avgEngagement}%`} color="green" trend={dashboard.metrics.engagementTrend} status="improving" />
        <MetricCard icon={<AlertTriangle />} label="Recent Alerts" value={dashboard.metrics.recentAlerts} color="orange" trend={dashboard.metrics.alertTrend} status={dashboard.metrics.recentAlerts ? 'Needs follow-up' : 'No urgent action'} />
      </div>

      <div className="grid grid-2 dashboard-main-grid">
        <ChartCard
          title="Class Snapshot"
          subtitle={chartSubtitle}
          actions={
            <>
              <FilterTabs items={[['today', 'Today'], ['week', 'Week'], ['month', 'Month']]} active={period} onChange={setPeriod} />
              <Link className="analytics-link" to="/teacher/analytics">{t('View analytics')}</Link>
            </>
          }
        >
          {chart.length ? <StudentsBarChart data={chart} /> : <EmptyState title="No data yet" description="Content will appear here when available." />}
        </ChartCard>

        <Card className="priority-card">
          <div className="section-title">
            <div>
              <h2 style={{ marginTop: 0 }}>{t('Priority Students')}</h2>
              <p className="small muted">{t('Students requiring active monitoring')}</p>
            </div>
          </div>
          <div className="priority-list">
            {priorityStudents.map(student => (
              <Link to={`/teacher/students/${student.id}`} className="priority-row" key={student.id}>
                <div className="priority-person">
                  <span className="avatar">{initialsForEntity(student, language)}</span>
                  <div>
                    <b>{displayName(student, language)}</b>
                    <p>{t(student.classification)} · {student.autismLevel === 'not_applicable' ? t('Not applicable') : t(student.autismLevel)}</p>
                  </div>
                </div>
                <StatusBadge status={student.statusTone}>{student.statusLabel}</StatusBadge>
                <div className="priority-metrics">
                  <span><Eye size={13} />{student.metrics.attention}%</span>
                  <span><Activity size={13} />{student.metrics.engagement}%</span>
                  <span><HeartPulse size={13} />{student.metrics.stress}%</span>
                </div>
                <span className="priority-time">{t(student.lastSessionRelative)}</span>
                <span className="priority-action">{t('View Profile')}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
