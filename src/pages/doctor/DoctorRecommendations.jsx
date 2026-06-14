import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Edit3, Eye, Send } from 'lucide-react';
import { recommendations as baseRecommendations, students } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useI18n } from '../../i18n';
import { displayName, formatAudience, formatPriority, formatStatus } from '../../utils/localization';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function DoctorRecommendations() {
  const { t, language } = useI18n();
  const doctorPatients = students.filter(student => student.doctorIds.length);
  const [items, setItems] = useState(baseRecommendations.map(item => ({ ...item, priority: item.audience === 'teacher' ? 'High' : 'Medium' })));
  const [form, setForm] = useState({ patientId: doctorPatients[0]?.id || '', audience: 'teacher', title: '', details: '', priority: 'Medium' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const counts = useMemo(() => ({
    active: items.filter(item => item.status !== 'completed').length,
    teacher: items.filter(item => item.audience === 'teacher').length,
    parent: items.filter(item => item.audience === 'parent').length,
    follow: items.filter(item => item.priority === 'High' && item.status !== 'completed').length,
  }), [items]);

  const saveRecommendation = () => {
    if (!form.patientId || !form.title.trim() || !form.details.trim()) {
      setError(t('Please complete patient, title, and details.'));
      setNotice('');
      return;
    }
    setItems(current => [{
      id: `rec_doctor_${Date.now()}`,
      studentId: form.patientId,
      audience: form.audience,
      title: form.title,
      description: form.details,
      simplifiedDescription: form.details,
      status: 'active',
      priority: form.priority,
      reason: 'Clinical follow-up based on recent classroom evidence.',
    }, ...current]);
    setForm(current => ({ ...current, title: '', details: '' }));
    setError('');
    setNotice(t('Recommendation saved successfully.'));
  };

  const completeRecommendation = id => {
    setItems(current => current.map(item => item.id === id ? { ...item, status: 'completed' } : item));
    setNotice(t('Recommendation marked as completed.'));
    setError('');
  };

  return (
    <div className="grid doctor-module-page">
      <div className="grid grid-4 doctor-summary-metrics">
        <MetricCard icon={<ClipboardList/>} label="Active recommendations" value={counts.active} status="active"/>
        <MetricCard icon={<ClipboardList/>} label="Teacher recommendations" value={counts.teacher} status="Teacher"/>
        <MetricCard icon={<ClipboardList/>} label="Parent recommendations" value={counts.parent} status="Parent"/>
        <MetricCard icon={<ClipboardList/>} label="Needs follow-up" value={counts.follow} status={counts.follow ? 'Needs follow-up' : 'All clear'} color={counts.follow ? 'orange' : 'green'}/>
      </div>

      <div className="grid doctor-recommendations-layout">
        <Card>
          <div className="parent-page-head"><div><h2>{t('Add Recommendation')}</h2><p className="small muted">{t('Create clear guidance for teachers or parents with priority context.')}</p></div></div>
          <div className="doctor-form-grid">
            <label>{t('Patient')}<select className="select" value={form.patientId} onChange={event => setForm({...form, patientId: event.target.value})}>{doctorPatients.map(student => <option value={student.id} key={student.id}>{displayName(student, language)}</option>)}</select></label>
            <label>{t('Audience')}<select className="select" value={form.audience} onChange={event => setForm({...form, audience: event.target.value})}><option value="teacher">{formatAudience('teacher', language)}</option><option value="parent">{formatAudience('parent', language)}</option><option value="system">{formatAudience('system', language)}</option></select></label>
            <label>{t('Priority')}<select className="select" value={form.priority} onChange={event => setForm({...form, priority: event.target.value})}><option value="High">{formatPriority('High', language)}</option><option value="Medium">{formatPriority('Medium', language)}</option><option value="Low">{formatPriority('Low', language)}</option></select></label>
            <label>{t('Title')}<input className="input" value={form.title} onChange={event => setForm({...form, title: event.target.value})} placeholder={t('Title')} /></label>
            <label className="doctor-form-span">{t('Recommendation details')}<textarea rows={5} value={form.details} onChange={event => setForm({...form, details: event.target.value})} placeholder={t('Recommendation details...')} /></label>
          </div>
          <div className="parent-action-row"><Button onClick={saveRecommendation}><Send size={14}/>{t('Save Recommendation')}</Button></div>
          {error && <div className="auth-alert error">{error}</div>}
          {notice && <div className="auth-alert info">{notice}</div>}
        </Card>

        <Card>
          <div className="parent-page-head"><div><h2>{t('Active Recommendations')}</h2><p className="small muted">{t('Specialist guidance for teachers and parents.')}</p></div></div>
          <div className="parent-card-list">
            {items.map(item => {
              const patient = doctorPatients.find(student => student.id === item.studentId);
              const isDone = item.status === 'completed';
              return (
                <div className={`doctor-recommendation-card ${isDone ? 'done' : ''}`} key={item.id}>
                  <div className="parent-card-title-row"><h3>{t(item.title)}</h3><StatusBadge status={isDone ? 'stable' : item.priority === 'High' ? 'warning' : 'info'}>{isDone ? formatStatus('completed', language) : formatPriority(item.priority, language)}</StatusBadge></div>
                  <p>{t(item.simplifiedDescription || item.description)}</p>
                  <div className="parent-report-meta"><span>{displayName(patient, language)}</span><span>{formatAudience(item.audience, language)}</span><span>{t(item.reason || 'Clinical follow-up based on recent classroom evidence.')}</span></div>
                  <div className="parent-action-row">
                    <Button size="sm" variant="outline"><Eye size={14}/>{t('View')}</Button>
                    <Button size="sm" variant="outline"><Edit3 size={14}/>{t('Edit')}</Button>
                    <Button size="sm" variant={isDone ? 'green' : 'soft'} disabled={isDone} onClick={() => completeRecommendation(item.id)}><CheckCircle2 size={14}/>{t(isDone ? 'Completed' : 'Mark as completed')}</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
