import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertTriangle, Bot, CheckCircle2, Eye, HeartPulse, Pause, Play, Repeat2, Smile, Square, Users, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../ui/MetricCard';
import { StatusBadge } from '../ui/StatusBadge';
import { LiveLineChart, MiniLineChart } from '../charts/SimpleCharts';
import { pct, statusFromMetrics } from '../../utils/formatters';
import { scenarios } from '../../simulation/scenarios';
import { useLiveSessionStore } from '../../store/liveSessionStore';

const fadeItem = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 4 }, transition: { duration: 0.18 } };

export function SessionHeader({ classes, selectedClassId, setSelectedClassId, onStart }) {
  const st = useLiveSessionStore();
  const active = st.status === 'active';
  return (
    <Card className={active ? 'glass' : ''}>
      <div className="grid" style={{ gridTemplateColumns: '1.2fr .75fr .85fr 1.15fr', gap: 14, alignItems: 'center' }}>
        <div>
          <div className="small muted">Class</div>
          <select className="select" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} disabled={active}>
            {classes.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
          <div className="small muted" style={{ marginTop: 8 }}>Students: {st.students?.length || 8} · ASD: 5</div>
        </div>
        <div>
          <div className="small muted">Class status</div>
          <StatusBadge status={active ? 'active' : st.status === 'paused' ? 'warning' : 'gray'}>{st.status === 'idle' ? 'Not started' : st.status}</StatusBadge>
        </div>
        <div>
          <div className="small muted">Session time</div>
          <h2 style={{ margin: '5px 0', fontSize: 22 }}>00:{String(18 + st.tick).padStart(2, '0')}:{String((st.tick * 2) % 60).padStart(2, '0')}</h2>
          <div className="small muted">Started 09:00 AM</div>
        </div>
        <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {st.status === 'idle' || st.status === 'ended'
            ? <Button onClick={onStart}><Play size={16}/>Start Session</Button>
            : st.status === 'paused'
              ? <Button variant="green" onClick={st.resumeSession}><Play size={16}/>Resume</Button>
              : <Button variant="soft" onClick={st.pauseSession}><Pause size={16}/>Pause</Button>}
          <Button variant="danger" onClick={st.endSession}><Square size={14}/>End</Button>
        </div>
      </div>
    </Card>
  );
}

export function ScenarioController({ students }) {
  const st = useLiveSessionStore();
  return (
    <Card className="glass">
      <div className="section-title">
        <div>
          <h2>Demo Control Panel</h2>
          <p className="small muted" style={{ margin: '3px 0 0' }}>Simulated metrics refresh every 2 seconds.</p>
        </div>
        <span className="badge blue"><Activity size={13}/>Live simulation</span>
      </div>
      <div className="grid grid-3">
        <label>
          <div className="small muted">Scenario</div>
          <select className="select" style={{ width: '100%' }} value={st.selectedScenario} onChange={e => st.setScenario(e.target.value, st.targetStudentId || students[0]?.id)}>
            {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label>
          <div className="small muted">Target student</div>
          <select className="select" style={{ width: '100%' }} value={st.targetStudentId || students[0]?.id || ''} onChange={e => st.setScenario(st.selectedScenario, e.target.value)}>
            {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
          </select>
        </label>
        <div style={{ display: 'flex', alignItems: 'end', gap: 9, flexWrap: 'wrap' }}>
          <Button onClick={() => st.setScenario(st.selectedScenario, st.targetStudentId || students[0]?.id)}>Apply Scenario</Button>
          <span className="badge gray">Teacher demo mode</span>
        </div>
      </div>
    </Card>
  );
}

export function ClassMetrics() {
  const st = useLiveSessionStore();
  const m = st.currentClassMetrics;
  const activeAlerts = st.alerts.filter(a => a.status === 'active').length;
  const need = Object.values(st.currentStudentMetrics).filter(x => statusFromMetrics(x) !== 'stable').length;
  return (
    <div className="grid grid-5">
      <MetricCard icon={<Eye/>} label="Avg Attention" value={pct(m.attention)} status="stable" trend="+6% vs last 5 min"/>
      <MetricCard icon={<Smile/>} label="Avg Engagement" value={pct(m.engagement)} color="green" status="improving" trend="+8% vs last 5 min"/>
      <MetricCard icon={<HeartPulse/>} label="Avg Stress" value={pct(m.stress)} color={m.stress > 60 ? 'red' : 'orange'} status={m.stress > 60 ? 'high' : 'normal'} trend="-12% vs last 5 min"/>
      <MetricCard icon={<AlertTriangle/>} label="Active Alerts" value={activeAlerts} color={activeAlerts > 2 ? 'red' : 'orange'} status={`${st.alerts.filter(a => a.severity === 'critical').length} critical`} trend="requires review"/>
      <MetricCard icon={<Users/>} label="Needs Attention" value={need} color="purple" status="class" trend={`${Math.round(need / (st.students.length || 1) * 100)}% of class`}/>
    </div>
  );
}

export function AlertsPanel() {
  const st = useLiveSessionStore();
  const active = st.alerts.filter(a => a.status === 'active').slice(-5).reverse();
  return (
    <Card>
      <div className="section-title">
        <h2>Alerts ({active.length})</h2>
        <span className="small muted">Active only</span>
      </div>
      <div className="grid">
        <AnimatePresence initial={false}>
          {active.length === 0
            ? <motion.div {...fadeItem} className="muted">No active alerts. Class status is stable.</motion.div>
            : active.map(a => (
              <motion.div {...fadeItem} layout key={a.id} className={`alert-card ${a.severity === 'critical' ? 'critical' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div><b>{a.studentName}</b><div className="small muted">{a.type.replace('_', ' ')}</div></div>
                  <StatusBadge status={a.severity === 'critical' ? 'critical' : 'warning'}>{a.severity}</StatusBadge>
                </div>
                <div style={{ margin: '9px 0' }}>
                  <b style={{ color: a.severity === 'critical' ? 'var(--red)' : 'var(--orange)' }}>{a.message}</b>
                  <br/><span className="small">Suggested intervention: {a.suggestedAction}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="soft" onClick={() => st.focusStudent(a.studentId)} style={{ flex: 1 }}>Focus</Button>
                  <Button variant="green" onClick={() => st.markAlertHandled(a.id)} style={{ flex: 1 }}>Handled</Button>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}

export function StudentsGrid() {
  const st = useLiveSessionStore();
  const [filter, setFilter] = React.useState('all');
  const cards = st.students.filter(s => {
    const m = st.currentStudentMetrics[s.id] || {};
    const status = statusFromMetrics(m);
    if (filter === 'alerts') return st.alerts.some(a => a.studentId === s.id && a.status === 'active');
    if (filter === 'high_stress') return m.stress > 60;
    if (filter === 'low_attention') return m.attention < 50;
    if (filter === 'asd') return s.classification === 'ASD';
    if (filter === 'typical') return s.classification === 'Typical';
    return true;
  });
  return (
    <Card>
      <div className="section-title">
        <h2>Students Overview</h2>
        <div className="filters">
          {[
            ['all', 'All'], ['alerts', 'Alerts'], ['high_stress', 'High Stress'], ['low_attention', 'Low Attention'], ['asd', 'ASD'], ['typical', 'Typical']
          ].map(([id, label]) => <button className={`pill ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)} key={id}>{label}</button>)}
        </div>
      </div>
      <motion.div layout className="grid grid-4">
        <AnimatePresence initial={false}>
          {cards.map(s => {
            const m = st.currentStudentMetrics[s.id] || s.baselineMetrics;
            const status = statusFromMetrics(m);
            return (
              <motion.div {...fadeItem} layout key={s.id} className={`student-card ${st.focusedStudentId === s.id ? 'focused' : ''} ${status === 'critical' ? 'critical' : status === 'warning' ? 'warning' : ''}`} onClick={() => st.focusStudent(s.id)}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="avatar">{s.shortName?.slice(0, 1) || s.fullName?.slice(0, 1)}</div>
                  <div><b>{s.fullName}</b><div className="small muted">{s.classification} · {s.autismLevel}</div></div>
                </div>
                <div className="mini-row"><span>Attention</span><b>{pct(m.attention)}</b></div>
                <div className="mini-row"><span>Engagement</span><b>{pct(m.engagement)}</b></div>
                <div className="mini-row"><span>Stress</span><b>{pct(m.stress)}</b></div>
                <StatusBadge status={status}>{status}</StatusBadge>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      <p className="small muted">Showing {cards.length} of {st.students.length} students</p>
    </Card>
  );
}

export function StudentFocus() {
  const st = useLiveSessionStore();
  const student = st.students.find(s => s.id === st.focusedStudentId) || st.students.find(s => s.id === st.targetStudentId) || st.students[0];
  if (!student) return <Card><b>Student Focus</b><p className="muted">Start a session to focus on a student.</p></Card>;
  const m = st.currentStudentMetrics[student.id] || student.baselineMetrics;
  const data = st.metricHistory.map(p => ({ time: p.time, attention: m.attention + (Math.random() * 8 - 4), stress: m.stress + (Math.random() * 8 - 4) }));
  return (
    <motion.div layout>
      <Card>
        <div className="section-title">
          <h2>Student Focus: {student.fullName}</h2>
          <StatusBadge status={statusFromMetrics(m)}>{m.emotionalState || 'calm'}</StatusBadge>
        </div>
        <div className="grid grid-2">
          <div>
            <div className="mini-row"><span>Attention</span><b>{pct(m.attention)}</b></div>
            <div className="mini-row"><span>Engagement</span><b>{pct(m.engagement)}</b></div>
            <div className="mini-row"><span>Stress</span><b style={{ color: m.stress > 70 ? 'var(--red)' : 'inherit' }}>{pct(m.stress)}</b></div>
            <div className="mini-row"><span>Social Interaction</span><b>{pct(m.socialInteraction)}</b></div>
            <textarea style={{ width: '100%', marginTop: 12 }} placeholder="Add concise observation..."/>
          </div>
          <MiniLineChart data={data}/>
        </div>
      </Card>
    </motion.div>
  );
}

export function RobotControl() {
  const st = useLiveSessionStore();
  const target = st.focusedStudentId ? 'Selected Student' : 'Whole Class';
  const actions = [
    ['calm_mode', 'Calm Mode', 'soft'],
    ['praise', 'Positive Prompt', 'outline'],
    ['repeat_instruction', 'Repeat Instruction', 'soft'],
    ['change_activity', 'Change Activity', 'outline'],
    ['group_engagement_prompt', 'Group Prompt', 'soft']
  ];
  return (
    <Card>
      <div className="section-title">
        <h2>Robot Support Actions</h2>
        <span className="badge green"><Bot size={13}/> {st.robotState.mode}</span>
      </div>
      <div className="small muted">Target</div>
      <div className="grid grid-2" style={{ marginBottom: 12 }}>
        <button className={`pill ${target === 'Whole Class' ? 'active' : ''}`}>Whole Class</button>
        <button className={`pill ${target === 'Selected Student' ? 'active' : ''}`}>Selected Student</button>
      </div>
      <div className="grid grid-2">
        {actions.map(([id, label, variant]) => <Button key={id} variant={variant} onClick={() => st.runRobotAction(id, id === 'change_activity' || id === 'group_engagement_prompt' ? 'class' : 'student')}>{label}</Button>)}
      </div>
      <Button variant="danger" onClick={() => st.runRobotAction('emergency_stop', 'class')} style={{ width: '100%', marginTop: 10 }}>Emergency Stop</Button>
      <p className="small muted">Effect: {st.robotState.effect} · Target: {st.robotState.target}</p>
    </Card>
  );
}

export function Timeline() {
  const st = useLiveSessionStore();
  return (
    <Card>
      <h2 style={{ marginTop: 0 }}>Session Timeline</h2>
      <div className="timeline">
        {st.timelineEvents.slice(-9).map(e => (
          <div className="timeline-item" key={e.id}>
            <div className="timeline-dot">{e.type === 'robot_action' ? <Bot size={16}/> : e.type === 'alert_created' ? <AlertTriangle size={16}/> : <Activity size={16}/>}</div>
            <div><div className="small muted">{e.timestamp}</div><b>{e.title}</b><div className="small muted">{e.description}</div></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

