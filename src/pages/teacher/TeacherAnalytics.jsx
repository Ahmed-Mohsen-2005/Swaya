import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, HeartPulse, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { teacherService } from '../../services/teacherService';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState, EmptyState } from '../../components/ui/StateViews';
import { MetricCard } from '../../components/ui/MetricCard';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { ChartCard } from '../../components/ui/ChartCard';
import { StudentsBarChart, LiveLineChart } from '../../components/charts/SimpleCharts';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';
import { displayName } from '../../utils/localization';

export default function TeacherAnalytics() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('week');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teacherService.getAnalyticsPage(user.id).then(data => {
      if (cancelled) return;
      setPage(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const comparisonData = useMemo(() => {
    if (!page) return [];
    if (filter === 'asd') return page.comparisonData.filter(item => page.students.find(student => student.shortName === item.name)?.classification === 'ASD');
    if (filter === 'stress') return page.comparisonData.filter(item => item.stress >= 35);
    return page.comparisonData;
  }, [page, filter]);

  const trendData = useMemo(() => {
    if (!page) return [];
    if (filter === 'week') return page.analytics.week;
    if (filter === 'stress') return page.analytics.today.map(item => ({ ...item, stress: Math.min(100, item.stress + 6) }));
    return page.analytics.today;
  }, [page, filter]);

  if (loading && !page) return <LoadingState />;
  if (!page) return <EmptyState title="No data yet" description="Content will appear here when available." />;

  return (
    <div className="grid teacher-module-page">
      <PageHeader title="Class Analytics" subtitle={page.insight} meta={{ label: 'Last updated', value: 'just now' }} />

      <div className="grid grid-4">
        {page.summary.map(item => (
          <MetricCard
            key={item.label}
            icon={item.label === 'Avg engagement' ? <Activity /> : item.label === 'Avg stress' ? <HeartPulse /> : item.label === 'Students needing support' ? <ShieldAlert /> : <BarChart3 />}
            label={item.label}
            value={item.value}
            trend={item.trend}
            color={item.label === 'Avg stress' || item.label === 'Students needing support' ? 'orange' : 'blue'}
          />
        ))}
      </div>

      <Card>
        <div className="teacher-section-head">
          <div>
            <h2>{t('Class Analytics')}</h2>
            <p className="small muted">{t(page.insight)}</p>
          </div>
          <FilterTabs items={[['week', 'This Week'], ['asd', 'ASD'], ['stress', 'High Stress']]} active={filter} onChange={setFilter} />
        </div>
      </Card>

      <div className="grid grid-2">
        <ChartCard title="Student Comparison" subtitle="Attention, engagement, and stress by student">
          <StudentsBarChart data={comparisonData} />
        </ChartCard>
        <ChartCard title="Class Trend" subtitle="Weekly monitoring pattern across the class">
          <LiveLineChart data={trendData} />
        </ChartCard>
      </div>

      <div className="grid grid-3">
        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Risk distribution')}</h2>
              <p className="small muted">{t('Clinical review queue sorted by risk')}</p>
            </div>
          </div>
          <div className="teacher-card-stack">
            {page.riskDistribution.map(item => (
              <div key={item.label} className="teacher-list-row">
                <div>
                  <strong>{t(item.label)}</strong>
                </div>
                <StatusBadge status={item.label === 'High risk' ? 'critical' : item.label === 'Needs follow-up' ? 'warning' : 'stable'}>{item.value}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Top improving students')}</h2>
              <p className="small muted">{t('Friendly trends and achievements')}</p>
            </div>
          </div>
          <div className="teacher-card-stack">
            {page.improvingStudents.map(student => (
              <div key={student.id} className="teacher-list-row">
                <div>
                  <strong>{displayName(student, language)}</strong>
                  <span>{student.metrics.engagement}% {t('Engagement')}</span>
                </div>
                <StatusBadge status="stable">{student.statusLabel}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Students needing follow-up')}</h2>
              <p className="small muted">{t('Students requiring active monitoring')}</p>
            </div>
          </div>
          <div className="teacher-card-stack">
            {page.followUpStudents.length ? page.followUpStudents.map(student => (
              <div key={student.id} className="teacher-list-row">
                <div>
                  <strong>{displayName(student, language)}</strong>
                  <span>{student.metrics.stress}% {t('Stress')}</span>
                </div>
                <StatusBadge status={student.statusTone}>{student.statusLabel}</StatusBadge>
              </div>
            )) : <EmptyState title="No data yet" description="Content will appear here when available." />}
          </div>
        </Card>
      </div>
    </div>
  );
}
