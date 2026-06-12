import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, ClipboardList, FileText, HeartPulse, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { useI18n } from '../../i18n';
import { PageHeader } from '../../components/ui/PageHeader';
import { dashboardService } from '../../services/dashboardService';
import { LoadingState } from '../../components/ui/StateViews';
import { LiveLineChart } from '../../components/charts/SimpleCharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { relativeTime } from '../../utils/dashboardData';

export default function DoctorDashboard() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  useEffect(() => { dashboardService.getDoctorDashboard(user.id).then(setDashboard); }, [user.id]);
  if (!dashboard) return <LoadingState/>;
  const { metrics, clinicalQueue, notes = [], analytics, reports } = dashboard;
  const recentNotes = [
    { author: 'Mona Hassan', student: 'Abdullah Ali', createdAt: '2026-05-25T09:10:00Z', content: 'Abdullah responded well after calm mode was activated.', href: '/doctor/patients/stu_001' },
    { author: 'Mona Hassan', student: 'Noor A.', createdAt: '2026-05-21T10:00:00Z', content: 'Noor loses attention after long verbal instructions.', href: '/doctor/patients/stu_006' },
  ];

  return (
    <div className="grid">
      <PageHeader title="Clinical Review Center" subtitle="Review assigned patients, analyze behavioral patterns, and update therapy plans using classroom evidence." meta={{label:'Last updated', value:relativeTime(dashboard.loadedAt)}}/>
      <div className="grid grid-4">
        <MetricCard icon={<Users/>} label="Assigned Patients" value={metrics.assignedPatients} status="active"/>
        <MetricCard icon={<AlertTriangle/>} label="Need Review" value={metrics.needReview} color="orange" status="today"/>
        <MetricCard icon={<HeartPulse/>} label="Active Plans" value={metrics.activePlans} color="green" status={`${metrics.plansNeedUpdate} need update`}/>
        <MetricCard icon={<ClipboardList/>} label="Reports" value={metrics.reports} status="this week"/>
      </div>
      <div className="grid dashboard-main-grid">
        <Card className="priority-card clinical-queue">
          <div className="section-title"><div><h2>{t('Patients Needing Review')}</h2><p className="small muted">{t('Clinical review queue sorted by risk')}</p></div><Link className="analytics-link" to="/doctor/patients">{t('View patients')}</Link></div>
          <div className="priority-list">
            {clinicalQueue.map(patient => (
              <Link className="priority-row" to={`/doctor/patients/${patient.id}`} key={patient.id}>
                <div className="priority-person"><span className="avatar">{patient.shortName?.[0]}</span><div><b>{patient.fullName}</b><p>{patient.classification} · {patient.autismLevel}</p></div></div>
                <span className={`badge ${patient.risk.level === 'High Risk' ? 'red' : 'orange'}`}>{t(patient.risk.level)}</span>
                <div className="priority-metrics"><span>{t(patient.reason)}</span><span><Activity size={13}/>{patient.baselineMetrics.attention}%</span><span><HeartPulse size={13}/>{patient.baselineMetrics.stress}%</span></div>
                <span className="priority-time">{t(patient.lastSessionLabel)}</span><span className="priority-action">{t('Review Patient')}</span>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <div className="section-title"><h2>{t('Recent Teacher Notes')}</h2><Link className="analytics-link" to="/doctor/timeline">{t('Open timeline')}</Link></div>
          <div className="grid">
            {recentNotes.map(note => <Link to={note.href} className="clinical-note" key={note.content}><div><b>{note.student}</b><span>{note.author} · {t(relativeTime(note.createdAt))}</span></div><p>{note.content}</p><span>{t('Open note')}</span></Link>)}
          </div>
        </Card>
      </div>
      <div className="grid grid-2">
        <ChartCard title="Patient Analytics" subtitle="Behavior trends and intervention response" actions={<Link className="analytics-link" to="/doctor/analytics">{t('View analytics')}</Link>}><LiveLineChart data={analytics.week}/></ChartCard>
        <Card><div className="section-title"><h2>{t('Therapy Plan Context')}</h2><Link className="analytics-link" to="/doctor/therapy-plans">{t('Therapy Plans')}</Link></div><div className="grid grid-2"><div className="student-card"><b>{t('Plans needing update')}</b><p className="muted">{metrics.plansNeedUpdate}</p></div><div className="student-card"><b>{t('Recent recommendations')}</b><p className="muted">{metrics.recommendations}</p></div><div className="student-card"><b>{t('Published reports')}</b><p className="muted">{reports.filter(r=>r.status==='published').length}</p></div><div className="student-card"><b>{t('Draft reports')}</b><p className="muted">{reports.filter(r=>r.status!=='published').length}</p></div></div></Card>
      </div>
    </div>
  );
}
