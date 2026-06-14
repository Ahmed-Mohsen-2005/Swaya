import { useEffect, useMemo, useState } from 'react';
import { Download, Eye, FileText, Send, Share2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { teacherService } from '../../services/teacherService';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState, EmptyState } from '../../components/ui/StateViews';
import { MetricCard } from '../../components/ui/MetricCard';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { SearchInput } from '../../components/ui/SearchInput';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useI18n } from '../../i18n';

export default function TeacherReports() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [actionNote, setActionNote] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teacherService.getReportsPage(user.id).then(data => {
      if (cancelled) return;
      setPage(data);
      setSelectedReportId(data.reports[0]?.id || '');
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const reports = useMemo(() => {
    if (!page) return [];
    return page.reports.filter(report => {
      const matchesFilter = filter === 'all' || (filter === 'session' ? report.reportTypeLabel === 'Session' : report.reportTypeLabel === 'Weekly');
      const haystack = `${report.title} ${report.summary} ${report.statusLabel} ${report.relatedLabel}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [page, filter, query]);

  useEffect(() => {
    if (!reports.length) {
      setSelectedReportId('');
      return;
    }
    if (!reports.some(report => report.id === selectedReportId)) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  const selectedReport = reports.find(report => report.id === selectedReportId) || reports[0];

  if (loading && !page) return <LoadingState />;
  if (!page) return <EmptyState title="No data yet" description="Content will appear here when available." />;

  return (
    <div className="grid teacher-module-page">
      <PageHeader title="Reports" subtitle="Review classroom reports, session exports, and pending follow-up summaries." meta={{ label: 'Last updated', value: 'just now' }} />

      <div className="grid grid-4">
        {page.summary.map(item => (
          <MetricCard key={item.label} icon={<FileText />} label={item.label} value={item.value} trend={item.trend} color={item.status === 'warning' ? 'orange' : 'blue'} />
        ))}
      </div>

      <div className="grid teacher-report-layout">
        <Card>
          <div className="teacher-section-head">
            <div>
              <h2>{t('Reports')}</h2>
              <p className="small muted">{t('Educational and session reports')}</p>
            </div>
            <div className="teacher-section-actions">
              <FilterTabs items={[['all', 'All'], ['session', 'Session'], ['weekly', 'Weekly']]} active={filter} onChange={setFilter} />
              <SearchInput value={query} onChange={event => setQuery(event.target.value)} placeholder="Search students, sessions, reports..." className="teacher-inline-search" />
            </div>
          </div>

          <div className="teacher-card-stack">
            {reports.length ? reports.map(report => (
              <div key={report.id} className={`teacher-report-card ${selectedReport?.id === report.id ? 'active' : ''}`}>
                <div className="teacher-report-card-head">
                  <div>
                    <h3>{t(report.title)}</h3>
                    <p>{t(report.relatedLabel)} · {t(report.dateLabel)}</p>
                  </div>
                  <StatusBadge status={report.statusTone}>{report.statusLabel}</StatusBadge>
                </div>
                <div className="teacher-note-badges">
                  <StatusBadge status="blue">{report.reportTypeLabel}</StatusBadge>
                </div>
                <p>{t(report.summary)}</p>
                <div className="teacher-action-row">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedReportId(report.id); setActionNote(''); }}><Eye size={14} />{t('View')}</Button>
                  <Button variant="outline" size="sm" onClick={() => setActionNote(t('Download prepared for selected report.'))}><Download size={14} />{t('Download')}</Button>
                  <Button variant="outline" size="sm" onClick={() => setActionNote(t('Share dialog opened for selected report.'))}><Share2 size={14} />{t('Share')}</Button>
                </div>
              </div>
            )) : <EmptyState title="No results found" description="Try a different report filter or search query." />}
          </div>
        </Card>

        <Card className="modal-surface">
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Report preview')}</h2>
              <p className="small muted">{selectedReport ? t(selectedReport.dateTimeLabel) : t('Select a report to review.')}</p>
            </div>
            {selectedReport && <StatusBadge status={selectedReport.statusTone}>{selectedReport.statusLabel}</StatusBadge>}
          </div>

          {selectedReport ? (
            <div className="teacher-card-stack">
              <div className="teacher-surface-list">
                <b>{t(selectedReport.title)}</b>
                <p>{t(selectedReport.summary)}</p>
              </div>
              <div className="teacher-inline-metric"><span>{t('Report type')}</span><b>{t(selectedReport.reportTypeLabel)}</b></div>
              <div className="teacher-inline-metric"><span>{t('Related class/student/session')}</span><b>{t(selectedReport.relatedLabel)}</b></div>
              <div className="teacher-inline-metric"><span>{t('Date generated')}</span><b>{t(selectedReport.dateLabel)}</b></div>
              <div className="teacher-action-row">
                <Button size="sm" onClick={() => setActionNote(t('Share dialog opened for selected report.'))}><Send size={14} />{t('Share')}</Button>
                <Button variant="outline" size="sm" onClick={() => setActionNote(t('Download prepared for selected report.'))}><Download size={14} />{t('Download')}</Button>
              </div>
              {actionNote && <div className="auth-alert info">{actionNote}</div>}
            </div>
          ) : (
            <EmptyState title="No data yet" description="Select a report to review." />
          )}
        </Card>
      </div>
    </div>
  );
}
