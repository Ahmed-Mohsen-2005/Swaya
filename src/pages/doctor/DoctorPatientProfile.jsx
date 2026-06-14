import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Activity, FilePenLine, HeartPulse, Smile, Users } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LiveLineChart } from '../../components/charts/SimpleCharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState } from '../../components/ui/StateViews';
import { useI18n } from '../../i18n';
import { displayName, formatStatus } from '../../utils/localization';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';

const data = [0, 1, 2, 3, 4, 5, 6, 7].map((_, i) => ({ time: `W${i + 1}`, attention: 58 + i * 2, engagement: 52 + i * 3, stress: 58 - i * 3 }));

export default function DoctorPatientProfile() {
  const { t, language } = useI18n();
  const { studentId } = useParams();
  const [s, setS] = useState(null);
  const [plan, setPlan] = useState(null);
  const [notes, setNotes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  useEffect(() => {
    dataService.getStudentById(studentId).then(setS);
    dataService.getTherapyPlan(studentId).then(setPlan);
    dataService.getNotesForStudent(studentId).then(setNotes);
    dataService.getRecommendations(studentId).then(setRecommendations);
  }, [studentId]);
  if (!s) return <LoadingState/>;

  return (
    <div className="grid doctor-module-page">
      <PageHeader title={displayName(s, language)} subtitle={`${t('Clinical profile')} · ${t(s.classification)} ${s.autismLevel === 'not_applicable' ? t('Not applicable') : t(s.autismLevel)}`} actions={<Link to={`/doctor/therapy-plans/${s.id}`}><Button>{t('Edit Therapy Plan')}</Button></Link>}/>
      <div className="grid grid-4 doctor-summary-metrics">
        <MetricCard icon={<Activity/>} label="Attention" value={`${s.baselineMetrics.attention}%`} status="latest"/>
        <MetricCard icon={<Smile/>} label="Engagement" value={`${s.baselineMetrics.engagement}%`} status="latest" color="green"/>
        <MetricCard icon={<HeartPulse/>} label="Stress" value={`${s.baselineMetrics.stress}%`} status={s.baselineMetrics.stress >= 45 ? 'Need Review' : 'Stable'} color={s.baselineMetrics.stress >= 45 ? 'orange' : 'green'}/>
        <MetricCard icon={<Users/>} label="Social Interaction" value={`${s.baselineMetrics.socialInteraction}%`} status="latest"/>
      </div>

      <div className="grid grid-2 doctor-profile-grid">
        <ChartCard title="Long-term Trends" subtitle="Clinical behavior pattern view"><LiveLineChart data={data}/></ChartCard>
        <Card>
          <div className="parent-page-head compact"><div><h2>{t('Current Therapy Goals')}</h2><p className="small muted">{t('Therapy Plan')}: {formatStatus(plan?.status || 'draft', language)}</p></div><StatusBadge status="stable">{formatStatus(plan?.status || 'draft', language)}</StatusBadge></div>
          <div className="doctor-goal-grid single">
            {plan?.goals.map(g => <div className="doctor-goal-card" key={g.id}><b>{t(g.title)}</b><p className="muted">{t('Progress')}: {g.progress}%</p><div className="progress-track"><div style={{ width: `${g.progress}%` }} /></div></div>)}
          </div>
        </Card>
      </div>

      <div className="grid grid-3">
        <Card><div className="section-title"><h2>{t('Recent notes')}</h2><FilePenLine size={18}/></div>{notes.map(n => <div className="student-card" key={n.id}>{t(n.content)}</div>)}</Card>
        <Card><div className="section-title"><h2>{t('Recommendations')}</h2></div>{recommendations.map(rec => <div className="student-card" key={rec.id}><b>{t(rec.title)}</b><p>{t(rec.simplifiedDescription || rec.description)}</p></div>)}</Card>
        <Card><div className="section-title"><h2>{t('Timeline')}</h2></div><div className="teacher-card-stack"><div className="teacher-list-row"><span>{t('Alert: High stress during transition')}</span><StatusBadge status="warning">Warning</StatusBadge></div><div className="teacher-list-row"><span>{t('Robot action: Calm mode activated')}</span><StatusBadge status="stable">Success</StatusBadge></div></div></Card>
      </div>
    </div>
  );
}
