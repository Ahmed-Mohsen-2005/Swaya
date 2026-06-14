import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, HeartPulse, ShieldCheck, Users } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';
import { displayName, formatStatus, initialsForEntity } from '../../utils/localization';
import { MetricCard } from '../../components/ui/MetricCard';
import { riskForStudent } from '../../utils/dashboardData';

export default function DoctorPatients() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dataService.getPatientsForDoctor(user.id).then(setPatients);
    dataService.getAlerts().then(setAlerts);
  }, [user.id]);

  useEffect(() => {
    Promise.all(patients.map(patient => dataService.getTherapyPlan(patient.id))).then(items => setPlans(items.filter(Boolean)));
  }, [patients]);

  const enriched = useMemo(() => patients.map(patient => ({ ...patient, risk: riskForStudent(patient, alerts), plan: plans.find(plan => plan.studentId === patient.id) })), [patients, alerts, plans]);
  const filtered = enriched.filter(patient => {
    if (filter === 'high') return patient.risk.level === 'High Risk';
    if (filter === 'moderate_asd') return patient.classification === 'ASD' && patient.autismLevel === 'moderate';
    if (filter === 'stable') return patient.status === 'stable';
    return true;
  });
  const highRisk = enriched.filter(patient => patient.risk.level === 'High Risk').length;
  const followUp = enriched.filter(patient => patient.status !== 'stable' || patient.risk.score > 0).length;

  return (
    <div className="grid doctor-module-page">
      <div className="grid grid-4 doctor-summary-metrics">
        <MetricCard icon={<Users/>} label="Total patients" value={patients.length} status="active"/>
        <MetricCard icon={<AlertTriangle/>} label="High risk cases" value={highRisk} status={highRisk ? 'High risk' : 'Stable'} color={highRisk ? 'red' : 'green'}/>
        <MetricCard icon={<HeartPulse/>} label="Need follow-up" value={followUp} status={followUp ? 'Needs follow-up' : 'All clear'} color={followUp ? 'orange' : 'green'}/>
        <MetricCard icon={<ShieldCheck/>} label="Active Plans" value={plans.length} status="active" color="green"/>
      </div>

      <Card>
        <div className="parent-page-head">
          <div>
            <h2>{t('Assigned Patients')}</h2>
            <p className="small muted">{t('Clinical patient cards with risk, metrics, and therapy plan status.')}</p>
          </div>
          <div className="filters parent-filters">
            {[
              ['all', 'All'],
              ['high', 'High Risk'],
              ['moderate_asd', 'ASD Moderate'],
              ['stable', 'Stable'],
            ].map(([id, label]) => <button key={id} className={`pill ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>{t(label)}</button>)}
          </div>
        </div>

        <div className="doctor-patient-grid">
          {filtered.map(patient => (
            <Link to={`/doctor/patients/${patient.id}`} className="doctor-patient-card" key={patient.id}>
              <div className="parent-card-title-row">
                <div className="priority-person">
                  <span className="avatar">{initialsForEntity(patient, language)}</span>
                  <div>
                    <h3>{displayName(patient, language)}</h3>
                    <p>{t(patient.classification)} · {patient.autismLevel === 'not_applicable' ? t('Not applicable') : t(patient.autismLevel)}</p>
                  </div>
                </div>
                <StatusBadge status={patient.risk.level === 'High Risk' ? 'critical' : patient.risk.score ? 'warning' : 'stable'}>{patient.risk.level}</StatusBadge>
              </div>
              <div className="parent-mini-indicators">
                <span><Activity size={13}/>{t('Attention')} {patient.baselineMetrics.attention}%</span>
                <span><Activity size={13}/>{t('Engagement')} {patient.baselineMetrics.engagement}%</span>
                <span><HeartPulse size={13}/>{t('Stress')} {patient.baselineMetrics.stress}%</span>
              </div>
              <div className="doctor-card-footer">
                <span>{t('Last session')}: {t('Last session: 25 min ago')}</span>
                <span>{t('Therapy Plan')}: {formatStatus(patient.plan?.status || 'draft', language)}</span>
                <b>{t(patient.risk.score ? 'Review Patient' : 'View Profile')}</b>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
