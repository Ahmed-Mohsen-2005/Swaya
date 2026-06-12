import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LiveLineChart } from '../../components/charts/SimpleCharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState } from '../../components/ui/StateViews';
import { useI18n } from '../../i18n';

const data = [0, 1, 2, 3, 4, 5, 6, 7].map((_, i) => ({ time: `W${i + 1}`, attention: 58 + i * 2 + Math.random() * 5, engagement: 52 + i * 3 + Math.random() * 5, stress: 58 - i * 3 + Math.random() * 5 }));

export default function DoctorPatientProfile() {
  const { t } = useI18n();
  const { studentId } = useParams();
  const [s, setS] = useState(null);
  const [plan, setPlan] = useState(null);
  const [notes, setNotes] = useState([]);
  useEffect(() => { dataService.getStudentById(studentId).then(setS); dataService.getTherapyPlan(studentId).then(setPlan); dataService.getNotesForStudent(studentId).then(setNotes); }, [studentId]);
  if (!s) return <LoadingState/>;

  return (
    <div className="grid">
      <PageHeader title={s.fullName} subtitle={`Clinical profile · ${s.classification} ${s.autismLevel}`} actions={<Link to={`/doctor/therapy-plans/${s.id}`}><Button>{t('Edit Therapy Plan')}</Button></Link>}/>
      <div className="grid grid-2">
        <ChartCard title="Long-term Trends" subtitle="Clinical behavior pattern view"><LiveLineChart data={data}/></ChartCard>
        <Card>
          <h2 style={{ marginTop: 0 }}>{t('Current Therapy Goals')}</h2>
          {plan?.goals.map(g => <div className="student-card" key={g.id}><b>{g.title}</b><p className="muted">Progress: {g.progress}%</p><div className="progress-track"><div style={{ width: `${g.progress}%` }}/></div></div>)}
          <h2>{t('Notes')}</h2>
          {notes.map(n => <div className="student-card" key={n.id}>{n.content}</div>)}
        </Card>
      </div>
    </div>
  );
}
