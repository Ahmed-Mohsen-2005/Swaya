import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, BarChart3, HeartPulse } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { LiveLineChart, StudentsBarChart } from '../../components/charts/SimpleCharts';
import { students } from '../../data/mockData';
import { useI18n } from '../../i18n';
import { shortDisplayName } from '../../utils/localization';
import { MetricCard } from '../../components/ui/MetricCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { StatusBadge } from '../../components/ui/StatusBadge';

const trendData = [0, 1, 2, 3, 4, 5, 6, 7].map((_, index) => ({
  time: `D${index + 1}`,
  attention: 60 + index * 2,
  engagement: 56 + index * 3,
  stress: 56 - index * 2,
}));

const avg = values => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

export default function DoctorAnalytics() {
  const { t, language } = useI18n();
  const [filter, setFilter] = useState('stress');
  const assigned = students.filter(student => student.doctorIds.length);
  const comparison = assigned.map(student => ({ name: shortDisplayName(student, language), ...student.baselineMetrics }));
  const interventionCases = assigned.filter(student => student.baselineMetrics.stress >= 45 || student.baselineMetrics.attention < 60).length;

  const filteredTrend = useMemo(() => {
    if (filter === 'attention') return trendData.map(item => ({ ...item, attention: item.attention + 5 }));
    if (filter === 'response') return trendData.map(item => ({ ...item, stress: Math.max(20, item.stress - 6), engagement: item.engagement + 4 }));
    return trendData;
  }, [filter]);

  return (
    <div className="grid doctor-module-page">
      <div className="grid grid-4 doctor-summary-metrics">
        <MetricCard icon={<BarChart3/>} label="Avg Attention" value={`${avg(assigned.map(item => item.baselineMetrics.attention))}%`} status="stable"/>
        <MetricCard icon={<Activity/>} label="Avg Engagement" value={`${avg(assigned.map(item => item.baselineMetrics.engagement))}%`} status="improving" color="green"/>
        <MetricCard icon={<HeartPulse/>} label="Avg Stress" value={`${avg(assigned.map(item => item.baselineMetrics.stress))}%`} status="Need Review" color="orange"/>
        <MetricCard icon={<AlertTriangle/>} label="Cases needing intervention" value={interventionCases} status={interventionCases ? 'Needs follow-up' : 'All clear'} color={interventionCases ? 'orange' : 'green'}/>
      </div>

      <Card>
        <div className="parent-page-head">
          <div>
            <h2>{t('Patient Analytics')}</h2>
            <p className="small muted">{t('Clinical patterns across attention, engagement, stress, and intervention response.')}</p>
          </div>
          <div className="filters">
            {[
              ['stress', 'Stress'],
              ['attention', 'Attention'],
              ['response', 'Intervention Response'],
            ].map(([id, label]) => <button key={id} className={`pill ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>{t(label)}</button>)}
          </div>
        </div>
      </Card>

      <div className="grid grid-2 doctor-analytics-grid">
        <ChartCard title="Behavior Pattern Trend" subtitle="Clinical behavior pattern view">
          <LiveLineChart data={filteredTrend} />
        </ChartCard>
        <ChartCard title="Assigned Patient Comparison" subtitle="Attention, engagement, and stress by patient">
          <StudentsBarChart data={comparison} />
        </ChartCard>
      </div>

      <div className="grid grid-3">
        <Card className="doctor-insight-card">
          <StatusBadge status="stable">Success</StatusBadge>
          <h3>{t('Stress decreased after calm mode')}</h3>
          <p>{t('Stress decreased for two cases after activating calm mode.')}</p>
        </Card>
        <Card className="doctor-insight-card warning">
          <StatusBadge status="warning">Need Review</StatusBadge>
          <h3>{t('Intervention plan review')}</h3>
          <p>{t('One case needs intervention plan review.')}</p>
        </Card>
        <Card className="doctor-insight-card">
          <StatusBadge status="info">Info</StatusBadge>
          <h3>{t('Risk distribution')}</h3>
          <div className="doctor-risk-summary">
            <span>{t('Stable')}: {assigned.filter(item => item.status === 'stable').length}</span>
            <span>{t('Need Follow-up')}: {assigned.filter(item => item.status !== 'stable').length}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
