import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardList, HeartPulse, Save, Target, TrendingUp } from 'lucide-react';
import { therapyPlans, students, recommendations } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';
import { displayName, formatCategory, formatStatus } from '../../utils/localization';
import { MetricCard } from '../../components/ui/MetricCard';

function formatDate(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

export default function DoctorTherapyPlans() {
  const { t, language } = useI18n();
  const { studentId } = useParams();
  const visiblePlans = studentId ? therapyPlans.filter(plan => plan.studentId === studentId) : therapyPlans;
  const [savedPlanId, setSavedPlanId] = useState('');
  const [error, setError] = useState('');

  const goalsInProgress = useMemo(() => visiblePlans.reduce((sum, plan) => sum + plan.goals.filter(goal => goal.progress < 75).length, 0), [visiblePlans]);
  const needUpdate = visiblePlans.filter(plan => plan.goals.some(goal => goal.progress < 50)).length;

  const onSave = plan => {
    if (!plan.goals.length) {
      setError(t('Please add at least one therapy goal.'));
      return;
    }
    setError('');
    setSavedPlanId(plan.id);
  };

  return (
    <div className="grid doctor-module-page">
      <div className="grid grid-4 doctor-summary-metrics">
        <MetricCard icon={<HeartPulse/>} label="Active Plans" value={visiblePlans.length} status="active" color="green"/>
        <MetricCard icon={<TrendingUp/>} label="Need update" value={needUpdate} status={needUpdate ? 'Need Review' : 'All clear'} color={needUpdate ? 'orange' : 'green'}/>
        <MetricCard icon={<ClipboardList/>} label="Recent recommendations" value={recommendations.length} status="this week"/>
        <MetricCard icon={<Target/>} label="Goals in progress" value={goalsInProgress} status="active"/>
      </div>

      <div className="doctor-plan-list">
        {visiblePlans.map(plan => {
          const student = students.find(item => item.id === plan.studentId);
          const patientName = displayName(student, language);
          const planNeedsUpdate = plan.goals.some(goal => goal.progress < 50);
          return (
            <Card className="doctor-plan-card" key={plan.id}>
              <div className="parent-page-head">
                <div>
                  <h2>{patientName} {t('Therapy Plan')}</h2>
                  <p className="small muted">{t('Last updated')}: {formatDate(plan.updatedAt, language)}</p>
                </div>
                <StatusBadge status={planNeedsUpdate ? 'warning' : 'stable'}>{planNeedsUpdate ? t('Need Review') : formatStatus(plan.status, language)}</StatusBadge>
              </div>

              <div className="doctor-plan-controls">
                <label>{t('Robot Style')}<select className="select" defaultValue={plan.robotInteractionStyle}><option value="gentle">{t('gentle')}</option><option value="balanced">{t('balanced')}</option><option value="active">{t('active')}</option></select></label>
                <label>{t('Sensory Level')}<select className="select" defaultValue={plan.sensoryLevel}><option value="low">{t('low')}</option><option value="medium">{t('medium')}</option><option value="high">{t('high')}</option></select></label>
                <label>{t('Communication style')}<select className="select" defaultValue={plan.communicationStyle}><option value="visual_support">{t('visual_support')}</option><option value="mixed">{t('mixed')}</option></select></label>
              </div>

              <div className="doctor-goal-grid">
                {plan.goals.map(goal => (
                  <div className="doctor-goal-card" key={goal.id}>
                    <div className="parent-card-title-row"><b>{t(goal.title)}</b><StatusBadge status={goal.progress < 50 ? 'warning' : 'stable'}>{formatStatus(goal.status, language)}</StatusBadge></div>
                    <p className="muted">{formatCategory(goal.category, language)} · {goal.progress}% {t('progress')}</p>
                    <div className="progress-track"><div style={{ width: `${goal.progress}%` }}/></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-2 doctor-strategy-grid">
                <div className="doctor-strategy-box"><b>{t('Classroom Strategies')}</b>{plan.classroomStrategies.map(item => <span key={item}>{t(item)}</span>)}</div>
                <div className="doctor-strategy-box"><b>{t('Home Strategies')}</b>{plan.homeStrategies.map(item => <span key={item}>{t(item)}</span>)}</div>
              </div>

              <div className="parent-action-row">
                <Button onClick={() => onSave(plan)}><Save size={14}/>{t('Save Plan')}</Button>
                <Button variant="outline" onClick={() => setSavedPlanId(plan.id)}>{t('View Details')}</Button>
                <Button variant="soft" onClick={() => setSavedPlanId(plan.id)}>{t('Update Plan')}</Button>
              </div>
              {error && <div className="auth-alert error">{error}</div>}
              {savedPlanId === plan.id && !error && <div className="auth-alert info">{t('Therapy plan saved successfully.')}</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
