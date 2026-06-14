import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, HeartPulse, Smile, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { teacherService } from '../../services/teacherService';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState, EmptyState } from '../../components/ui/StateViews';
import { MetricCard } from '../../components/ui/MetricCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { LiveLineChart } from '../../components/charts/SimpleCharts';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';
import { displayName } from '../../utils/localization';

export default function TeacherStudentProfile() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const { studentId } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teacherService.getStudentProfile(user.id, studentId).then(data => {
      if (cancelled) return;
      setPage(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id, studentId]);

  if (loading && !page) return <LoadingState />;
  if (!page?.student) return <EmptyState title="No results found" description="Student details could not be loaded." />;

  const { student, classRoom, sessions, alerts, notes, recommendations, trend } = page;
  const sessionColumns = [
    { key: 'title', header: 'Session', render: item => <Link to={`/teacher/sessions/${item.id}`}><b>{t(item.title)}</b></Link> },
    { key: 'dateLabel', header: 'Date' },
    { key: 'durationLabel', header: 'Duration' },
    { key: 'statusLabel', header: 'Status', render: item => <StatusBadge status={item.statusTone}>{item.statusLabel}</StatusBadge> },
  ];

  return (
    <div className="grid teacher-module-page">
      <PageHeader
        title={displayName(student, language)}
        subtitle={`${student.classification === 'ASD' ? `${t('ASD')} · ${t(student.autismLevel)}` : `${t('Typical')} · ${t('Not applicable')}`} · ${t(classRoom?.name || 'Inclusive Class A')}`}
        meta={{ label: 'Support level', value: student.statusLabel }}
        badge={student.activeAlertsCount ? `${student.activeAlertsCount} ${t('Recent alerts')}` : t('Stable class')}
      />

      <div className="grid grid-4">
        <MetricCard icon={<Eye />} label="Attention" value={`${student.metrics.attention}%`} status="latest" />
        <MetricCard icon={<Smile />} label="Engagement" value={`${student.metrics.engagement}%`} color="green" status="latest" />
        <MetricCard icon={<HeartPulse />} label="Stress" value={`${student.metrics.stress}%`} color={student.metrics.stress >= 45 ? 'orange' : 'green'} status={student.metrics.stress >= 45 ? 'Elevated stress' : 'Low stress'} />
        <MetricCard icon={<Users />} label="Social Interaction" value={`${student.metrics.socialInteraction}%`} color="blue" status="latest" />
      </div>

      <div className="grid grid-2 teacher-profile-layout">
        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Student overview')}</h2>
              <p className="small muted">{t('Class monitoring workspace')}</p>
            </div>
            <StatusBadge status={student.statusTone}>{student.statusLabel}</StatusBadge>
          </div>
          <div className="teacher-profile-facts">
            <div className="teacher-inline-metric"><span>{t('Role')}</span><b>{t('teacher')}</b></div>
            <div className="teacher-inline-metric"><span>{t('Class')}</span><b>{t(classRoom?.name || 'Inclusive Class A')}</b></div>
            <div className="teacher-inline-metric"><span>{t('Assigned Students')}</span><b>{classRoom?.studentIds?.length || 0}</b></div>
            <div className="teacher-inline-metric"><span>{t('Current status')}</span><b>{t(student.statusLabel)}</b></div>
          </div>
          <div className="teacher-card-stack">
            <div className="teacher-surface-list">
              <b>{t('Recent alerts')}</b>
              {alerts.length ? alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="teacher-list-row">
                  <div>
                    <strong>{t(alert.message)}</strong>
                    <span>{alert.createdAt.slice(0, 10)}</span>
                  </div>
                  <StatusBadge status={alert.severity}>{alert.severity}</StatusBadge>
                </div>
              )) : <p className="small muted">{t('No active alerts. Class status is stable.')}</p>}
            </div>
          </div>
        </Card>

        <ChartCard title="Behavior Trends" subtitle="Recent attention, engagement, and stress">
          <LiveLineChart data={trend} />
        </ChartCard>
      </div>

      <div className="grid grid-2">
        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Recent Sessions')}</h2>
              <p className="small muted">{t('Class session history')}</p>
            </div>
          </div>
          <DataTable columns={sessionColumns} rows={sessions} emptyTitle="No recent session" emptyDescription="No sessions are linked to this student yet." />
        </Card>

        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Teacher Notes')}</h2>
              <p className="small muted">{t('Session and student observations')}</p>
            </div>
            <Link className="analytics-link" to="/teacher/notes">{t('Open note')}</Link>
          </div>
          <div className="teacher-card-stack">
            {notes.length ? notes.map(note => (
              <div key={note.id} className="teacher-note-card">
                <div className="teacher-note-card-head">
                  <div className="teacher-note-badges">
                    <StatusBadge status={note.severityTone}>{note.severity}</StatusBadge>
                    <StatusBadge status="blue">{note.category}</StatusBadge>
                  </div>
                  <span>{t(note.timestampLabel)}</span>
                </div>
                <p>{t(note.content)}</p>
              </div>
            )) : <EmptyState title="No data yet" description="Notes will appear here when available." />}
          </div>
        </Card>
      </div>

      <Card>
        <div className="teacher-section-head compact">
          <div>
            <h2>{t('Recommendations')}</h2>
            <p className="small muted">{t('Guidance for teachers and parents')}</p>
          </div>
        </div>
        <div className="teacher-recommendation-grid">
          {recommendations.length ? recommendations.map(rec => (
            <div key={rec.id} className="teacher-recommendation-card">
              <StatusBadge status="blue">{rec.statusLabel}</StatusBadge>
              <h3>{t(rec.title)}</h3>
              <p>{t(rec.description)}</p>
            </div>
          )) : <EmptyState title="No data yet" description="Recommendations will appear here when available." />}
        </div>
      </Card>
    </div>
  );
}
