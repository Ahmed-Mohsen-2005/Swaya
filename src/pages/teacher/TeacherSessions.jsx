import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BarChart3, Clock3, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { teacherService } from '../../services/teacherService';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState, EmptyState } from '../../components/ui/StateViews';
import { MetricCard } from '../../components/ui/MetricCard';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SearchInput } from '../../components/ui/SearchInput';
import { useI18n } from '../../i18n';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useStudyPlanStore } from '../../store/studyPlanStore';
import { localizedValue } from '../../utils/localization';

export default function TeacherSessions() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const nav = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const { plans } = useStudyPlanStore();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teacherService.getSessionsPage(user.id).then(data => {
      if (cancelled) return;
      setPage(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const rows = useMemo(() => {
    if (!page) return [];
    return page.sessions.filter(session => {
      const matchesFilter = filter === 'all'
        || (filter === 'stress' ? session.avgStress >= 35 : session.date >= '2026-05-22');
      const haystack = `${session.title} ${session.statusLabel} ${session.dateLabel}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [page, filter, query]);

  if (loading && !page) return <LoadingState />;
  if (!page) return <EmptyState title="No data yet" description="Content will appear here when available." />;

  const columns = [
    { key: 'title', header: 'Session title', render: session => <b>{t(session.title)}</b> },
    {
      key: 'studyPlan',
      header: 'Study Plan',
      render: session => {
        const plan = plans.find(item => item.linkedSessionId === session.id);
        return plan ? <span className="study-plan-session-pill">{t('Plan used')}: {localizedValue(plan.title, language)}</span> : <span className="small muted">{t('No linked plan')}</span>;
      },
    },
    { key: 'dateTimeLabel', header: 'Date/time' },
    { key: 'durationLabel', header: 'Duration' },
    { key: 'avgAttention', header: 'Attention', render: session => `${session.avgAttention}%` },
    { key: 'avgEngagement', header: 'Engagement', render: session => `${session.avgEngagement}%` },
    { key: 'avgStress', header: 'Stress', render: session => `${session.avgStress}%` },
    { key: 'alertsCount', header: 'Alerts count', render: session => <StatusBadge status={session.alertsCount >= 3 ? 'warning' : 'stable'}>{session.alertsCount}</StatusBadge> },
    { key: 'statusLabel', header: 'Status', render: session => <StatusBadge status={session.statusTone}>{session.statusLabel}</StatusBadge> },
    {
      key: 'actions',
      header: 'Action',
      render: session => (
        <Button
          variant="outline"
          size="sm"
          onClick={event => {
            event.stopPropagation();
            nav(`/teacher/sessions/${session.id}`);
          }}
        >
          {t('View Details')}
        </Button>
      ),
    },
  ];

  return (
    <div className="grid teacher-module-page">
      <PageHeader title="Class Sessions" subtitle="Review monitored classroom sessions, attention trends, alerts, and follow-up actions." meta={{ label: 'Last updated', value: 'just now' }} />

      <div className="grid grid-4">
        {page.summary.map(item => (
          <MetricCard
            key={item.label}
            icon={item.label === 'Total sessions' ? <BarChart3 /> : item.label === 'Average duration' ? <Clock3 /> : item.label === 'Alerts this week' ? <AlertTriangle /> : <Search />}
            label={item.label}
            value={item.value}
            trend={item.trend}
            color={item.label === 'Alerts this week' ? 'orange' : 'blue'}
          />
        ))}
      </div>

      <Card>
        <div className="teacher-section-head">
          <div>
            <h2>{t('Class Sessions')}</h2>
            <p className="small muted">{t('Live classroom sessions and follow-up review')}</p>
          </div>
          <div className="teacher-section-actions">
            <FilterTabs items={[['all', 'All'], ['stress', 'High Stress'], ['week', 'This Week']]} active={filter} onChange={setFilter} />
            <SearchInput value={query} onChange={event => setQuery(event.target.value)} placeholder="Search students, sessions, reports..." className="teacher-inline-search" />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={session => nav(`/teacher/sessions/${session.id}`)}
          emptyTitle="No results found"
          emptyDescription="Try a different session filter or search query."
        />
      </Card>
    </div>
  );
}
