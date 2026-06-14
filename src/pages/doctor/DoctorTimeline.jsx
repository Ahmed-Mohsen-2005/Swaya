import { useMemo, useState } from 'react';
import { AlertTriangle, Bot, FilePenLine, Radio } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useI18n } from '../../i18n';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { students } from '../../data/mockData';
import { displayName } from '../../utils/localization';

const timelineEvents = [
  { id: 'ev_1', type: 'note', time: '2026-05-27T09:05:00Z', patientId: 'stu_001', title: 'Teacher note added', description: 'Teacher note: Abdullah responded well to calm mode', severity: 'info' },
  { id: 'ev_2', type: 'alert', time: '2026-05-27T09:12:00Z', patientId: 'stu_006', title: 'Alert detected', description: 'Alert: High stress during transition', severity: 'warning' },
  { id: 'ev_3', type: 'robot', time: '2026-05-27T09:18:00Z', patientId: 'stu_001', title: 'Robot Action', description: 'Robot action: Calm mode activated', severity: 'stable' },
  { id: 'ev_4', type: 'note', time: '2026-05-27T09:24:00Z', patientId: 'stu_001', title: 'Clinical note added', description: 'Clinical note: stress linked to transitions', severity: 'info' },
  { id: 'ev_5', type: 'plan', time: '2026-05-27T09:34:00Z', patientId: 'stu_001', title: 'Therapy plan updated', description: 'Therapy plan updated: early calm intervention', severity: 'stable' },
];

const iconMap = { alert: AlertTriangle, robot: Bot, note: FilePenLine, plan: Radio };

function formatTime(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default function DoctorTimeline() {
  const { t, language } = useI18n();
  const [filter, setFilter] = useState('all');
  const filtered = timelineEvents.filter(event => filter === 'all' || event.type === filter);
  const patientById = useMemo(() => new Map(students.map(student => [student.id, student])), []);
  const counts = useMemo(() => ({
    alerts: timelineEvents.filter(event => event.type === 'alert').length,
    notes: timelineEvents.filter(event => event.type === 'note').length,
    robot: timelineEvents.filter(event => event.type === 'robot').length,
  }), []);

  return (
    <div className="grid doctor-module-page">
      <div className="grid grid-4 doctor-summary-metrics">
        <MetricCard icon={<Radio/>} label="Today events" value={timelineEvents.length} status="today"/>
        <MetricCard icon={<AlertTriangle/>} label="Alerts" value={counts.alerts} status="warning" color="orange"/>
        <MetricCard icon={<FilePenLine/>} label="Notes" value={counts.notes} status="info"/>
        <MetricCard icon={<Bot/>} label="Robot Actions" value={counts.robot} status="stable" color="green"/>
      </div>

      <Card>
        <div className="parent-page-head">
          <div><h2>{t('Behavior Timeline')}</h2><p className="small muted">{t('Chronological behavioral events with patient context and clinical severity.')}</p></div>
          <div className="filters">
            {[
              ['all', 'All Events'],
              ['alert', 'Alerts'],
              ['note', 'Notes'],
              ['robot', 'Robot Actions'],
            ].map(([id, label]) => <button className={`pill ${filter === id ? 'active' : ''}`} key={id} onClick={() => setFilter(id)}>{t(label)}</button>)}
          </div>
        </div>

        <div className="doctor-timeline">
          {filtered.map(event => {
            const Icon = iconMap[event.type] || Radio;
            return (
              <div className="doctor-timeline-item" key={event.id}>
                <div className={`doctor-timeline-icon ${event.severity}`}><Icon size={16}/></div>
                <div className="doctor-timeline-card">
                  <div className="parent-card-title-row">
                    <div><b>{formatTime(event.time, language)}</b><h3>{t(event.title)}</h3></div>
                    <StatusBadge status={event.severity}>{event.type}</StatusBadge>
                  </div>
                  <p>{t(event.description)}</p>
                  <span className="small muted">{t('Related patient')}: {displayName(patientById.get(event.patientId), language)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
