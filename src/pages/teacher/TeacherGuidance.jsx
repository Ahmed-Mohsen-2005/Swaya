import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { teacherService } from '../../services/teacherService';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState, EmptyState } from '../../components/ui/StateViews';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';

export default function TeacherGuidance() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teacherService.getGuidancePage(user.id).then(data => {
      if (cancelled) return;
      setPage(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (loading && !page) return <LoadingState />;
  if (!page) return <EmptyState title="No data yet" description="Content will appear here when available." />;

  return (
    <div className="grid teacher-module-page">
      <PageHeader title="Guidance" subtitle={page.insight.description} badge={page.insight.title} />
      <div className="grid grid-2">
        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t(page.insight.title)}</h2>
              <p className="small muted">{t('Guidance for teachers and parents')}</p>
            </div>
            <StatusBadge status={page.insight.tone}>{page.activeAlerts.length ? 'Needs follow-up' : 'Stable class'}</StatusBadge>
          </div>
          <div className="teacher-card-stack">
            {page.insight.actions.map(item => (
              <div className="teacher-list-row emphasis" key={item}>
                <div>
                  <strong>{t(item)}</strong>
                </div>
                <ShieldCheck size={16} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Recommendations')}</h2>
              <p className="small muted">{t('Intervention recommendations and follow-up')}</p>
            </div>
          </div>
          <div className="teacher-recommendation-grid">
            {page.classGuidance.length ? page.classGuidance.map(item => (
              <div key={item.id} className="teacher-recommendation-card">
                <StatusBadge status="blue">{item.category}</StatusBadge>
                <h3>{t(item.title)}</h3>
                <p>{t(item.description)}</p>
                <span>{item.student}</span>
              </div>
            )) : <EmptyState title="No data yet" description="Recommendations will appear here when available." />}
          </div>
        </Card>
      </div>
    </div>
  );
}
