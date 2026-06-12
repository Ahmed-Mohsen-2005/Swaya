import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, HeartPulse, Smile, Users } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { LiveLineChart } from '../../components/charts/SimpleCharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState } from '../../components/ui/StateViews';
import { useI18n } from '../../i18n';

const sample = [0, 1, 2, 3, 4, 5, 6].map(x => ({ time: `D${x + 1}`, attention: 60 + x * 3 + Math.random() * 8, engagement: 55 + x * 4 + Math.random() * 6, stress: 48 - x * 2 + Math.random() * 7 }));

export default function TeacherStudentProfile() {
  const { t } = useI18n();
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [notes, setNotes] = useState([]);
  const [recs, setRecs] = useState([]);
  useEffect(() => { dataService.getStudentById(studentId).then(setStudent); dataService.getNotesForStudent(studentId).then(setNotes); dataService.getRecommendations(studentId, 'teacher').then(setRecs); }, [studentId]);
  if (!student) return <LoadingState/>;

  return (
    <div className="grid">
      <PageHeader title={student.fullName} subtitle={`${student.classification} · ${student.autismLevel} · Age ${student.age}`}/>
      <div className="grid grid-4">
        <MetricCard icon={<Eye/>} label="Attention" value={`${student.baselineMetrics.attention}%`} status="latest"/>
        <MetricCard icon={<Smile/>} label="Engagement" value={`${student.baselineMetrics.engagement}%`} color="green" status="latest"/>
        <MetricCard icon={<HeartPulse/>} label="Stress" value={`${student.baselineMetrics.stress}%`} color="orange" status="latest"/>
        <MetricCard icon={<Users/>} label="Social" value={`${student.baselineMetrics.socialInteraction}%`} color="purple" status="latest"/>
      </div>
      <div className="grid grid-2">
        <ChartCard title="Behavior Trends" subtitle="Recent attention, engagement, and stress"><LiveLineChart data={sample}/></ChartCard>
        <Card>
          <h2 style={{ marginTop: 0 }}>{t('Doctor Recommendations')}</h2>
          {recs.map(r => <div className="alert-card" key={r.id}><b>{r.title}</b><p className="muted">{r.description}</p></div>)}
          <h2>{t('Teacher Notes')}</h2>
          {notes.map(n => <div className="student-card" key={n.id}>{n.content}</div>)}
        </Card>
      </div>
    </div>
  );
}
