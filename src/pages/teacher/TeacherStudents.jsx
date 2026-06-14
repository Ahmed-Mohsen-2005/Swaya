import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, HeartPulse, ShieldAlert, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { teacherService } from '../../services/teacherService';
import { useI18n } from '../../i18n';
import { LoadingState, EmptyState } from '../../components/ui/StateViews';
import { MetricCard } from '../../components/ui/MetricCard';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { SearchInput } from '../../components/ui/SearchInput';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { displayName, initialsForEntity } from '../../utils/localization';

export default function TeacherStudents() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teacherService.getStudentsPage(user.id).then(data => {
      if (cancelled) return;
      setPage(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const filteredStudents = useMemo(() => {
    if (!page) return [];
    return page.students.filter(student => {
      const matchesFilter = filter === 'all' || (filter === 'asd' ? student.classification === 'ASD' : student.classification === 'Typical');
      const haystack = `${student.fullName} ${displayName(student, 'ar')} ${student.shortName} ${student.statusLabel} ${student.classification} ${student.autismLevel}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [page, filter, query]);

  if (loading && !page) return <LoadingState />;
  if (!page) return <EmptyState title="No data yet" description="Content will appear here when available." />;

  return (
    <div className="grid teacher-module-page">
      <PageHeader
        title="Assigned Students"
        subtitle="Monitor student attention, engagement, stress, and follow-up needs from one workspace."
        meta={{ label: 'Pages', value: `${filteredStudents.length}/${page.students.length}` }}
      />

      <div className="grid grid-4">
        {page.summary.map(item => (
          <MetricCard
            key={item.label}
            icon={item.label === 'Total students' ? <Users /> : item.label === 'Need attention' ? <ShieldAlert /> : item.label === 'ASD students' ? <HeartPulse /> : <Activity />}
            label={item.label}
            value={item.value}
            trend={item.trend}
            color={item.label === 'Need attention' ? 'orange' : 'blue'}
          />
        ))}
      </div>

      <section className="card teacher-students-shell">
        <div className="teacher-section-head">
          <div>
            <h2>{t('Assigned Students')}</h2>
            <p className="small muted">{t('Live classroom monitoring and student support workflows.')}</p>
          </div>
          <div className="teacher-section-actions">
            <FilterTabs items={[['all', 'All'], ['asd', 'ASD'], ['typical', 'Typical']]} active={filter} onChange={setFilter} />
            <SearchInput value={query} onChange={event => setQuery(event.target.value)} placeholder="Search students, sessions, reports..." className="teacher-inline-search" />
          </div>
        </div>

        {filteredStudents.length ? (
          <div className="teacher-student-grid">
            {filteredStudents.map(student => (
              <Link to={`/teacher/students/${student.id}`} className="teacher-student-monitor-card" key={student.id}>
                <div className="teacher-student-card-head">
                  <span className="avatar teacher-avatar">{initialsForEntity(student, language)}</span>
                  <div>
                    <h3>{displayName(student, language)}</h3>
                    <p>{student.classification === 'ASD' ? `${t('ASD')} · ${t(student.autismLevel)}` : `${t('Typical')} · ${t('Not applicable')}`}</p>
                  </div>
                  <StatusBadge status={student.statusTone}>{student.statusLabel}</StatusBadge>
                </div>

                <div className="teacher-student-card-metrics">
                  <div className="teacher-inline-metric"><span>{t('Attention')}</span><b>{student.metrics.attention}%</b></div>
                  <div className="teacher-inline-metric"><span>{t('Engagement')}</span><b>{student.metrics.engagement}%</b></div>
                  <div className="teacher-inline-metric"><span>{t('Stress')}</span><b>{student.metrics.stress}%</b></div>
                </div>

                <div className="teacher-student-card-foot">
                  <span>{t('Last session')}: {t(student.lastSessionLabel)}</span>
                  <span className="teacher-link-chip">{t('View Profile')}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No results found" description="Try a different filter or search query." />
        )}
      </section>
    </div>
  );
}
