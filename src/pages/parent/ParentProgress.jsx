import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookmarkCheck, HeartHandshake, Lightbulb, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LiveLineChart } from '../../components/charts/SimpleCharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState, EmptyState } from '../../components/ui/StateViews';
import { useAuthStore } from '../../store/authStore';
import { dataService } from '../../services/dataService';
import { relativeTime } from '../../utils/dashboardData';
import { useI18n } from '../../i18n';

const cardIcons = {
  achievements: Award,
  support: HeartHandshake,
  tip: Lightbulb,
};

export default function ParentProgress() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState('week');
  const [savedTip, setSavedTip] = useState(false);
  const [state, setState] = useState({ child: null, progress: null, loading: true });

  useEffect(() => {
    let active = true;
    setState(current => ({ ...current, loading: true }));
    dataService.getChildForParent(user.id).then(child => {
      if (!child) {
        if (active) setState({ child: null, progress: null, loading: false });
        return;
      }
      dataService.getParentProgress(child.id).then(progress => {
        if (active) setState({ child, progress, loading: false });
      });
    });
    return () => { active = false; };
  }, [user.id]);

  const selectedPeriod = state.progress?.periods?.[period];
  const summaryChips = useMemo(() => {
    if (!state.progress) return [];
    return [
      ...state.progress.statusSummary,
      { label: 'Last updated', value: relativeTime(state.progress.updatedAt), tone: 'blue' },
    ];
  }, [state.progress]);

  if (state.loading) return <LoadingState />;
  if (!state.child || !state.progress) return <EmptyState title="No data yet" description="Content will appear here when available." />;

  const { child, progress } = state;

  return (
    <div className="grid parent-progress-page">
      <PageHeader title="Child Progress" subtitle="Friendly trends and achievements" meta={{ label: 'Last updated', value: relativeTime(progress.updatedAt) }} />

      <Card className="glass parent-progress-hero">
        <div>
          <div className="eyebrow">{t('Parent progress summary')}</div>
          <h1>{t(progress.headline)}</h1>
          <p className="muted">{t(progress.subtitle)}</p>
        </div>
        <div className="parent-summary-chips">
          {summaryChips.map(chip => (
            <span className={`badge ${chip.tone}`} key={`${chip.label}-${chip.value}`}>
              {t(chip.label)}: {t(chip.value)}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid parent-progress-layout">
        <ChartCard
          title="Progress Trend"
          subtitle={selectedPeriod?.subtitle}
          actions={<FilterTabs items={[['week', 'This Week'], ['month', 'This Month']]} active={period} onChange={setPeriod} />}
        >
          <LiveLineChart data={selectedPeriod?.data || []} height={245} />
          <div className="chart-insight">
            <Sparkles size={15} />
            <span>{t(selectedPeriod?.insight)}</span>
          </div>
        </ChartCard>

        <Card className="wellbeing-card">
          <div className="section-title">
            <h2>{t('Overall Wellbeing')}</h2>
            <span className="badge green">{t(progress.wellbeing.label)}</span>
          </div>
          <div className="wellbeing-summary">
            <div className="wellbeing-donut" style={{ '--score': `${progress.wellbeing.value}%` }} aria-label={`${progress.wellbeing.value}% ${t('Wellbeing score')}`}>
              <div>
                <b>{progress.wellbeing.value}%</b>
                <span>{t('Wellbeing score')}</span>
              </div>
            </div>
            <p>{t(progress.wellbeing.explanation)}</p>
          </div>
          <div className="wellbeing-breakdown">
            {progress.wellbeing.breakdown.map(item => <span key={item}>{t(item)}</span>)}
          </div>
        </Card>
      </div>

      <div className="grid grid-3 parent-summary-card-grid">
        {progress.summaryCards.map(item => {
          const Icon = cardIcons[item.id] || BookmarkCheck;
          return (
            <Card className={`parent-action-card ${item.tone}`} key={item.id}>
              <div className="parent-action-icon"><Icon size={17} /></div>
              <div>
                <h3>{t(item.title)}</h3>
                <p>{t(item.body)}</p>
              </div>
              {item.href ? (
                <Link className="analytics-link" to={item.href}>{t(item.action)}</Link>
              ) : (
                <Button variant={savedTip ? 'green' : 'outline'} size="sm" onClick={() => setSavedTip(true)}>
                  <BookmarkCheck size={15} />
                  {t(savedTip ? 'Tip saved' : item.action)}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
