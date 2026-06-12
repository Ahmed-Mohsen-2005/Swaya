import { thresholds } from './scenarios';
const clamp = (n,min=0,max=100)=>Math.max(min,Math.min(max,n));
const noise = (v=3)=> (Math.random()*v*2)-v;
const toward = (current,target,speed=.18)=> clamp(current + (target-current)*speed + noise(2.4));
export const initializeMetrics = (students) => Object.fromEntries(students.map(s => [s.id, {...s.baselineMetrics, emotionalState:'calm'}]));
export const calculateClassMetrics = (studentMetrics) => {
  const arr = Object.values(studentMetrics); if(!arr.length) return {attention:0, engagement:0, stress:0, socialInteraction:0};
  return ['attention','engagement','stress','socialInteraction'].reduce((acc,k)=>{acc[k]=Math.round(arr.reduce((sum,m)=>sum+(m[k]||0),0)/arr.length); return acc;},{});
};
const normalTarget = (student) => student.baselineMetrics;
export const getTarget = ({student, scenarioId, targetStudentId, affectedIds = [], current}) => {
  const base = normalTarget(student);
  const isTarget = student.id === targetStudentId;
  const affected = affectedIds.includes(student.id);
  if(scenarioId === 'high_stress_student' && isTarget) return {attention:42, engagement:40, stress:88, socialInteraction:38};
  if(scenarioId === 'low_attention_student' && isTarget) return {attention:28, engagement:48, stress:48, socialInteraction:40};
  if(scenarioId === 'low_engagement_group' && affected) return {attention:48, engagement:35, stress:42, socialInteraction:35};
  if(scenarioId === 'multiple_alerts'){
    if(isTarget) return {attention:40, engagement:36, stress:88, socialInteraction:34};
    if(affected) return {attention:30, engagement:38, stress:62, socialInteraction:32};
  }
  if(scenarioId === 'relax') return {attention:74, engagement:78, stress:22, socialInteraction:70};
  if(scenarioId === 'robot_calm_success' && isTarget) return current?.stress > 70 ? {attention:48, engagement:45, stress:86, socialInteraction:40} : {attention:68, engagement:70, stress:30, socialInteraction:62};
  if(scenarioId === 'activity_change_success') return {attention:78, engagement:84, stress:28, socialInteraction:76};
  return {attention:base.attention, engagement:base.engagement, stress:base.stress, socialInteraction:base.socialInteraction};
};
export const emotionalStateFromMetrics = (m) => m.stress > 82 ? 'distressed' : m.stress > 65 ? 'anxious' : m.attention < 38 ? 'distracted' : m.engagement > 75 ? 'engaged' : 'calm';
export const nextMetrics = ({students, currentMetrics, scenarioId, targetStudentId, affectedIds, robotEffects}) => {
  const updated = {};
  students.forEach(student => {
    const cur = currentMetrics[student.id] || student.baselineMetrics;
    let target = getTarget({student, scenarioId, targetStudentId, affectedIds, current:cur});
    if(robotEffects?.[student.id]) target = {...target, ...robotEffects[student.id]};
    const m = {
      attention: toward(cur.attention, target.attention),
      engagement: toward(cur.engagement, target.engagement),
      stress: toward(cur.stress, target.stress),
      socialInteraction: toward(cur.socialInteraction, target.socialInteraction)
    };
    m.emotionalState = emotionalStateFromMetrics(m);
    updated[student.id] = m;
  });
  return updated;
};
export const createAlerts = ({studentMetrics, students, sessionId, classId, existingAlerts}) => {
  const activeKeys = new Set(existingAlerts.filter(a => a.status === 'active').map(a => `${a.studentId}-${a.type}`));
  const alerts = [];
  students.forEach(s=>{
    const m = studentMetrics[s.id]; if(!m) return;
    const push = (type,severity,value,msg,action) => {
      const key = `${s.id}-${type}`; if(activeKeys.has(key)) return;
      alerts.push({ id:`alert_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, sessionId, classId, studentId:s.id, type, severity, metricValue:Math.round(value), studentName:s.fullName, message:msg, suggestedAction:action, status:'active', createdAt:new Date().toISOString() });
    };
    if(m.stress >= thresholds.stress.critical) push('high_stress','critical',m.stress,`${s.fullName} is showing critical stress indicators.`,'Activate Calm Mode');
    else if(m.stress >= thresholds.stress.high) push('high_stress','high',m.stress,`${s.fullName} is showing high stress indicators.`,'Activate Calm Mode');
    if(m.attention <= thresholds.attention.critical) push('low_attention','critical',m.attention,`${s.fullName} has very low attention.`,'Repeat Instruction');
    else if(m.attention <= thresholds.attention.low) push('low_attention','medium',m.attention,`${s.fullName} attention is dropping.`,'Repeat Instruction');
    if(m.engagement <= thresholds.engagement.critical) push('low_engagement','critical',m.engagement,`${s.fullName} is disengaged.`,'Change Activity');
    else if(m.engagement <= thresholds.engagement.low) push('low_engagement','medium',m.engagement,`${s.fullName} engagement is low.`,'Change Activity');
  });
  return alerts;
};
export const robotEffectFor = (action, targetStudentId, students) => {
  const effect = {};
  const apply = (id, vals) => { effect[id] = vals; };
  if(action === 'calm_mode' && targetStudentId) apply(targetStudentId, {stress:28, attention:68, engagement:70, socialInteraction:60});
  if(action === 'praise' && targetStudentId) apply(targetStudentId, {engagement:85, stress:25});
  if(action === 'repeat_instruction' && targetStudentId) apply(targetStudentId, {attention:78, stress:35});
  if(action === 'change_activity') students.forEach(s=>apply(s.id,{attention:76, engagement:82, stress:30, socialInteraction:72}));
  if(action === 'group_engagement_prompt') students.forEach(s=>apply(s.id,{engagement:80, socialInteraction:78}));
  return effect;
};
