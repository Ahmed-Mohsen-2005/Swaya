import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertTriangle, Bot, Eye, HeartPulse, Pause, Play, Smile, Square, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../ui/MetricCard';
import { StatusBadge } from '../ui/StatusBadge';
import { MiniLineChart } from '../charts/SimpleCharts';
import { pct, statusFromMetrics } from '../../utils/formatters';
import { scenarios } from '../../simulation/scenarios';
import { useLiveSessionStore } from '../../store/liveSessionStore';
import { useI18n } from '../../i18n';
import { displayName, initialsForEntity } from '../../utils/localization';

const fadeItem = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 4 }, transition: { duration: 0.18 } };
const fadeOnly = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.16 } };

export function SessionHeader({ classes, selectedClassId, setSelectedClassId, onStart }) {
  const { t } = useI18n();
  const st = useLiveSessionStore();
  const active = st.status === 'active';
  const asdCount = st.students?.filter(student => student.classification === 'ASD').length || 0;

  return (
    <Card className={active ? 'glass' : ''}>
      <div className="grid" style={{ gridTemplateColumns: '1.2fr .75fr .85fr 1.15fr', gap: 14, alignItems: 'center' }}>
        <div>
          <div className="small muted">{t('Class')}</div>
          <select className="select" value={selectedClassId} onChange={event => setSelectedClassId(event.target.value)} disabled={active}>
            {classes.map(classroom => <option value={classroom.id} key={classroom.id}>{t(classroom.name)}</option>)}
          </select>
          <div className="small muted" style={{ marginTop: 8 }}>{t('Students')}: {st.students?.length || 0} · {t('ASD students')}: {asdCount}</div>
        </div>
        <div>
          <div className="small muted">{t('Class status')}</div>
          <StatusBadge status={active ? 'active' : st.status === 'paused' ? 'warning' : 'gray'}>{st.status === 'idle' ? t('Not started') : t(st.status)}</StatusBadge>
        </div>
        <div>
          <div className="small muted">{t('Session time')}</div>
          <h2 style={{ margin: '5px 0', fontSize: 22 }}>00:{String(18 + st.tick).padStart(2, '0')}:{String((st.tick * 2) % 60).padStart(2, '0')}</h2>
          <div className="small muted">{t('Started 09:00')}</div>
        </div>
        <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {st.status === 'idle' || st.status === 'ended'
            ? <Button onClick={onStart}><Play size={16} />{t('Start Session')}</Button>
            : st.status === 'paused'
              ? <Button variant="green" onClick={st.resumeSession}><Play size={16} />{t('Resume')}</Button>
              : <Button variant="soft" onClick={st.pauseSession}><Pause size={16} />{t('Pause')}</Button>}
          <Button variant="danger" onClick={st.endSession}><Square size={14} />{t('End')}</Button>
        </div>
      </div>
    </Card>
  );
}

export function ScenarioController({ students }) {
  const { t, language } = useI18n();
  const st = useLiveSessionStore();

  return (
    <Card className="glass">
      <div className="section-title">
        <div>
          <h2>{t('Demo Control Panel')}</h2>
          <p className="small muted" style={{ margin: '3px 0 0' }}>{t('Simulated metrics refresh every 2 seconds.')}</p>
        </div>
        <span className="badge blue"><Activity size={13} />{t('Live simulation')}</span>
      </div>
      <div className="grid grid-3">
        <label>
          <div className="small muted">{t('Scenario')}</div>
          <select className="select" style={{ width: '100%' }} value={st.selectedScenario} onChange={event => st.setScenario(event.target.value, st.targetStudentId || students[0]?.id)}>
            {scenarios.map(scenario => <option key={scenario.id} value={scenario.id}>{t(scenario.name)}</option>)}
          </select>
        </label>
        <label>
          <div className="small muted">{t('Target student')}</div>
          <select className="select" style={{ width: '100%' }} value={st.targetStudentId || students[0]?.id || ''} onChange={event => st.setScenario(st.selectedScenario, event.target.value)}>
            {students.map(student => <option key={student.id} value={student.id}>{displayName(student, language)}</option>)}
          </select>
        </label>
        <div style={{ display: 'flex', alignItems: 'end', gap: 9, flexWrap: 'wrap' }}>
          <Button onClick={() => st.setScenario(st.selectedScenario, st.targetStudentId || students[0]?.id)}>{t('Apply Scenario')}</Button>
          <span className="badge gray">{t('Teacher demo mode')}</span>
        </div>
      </div>
    </Card>
  );
}

export function ClassMetrics() {
  const { t } = useI18n();
  const st = useLiveSessionStore();
  const metrics = st.currentClassMetrics;
  const activeAlerts = st.alerts.filter(alert => alert.status === 'active').length;
  const needAttention = Object.values(st.currentStudentMetrics).filter(item => statusFromMetrics(item) !== 'stable').length;

  return (
    <div className="grid grid-5">
      <MetricCard icon={<Eye />} label="Avg Attention" value={pct(metrics.attention)} trend={t('+6% vs last 5 min')} />
      <MetricCard icon={<Smile />} label="Avg Engagement" value={pct(metrics.engagement)} color="green" trend={t('+8% vs last 5 min')} />
      <MetricCard icon={<HeartPulse />} label="Avg Stress" value={pct(metrics.stress)} color={metrics.stress > 60 ? 'red' : 'orange'} trend={t('-12% vs last 5 min')} />
      <MetricCard icon={<AlertTriangle />} label="Active Alerts" value={activeAlerts} color={activeAlerts > 2 ? 'red' : 'orange'} trend={t('Requires review')} />
      <MetricCard icon={<Users />} label="Needs Attention" value={needAttention} color="blue" trend={`${Math.round(needAttention / (st.students.length || 1) * 100)}% ${t('of class')}`} />
    </div>
  );
}

export function AlertsPanel() {
  const { t } = useI18n();
  const st = useLiveSessionStore();
  const activeAlerts = st.alerts.filter(alert => alert.status === 'active').slice(-5).reverse();
  const severityTone = (severity) => severity === 'critical' || severity === 'high' ? 'critical' : severity === 'info' ? 'stable' : 'warning';
  const severityLabel = (severity) => severity === 'critical' || severity === 'high' ? 'High risk' : severity === 'info' ? 'Info' : 'Needs follow-up';

  return (
    <Card>
      <div className="section-title">
        <h2>{t('Alerts')} ({activeAlerts.length})</h2>
        <span className="small muted">{t('Active only')}</span>
      </div>
      <div className="grid">
        <AnimatePresence initial={false}>
          {activeAlerts.length === 0
            ? <motion.div {...fadeItem} className="muted">{t('No active alerts. Class status is stable.')}</motion.div>
            : activeAlerts.map(alert => (
              <motion.div {...fadeItem} layout key={alert.id} className={`alert-card ${alert.severity === 'critical' ? 'critical' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div><b>{t(alert.studentName)}</b><div className="small muted">{t(alert.type.replace('_', ' '))}</div></div>
                  <StatusBadge status={severityTone(alert.severity)}>{t(severityLabel(alert.severity))}</StatusBadge>
                </div>
                <div style={{ margin: '9px 0' }}>
                  <b style={{ color: alert.severity === 'critical' ? 'var(--red)' : 'var(--orange)' }}>{t(alert.message)}</b>
                  <br /><span className="small">{t('Suggested intervention')}: {t(alert.suggestedAction)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="soft" onClick={() => st.focusStudent(alert.studentId)} style={{ flex: 1 }}>{t('Focus')}</Button>
                  <Button variant="green" onClick={() => st.markAlertHandled(alert.id)} style={{ flex: 1 }}>{t('Handled')}</Button>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}

export function StudentsGrid() {
  const { t, language } = useI18n();
  const st = useLiveSessionStore();
  const [filter, setFilter] = React.useState('all');
  const cards = st.students.filter(student => {
    const metrics = st.currentStudentMetrics[student.id] || {};
    if (filter === 'alerts') return st.alerts.some(alert => alert.studentId === student.id && alert.status === 'active');
    if (filter === 'high_stress') return metrics.stress > 60;
    if (filter === 'low_attention') return metrics.attention < 50;
    if (filter === 'asd') return student.classification === 'ASD';
    if (filter === 'typical') return student.classification === 'Typical';
    return true;
  });

  return (
    <Card>
      <div className="section-title">
        <h2>{t('Students Overview')}</h2>
        <div className="filters">
          {[
            ['all', 'All'],
            ['alerts', 'Alerts'],
            ['high_stress', 'High Stress'],
            ['low_attention', 'Low Attention'],
            ['asd', 'ASD'],
            ['typical', 'Typical'],
          ].map(([id, label]) => (
            <button className={`pill ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)} key={id}>
              {t(label)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-4 live-students-grid">
        <AnimatePresence initial={false}>
          {cards.map(student => {
            const metrics = st.currentStudentMetrics[student.id] || student.baselineMetrics;
            const status = statusFromMetrics(metrics);
            return (
              <motion.div {...fadeOnly} key={student.id} className={`student-card live-student-card ${st.focusedStudentId === student.id ? 'focused' : ''} ${status === 'critical' ? 'critical' : status === 'warning' ? 'warning' : ''}`} onClick={() => st.focusStudent(student.id)}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="avatar">{initialsForEntity(student, language)}</div>
                  <div><b>{displayName(student, language)}</b><div className="small muted">{student.classification === 'ASD' ? `${t('ASD')} · ${t(student.autismLevel)}` : `${t('Typical')} · ${t('Not applicable')}`}</div></div>
                </div>
                <div className="mini-row"><span>{t('Attention')}</span><b>{pct(metrics.attention)}</b></div>
                <div className="mini-row"><span>{t('Engagement')}</span><b>{pct(metrics.engagement)}</b></div>
                <div className="mini-row"><span>{t('Stress')}</span><b>{pct(metrics.stress)}</b></div>
                <p className="small muted">{t(status === 'stable' ? 'Support note: stable participation.' : status === 'warning' ? 'Support note: needs follow-up.' : 'Support note: high priority support needed.')}</p>
                <StatusBadge status={status}>{t(status)}</StatusBadge>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="small muted">{t('Showing')} {cards.length} {t('of')} {st.students.length} {t('students')}</p>
    </Card>
  );
}

export function StudentFocus() {
  const { t, language } = useI18n();
  const st = useLiveSessionStore();
  const student = st.students.find(item => item.id === st.focusedStudentId) || st.students.find(item => item.id === st.targetStudentId) || st.students[0];
  if (!student) return <Card><b>{t('Student Focus')}</b><p className="muted">{t('Start a session to focus on a student.')}</p></Card>;
  const metrics = st.currentStudentMetrics[student.id] || student.baselineMetrics;
  const data = st.metricHistory.map(point => ({ time: point.time, attention: metrics.attention + (Math.random() * 8 - 4), stress: metrics.stress + (Math.random() * 8 - 4) }));

  return (
    <motion.div layout>
      <Card>
        <div className="section-title">
          <h2>{t('Student Focus')}: {displayName(student, language)}</h2>
          <StatusBadge status={statusFromMetrics(metrics)}>{t(metrics.emotionalState || 'calm')}</StatusBadge>
        </div>
        <div className="grid grid-2">
          <div>
            <div className="mini-row"><span>{t('Attention')}</span><b>{pct(metrics.attention)}</b></div>
            <div className="mini-row"><span>{t('Engagement')}</span><b>{pct(metrics.engagement)}</b></div>
            <div className="mini-row"><span>{t('Stress')}</span><b style={{ color: metrics.stress > 70 ? 'var(--red)' : 'inherit' }}>{pct(metrics.stress)}</b></div>
            <div className="mini-row"><span>{t('Social Interaction')}</span><b>{pct(metrics.socialInteraction)}</b></div>
            <textarea style={{ width: '100%', marginTop: 12 }} placeholder={t('Add concise observation...')} />
          </div>
          <MiniLineChart data={data} />
        </div>
      </Card>
    </motion.div>
  );
}

export function RobotControl() {
  const { t } = useI18n();
  const st = useLiveSessionStore();
  const hasStudentTarget = Boolean(st.focusedStudentId);
  const actions = [
    ['calm_mode', 'Calm Mode', 'soft'],
    ['praise', 'Positive Reinforcement', 'outline'],
    ['change_activity', 'Reduce Activity', 'soft'],
    ['repeat_instruction', 'Repeat Instruction', 'soft'],
    ['group_engagement_prompt', 'Group Alert', 'outline'],
  ];

  return (
    <Card>
      <div className="section-title">
        <h2>{t('Robot Support Actions')}</h2>
        <span className="badge green"><Bot size={13} /> {t(st.robotState.mode)}</span>
      </div>
      <div className="small muted">{t('Target')}</div>
      <div className="grid grid-2" style={{ marginBottom: 12 }}>
        <button className={`pill ${!hasStudentTarget ? 'active' : ''}`} onClick={() => st.focusStudent(null)}>{t('Whole Class')}</button>
        <button className={`pill ${hasStudentTarget ? 'active' : ''}`} onClick={() => st.focusStudent(st.focusedStudentId || st.students[0]?.id || null)}>{t('Selected Student')}</button>
      </div>
      <div className="grid grid-2">
        {actions.map(([id, label, variant]) => (
          <Button key={id} variant={variant} onClick={() => st.runRobotAction(id, id === 'change_activity' || id === 'group_engagement_prompt' ? 'class' : 'student')}>
            {t(label)}
          </Button>
        ))}
      </div>
      <Button variant="danger" onClick={() => st.runRobotAction('emergency_stop', 'class')} style={{ width: '100%', marginTop: 10 }}>{t('Emergency Stop')}</Button>
      <p className="small muted">{t('Effect')}: {t(st.robotState.effect)} · {t('Target')}: {t(st.robotState.target)}</p>
    </Card>
  );
}

export function Timeline() {
  const { t } = useI18n();
  const st = useLiveSessionStore();
  return (
    <Card>
      <h2 style={{ marginTop: 0 }}>{t('Session Timeline')}</h2>
      <div className="timeline">
        {st.timelineEvents.slice(-9).map(event => (
          <div className="timeline-item" key={event.id}>
            <div className="timeline-dot">{event.type === 'robot_action' ? <Bot size={16} /> : event.type === 'alert_created' ? <AlertTriangle size={16} /> : <Activity size={16} />}</div>
            <div><div className="small muted">{event.timestamp}</div><b>{t(event.title)}</b><div className="small muted">{t(event.description)}</div></div>
          </div>
        ))}
      </div>
    </Card>
  );
}
