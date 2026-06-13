import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Bot, Eye, HeartPulse, Smile } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { teacherService } from '../../services/teacherService';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState, EmptyState } from '../../components/ui/StateViews';
import { MetricCard } from '../../components/ui/MetricCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { LiveLineChart } from '../../components/charts/SimpleCharts';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';

export default function TeacherSessionDetails() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const { sessionId } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teacherService.getSessionDetails(user.id, sessionId).then(data => {
      if (cancelled) return;
      setPage(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id, sessionId]);

  if (loading && !page) return <LoadingState />;
  if (!page) return <EmptyState title="No results found" description="Session details could not be loaded." />;

  return (
    <div className="grid teacher-module-page">
      <PageHeader
        title={page.title}
        subtitle={page.overview}
        meta={{ label: 'Date', value: page.dateLabel }}
        badge={page.statusLabel}
      />

      <div className="grid grid-4">
        <MetricCard icon={<Eye />} label="Avg Attention" value={`${page.avgAttention}%`} status="stable" />
        <MetricCard icon={<Smile />} label="Avg Engagement" value={`${page.avgEngagement}%`} color="green" status="improving" />
        <MetricCard icon={<HeartPulse />} label="Avg Stress" value={`${page.avgStress}%`} color={page.avgStress >= 35 ? 'orange' : 'green'} status={page.avgStress >= 35 ? 'Elevated stress' : 'Low stress'} />
        <MetricCard icon={<AlertTriangle />} label="Recent Alerts" value={page.alertsCount} color={page.alertsCount >= 3 ? 'orange' : 'blue'} status={page.alertsCount >= 3 ? 'Needs follow-up' : 'Stable session'} />
      </div>

      <div className="grid grid-2">
        <ChartCard title="Session Metrics" subtitle="Live attention, engagement, and stress signals">
          <LiveLineChart data={page.metricHistory} />
        </ChartCard>

        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Robot Status')}</h2>
              <p className="small muted">{t('Robot Support Actions')}</p>
            </div>
            <StatusBadge status={page.avgStress >= 35 ? 'warning' : 'stable'}>{page.statusLabel}</StatusBadge>
          </div>
          <div className="teacher-card-stack">
            {page.robotSummary.map(item => (
              <div key={item} className="teacher-list-row emphasis">
                <div>
                  <strong>{item}</strong>
                </div>
                <Bot size={16} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Session Timeline')}</h2>
              <p className="small muted">{t('Chronological behavioral events')}</p>
            </div>
          </div>
          <div className="teacher-card-stack">
            {page.timeline.map(item => (
              <div key={item.id} className="teacher-timeline-row">
                <span className={`teacher-timeline-dot ${item.tone}`} />
                <div>
                  <b>{item.title}</b>
                  <p>{item.detail}</p>
                </div>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
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
            {page.sessionNotes.length ? page.sessionNotes.map(note => (
              <div key={note.id} className="teacher-note-card">
                <div className="teacher-note-card-head">
                  <div className="teacher-note-badges">
                    <StatusBadge status={note.severityTone}>{note.severity}</StatusBadge>
                    <StatusBadge status="blue">{note.category}</StatusBadge>
                  </div>
                  <span>{note.timestampLabel}</span>
                </div>
                <p>{note.content}</p>
              </div>
            )) : <EmptyState title="No data yet" description="Notes will appear here when available." />}
          </div>
        </Card>
      </div>

      <Card>
        <div className="teacher-section-head compact">
          <div>
            <h2>{t('Alerts')}</h2>
            <p className="small muted">{t('Operational alerts and reports will appear here.')}</p>
          </div>
        </div>
        <div className="teacher-recommendation-grid">
          {page.sessionAlerts.length ? page.sessionAlerts.map(alert => (
            <div key={alert.id} className="teacher-recommendation-card">
              <StatusBadge status={alert.severity}>{alert.severity}</StatusBadge>
              <h3>{alert.studentName}</h3>
              <p>{alert.message}</p>
            </div>
          )) : <EmptyState title="No active alerts" description="No active alerts were recorded for this session." />}
        </div>
      </Card>
    </div>
  );
}
