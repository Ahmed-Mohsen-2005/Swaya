import { useEffect, useMemo, useState } from 'react';
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
import { displayName, initialsForEntity } from '../../utils/localization';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { users } from '../../data/mockData';

const recentNotesSeed = [
  { authorId: 'user_teacher_001', studentId: 'stu_001', createdAt: '2026-05-25T09:10:00Z', content: 'Abdullah responded well after calm mode was activated.', href: '/doctor/patients/stu_001' },
  { authorId: 'user_teacher_001', studentId: 'stu_006', createdAt: '2026-05-21T10:00:00Z', content: 'Noor loses attention after long verbal instructions.', href: '/doctor/patients/stu_006' },
];

export default function DoctorDashboard() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => { dashboardService.getDoctorDashboard(user.id).then(setDashboard); }, [user.id]);

  const metrics = dashboard?.metrics || {
    assignedPatients: 0,
    needReview: 0,
    activePlans: 0,
    reports: 0,
    plansNeedUpdate: 0,
    recommendations: 0,
  };
  const clinicalQueue = dashboard?.clinicalQueue || [];
  const analytics = dashboard?.analytics || {};
  const reports = dashboard?.reports || [];
  const patients = dashboard?.patients || [];
  const patientById = new Map(patients.map(patient => [patient.id, patient]));
  const userById = new Map(users.map(item => [item.id, item]));
  const recentNotes = recentNotesSeed.map(note => ({ ...note, patient: patientById.get(note.studentId), author: userById.get(note.authorId) }));
  const pendingReports = reports.filter(report => report.status !== 'published').length;
  const stressCases = patients.filter(patient => patient.baselineMetrics.stress >= 45).length;
  const clinicalInsight = stressCases
    ? 'Review stress patterns before updating intervention plans.'
    : 'Current cases are stable. Continue monitoring classroom evidence.';

  const chartData = useMemo(() => analytics.week || [], [analytics.week]);

  if (!dashboard) return <LoadingState/>;

  return (
    <div className="grid doctor-module-page">
      <PageHeader
        title="Clinical Review Center"
        subtitle="Review assigned patients, analyze behavioral patterns, and update therapy plans using classroom evidence."
        meta={{label:'Last updated', value:relativeTime(dashboard.loadedAt)}}
        badge={clinicalInsight}
        actions={<Link to="/doctor/analytics"><Button><Activity size={16}/>{t('View Analytics')}</Button></Link>}
      />

      <div className="grid grid-4 doctor-summary-metrics">
        <MetricCard icon={<Users/>} label="Assigned Patients" value={metrics.assignedPatients} status="active"/>
        <MetricCard icon={<AlertTriangle/>} label="Need Review" value={metrics.needReview} color="orange" status="today"/>
        <MetricCard icon={<HeartPulse/>} label="Active Plans" value={metrics.activePlans} color="green" status={metrics.plansNeedUpdate ? 'Need update' : 'Stable'}/>
        <MetricCard icon={<ClipboardList/>} label="Reports This Week" value={metrics.reports} status="this week"/>
      </div>

      <div className="grid doctor-dashboard-grid">
        <Card className="priority-card clinical-queue">
          <div className="section-title"><div><h2>{t('Patients Needing Review')}</h2><p className="small muted">{t('Clinical review queue sorted by risk')}</p></div><Link className="analytics-link" to="/doctor/patients">{t('View patients')}</Link></div>
          <div className="priority-list">
            {clinicalQueue.map(patient => (
              <Link className="priority-row doctor-patient-row" to={`/doctor/patients/${patient.id}`} key={patient.id}>
                <div className="priority-person">
                  <span className="avatar">{initialsForEntity(patient, language)}</span>
                  <div><b>{displayName(patient, language)}</b><p>{t(patient.classification)} · {patient.autismLevel === 'not_applicable' ? t('Not applicable') : t(patient.autismLevel)}</p></div>
                </div>
                <StatusBadge status={patient.risk.level === 'High Risk' ? 'critical' : 'warning'}>{patient.risk.level}</StatusBadge>
                <div className="priority-metrics">
                  <span>{t(patient.reason)}</span>
                  <span><Activity size={13}/>{t('Attention')} {patient.baselineMetrics.attention}%</span>
                  <span><HeartPulse size={13}/>{t('Stress')} {patient.baselineMetrics.stress}%</span>
                </div>
                <span className="priority-time">{t(patient.lastSessionLabel)}</span>
                <span className="priority-action">{t('Review Patient')}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="section-title"><h2>{t('Recent Teacher Notes')}</h2><Link className="analytics-link" to="/doctor/timeline">{t('Open timeline')}</Link></div>
          <div className="grid">
            {recentNotes.map(note => (
              <Link to={note.href} className="clinical-note" key={note.content} onClick={() => setNotice(t('Note opened for clinical review.'))}>
                <div><b>{displayName(note.patient, language)}</b><span>{displayName(note.author, language)} · {t(relativeTime(note.createdAt))}</span></div>
                <p>{t(note.content)}</p>
                <span>{t('Open note')}</span>
              </Link>
            ))}
            {notice && <div className="auth-alert info">{notice}</div>}
          </div>
        </Card>
      </div>

      <div className="grid grid-2 doctor-dashboard-lower">
        <ChartCard title="Patient Analytics" subtitle="Behavior trends and intervention response" actions={<Link className="analytics-link" to="/doctor/analytics">{t('View analytics')}</Link>}>
          <LiveLineChart data={chartData}/>
        </ChartCard>
        <Card>
          <div className="section-title"><h2>{t('Therapy Plan Context')}</h2><Link className="analytics-link" to="/doctor/therapy-plans">{t('Therapy Plans')}</Link></div>
          <div className="doctor-context-grid">
            <div className="doctor-context-card"><b>{t('Active Plans')}</b><p>{metrics.activePlans}</p></div>
            <div className="doctor-context-card warning"><b>{t('Plans needing update')}</b><p>{metrics.plansNeedUpdate}</p></div>
            <div className="doctor-context-card"><b>{t('Recent recommendations')}</b><p>{metrics.recommendations}</p></div>
            <div className="doctor-context-card warning"><b>{t('Pending reports')}</b><p>{pendingReports}</p></div>
          </div>
          <div className="parent-action-row">
            <Link to="/doctor/therapy-plans"><Button variant="outline">{t('Therapy Plans')}</Button></Link>
            <Link to="/doctor/recommendations"><Button variant="soft">{t('View Guidance')}</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
