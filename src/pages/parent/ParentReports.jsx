import { useEffect, useMemo, useState } from 'react';
import { Download, Eye, FileText, Search, Share2 } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { MetricCard } from '../../components/ui/MetricCard';
import { SearchInput } from '../../components/ui/SearchInput';
import { useI18n } from '../../i18n';
import { displayName, formatReportType, formatStatus } from '../../utils/localization';

const reportExtras = [
  {
    id: 'parent_social_001',
    title: 'Social Interaction Report',
    reportType: 'session',
    date: '2026-05-24',
    status: 'published',
    summary: 'Abdullah shared more calmly during group work and responded well to gentle prompts.',
    positive: ['Engagement is good', 'Support received'],
    needs: ['Transitions between activities may still need short preparation.'],
    tip: 'Practice a short calming routine before homework.',
  },
  {
    id: 'parent_calm_001',
    title: 'Calming Support Summary',
    reportType: 'monthly',
    date: '2026-05-22',
    status: 'published',
    summary: 'Calming support helped Abdullah return to the activity with less stress.',
    positive: ['Stress is lower today', 'Positive week'],
    needs: ['Use a short visual cue before changing tasks.'],
    tip: 'Use the same calming phrase at home and school.',
  },
];

const statusTone = status => status === 'published' ? 'stable' : status === 'draft' ? 'gray' : 'warning';

function formatDate(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

export default function ParentReports() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const [child, setChild] = useState(null);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    dataService.getChildForParent(user.id).then(foundChild => {
      setChild(foundChild);
      if (foundChild) {
        dataService.getReportsForRole('parent', foundChild.id).then(items => {
          const enriched = [...items, ...reportExtras].map(report => ({
            ...report,
            reportTypeLabel: formatReportType(report.reportType, 'en'),
            positive: report.positive || ['Abdullah is improving steadily', 'Support received'],
            needs: report.needs || ['Transitions between activities may still need short preparation.'],
            tip: report.tip || 'Practice a short calming routine before homework.',
          }));
          setReports(enriched);
          setSelectedId(enriched[0]?.id || '');
        });
      }
    });
  }, [user.id]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesFilter = filter === 'all' || report.reportType === filter || report.reportTypeLabel.toLowerCase().includes(filter);
      const haystack = `${report.title} ${report.summary} ${report.status} ${report.reportType} ${report.reportTypeLabel}`.toLowerCase();
      return matchesFilter && (!query.trim() || haystack.includes(query.trim().toLowerCase()));
    });
  }, [reports, filter, query]);

  const selected = filteredReports.find(report => report.id === selectedId) || filteredReports[0] || reports[0];
  const childName = displayName(child, language) || t('Abdullah Ali');
  const weekReports = reports.filter(report => report.reportType === 'weekly_parent' || report.reportType === 'weekly').length;
  const needsReview = reports.filter(report => report.status !== 'published').length;

  const onAction = action => setNotice(t(action));

  return (
    <div className="grid parent-module-page">
      <div className="grid grid-4 parent-summary-metrics">
        <MetricCard icon={<FileText />} label="Available reports" value={reports.length} status="info" />
        <MetricCard icon={<FileText />} label="Reports this week" value={weekReports} status="weekly" color="blue" />
        <MetricCard icon={<FileText />} label="Latest report" value={selected ? formatDate(selected.date, language) : '-'} status="published" color="green" />
        <MetricCard icon={<FileText />} label="Needs parent review" value={needsReview} status={needsReview ? 'Needs follow-up' : 'All clear'} color={needsReview ? 'orange' : 'green'} />
      </div>

      <div className="grid parent-reports-layout">
        <Card>
          <div className="parent-page-head">
            <div>
              <h2>{t('Parent-Safe Reports')}</h2>
              <p className="small muted">{t('Clear reports that explain progress and home support steps.')}</p>
            </div>
            <SearchInput value={query} onChange={event => setQuery(event.target.value)} placeholder="Search reports..." className="parent-search" />
          </div>

          <div className="filters parent-filters">
            {[
              ['all', 'All'],
              ['weekly', 'Weekly'],
              ['monthly', 'Monthly'],
              ['session', 'Session'],
            ].map(([id, label]) => (
              <button key={id} className={`pill ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>{t(label)}</button>
            ))}
          </div>

          <div className="parent-card-list">
            {filteredReports.map(report => (
              <button key={report.id} className={`parent-report-card ${selected?.id === report.id ? 'active' : ''}`} onClick={() => { setSelectedId(report.id); setNotice(''); }}>
                <div>
                  <div className="parent-card-title-row">
                    <h3>{t(report.title)}</h3>
                    <StatusBadge status={statusTone(report.status)}>{formatStatus(report.status, language)}</StatusBadge>
                  </div>
                  <p className="muted">{t(report.summary)}</p>
                </div>
                <div className="parent-report-meta">
                  <span>{formatReportType(report.reportType, language)}</span>
                  <span>{formatDate(report.date, language)}</span>
                  <span>{childName}</span>
                </div>
                <div className="parent-action-row">
                  <Button size="sm" variant="outline" onClick={event => { event.stopPropagation(); setSelectedId(report.id); onAction('Report opened for review.'); }}><Eye size={14} />{t('View Report')}</Button>
                  <Button size="sm" variant="outline" onClick={event => { event.stopPropagation(); onAction('Report download prepared.'); }}><Download size={14} />{t('Download')}</Button>
                  <Button size="sm" variant="outline" onClick={event => { event.stopPropagation(); onAction('Share dialog opened for selected report.'); }}><Share2 size={14} />{t('Share')}</Button>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="parent-preview-panel">
          {selected ? (
            <>
              <div className="parent-page-head compact">
                <div>
                  <h2>{t(selected.title)}</h2>
                  <p className="small muted">{formatDate(selected.date, language)} · {childName}</p>
                </div>
                <StatusBadge status={statusTone(selected.status)}>{formatStatus(selected.status, language)}</StatusBadge>
              </div>
              <p className="parent-preview-summary">{t(selected.summary)}</p>
              <div className="parent-preview-section positive">
                <b>{t('Positive points')}</b>
                {selected.positive.map(item => <span key={item}>{t(item)}</span>)}
              </div>
              <div className="parent-preview-section support">
                <b>{t('Needs support')}</b>
                {selected.needs.map(item => <span key={item}>{t(item)}</span>)}
              </div>
              <div className="parent-home-tip">
                <b>{t('Home Tip')}</b>
                <p>{t(selected.tip)}</p>
              </div>
              <div className="parent-action-row">
                <Button onClick={() => onAction('Report opened for review.')}><Eye size={14} />{t('View Report')}</Button>
                <Button variant="outline" onClick={() => onAction('Report download prepared.')}><Download size={14} />{t('Download')}</Button>
              </div>
              {notice && <div className="auth-alert info">{notice}</div>}
            </>
          ) : (
            <div className="parent-empty-state">
              <Search size={24} />
              <b>{t('No results found')}</b>
              <p>{t('Try a different report filter or search query.')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
