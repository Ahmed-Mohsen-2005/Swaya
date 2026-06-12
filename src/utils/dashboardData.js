const avg = values => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

export function buildTeacherMetrics({ students, sessions, alerts }) {
  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const recentSession = sessions.at(-1);
  const previous = sessions.at(-2);
  const trend = (current, before) => `${current >= before ? '+' : ''}${current - before}% this week`;

  return {
    assignedStudents: students.length,
    avgAttention: avg(students.map(student => student.baselineMetrics.attention)),
    avgEngagement: avg(students.map(student => student.baselineMetrics.engagement)),
    recentAlerts: activeAlerts.length,
    attentionTrend: recentSession && previous ? trend(recentSession.avgAttention, previous.avgAttention) : '',
    engagementTrend: recentSession && previous ? trend(recentSession.avgEngagement, previous.avgEngagement) : '',
    alertTrend: `${activeAlerts.length} need follow-up`,
  };
}

export function buildDoctorMetrics({ patients, reports, plans, recommendations }) {
  const needsReview = patients.filter(patient => patient.status !== 'stable' || patient.baselineMetrics.attention < 60 || patient.baselineMetrics.stress >= 45);
  return {
    assignedPatients: patients.length,
    needReview: needsReview.length,
    activePlans: plans.filter(plan => plan.status === 'active').length,
    reports: reports.length,
    plansNeedUpdate: plans.filter(plan => plan.goals?.some(goal => goal.progress < 50)).length,
    recommendations: recommendations.length,
  };
}

export function buildClinicalQueue({ patients, alerts, sessions }) {
  return buildPriorityStudents({ students: patients, alerts, sessions }).map(patient => ({
    ...patient,
    reason: patient.risk.activeAlerts ? 'Unresolved clinical alert' : patient.baselineMetrics.attention < 60 ? 'Attention below threshold' : 'Stress pattern needs review',
  }));
}

export function buildParentSummary({ child, recommendations, liveStatus, metrics }) {
  return {
    child,
    recommendations,
    currentState: liveStatus === 'active' ? 'Session active' : 'Ready',
    supportLevel: child.autismLevel === 'moderate' ? 'Structured support' : 'Light support',
    friendlyStress: metrics.stress < 45 ? 'Stress is lower today' : 'Extra support may help today',
    friendlyEngagement: metrics.engagement >= 70 ? 'Engagement is good' : 'Engagement needs gentle support',
  };
}

export function riskForStudent(student, alerts) {
  const activeAlerts = alerts.filter(alert => alert.studentId === student.id && alert.status === 'active');
  const metrics = student.baselineMetrics;
  let score = 0;
  if (metrics.attention < 60) score += 2;
  if (metrics.engagement < 58) score += 1;
  if (metrics.stress >= 50) score += 2;
  score += activeAlerts.some(alert => alert.severity === 'critical') ? 3 : activeAlerts.length;

  return {
    score,
    level: score >= 4 ? 'High Risk' : score >= 2 ? 'Moderate Risk' : 'Needs Attention',
    stressLabel: metrics.stress >= 50 ? 'Elevated stress' : 'Low stress',
    activeAlerts: activeAlerts.length,
  };
}

export function buildPriorityStudents({ students, alerts, sessions }) {
  const latestSession = sessions.at(-1);
  return students
    .map(student => ({ ...student, risk: riskForStudent(student, alerts), lastSessionLabel: latestSession ? 'Last session: 25 min ago' : 'No recent session' }))
    .filter(student => student.risk.score > 0 || student.status !== 'stable')
    .sort((a, b) => b.risk.score - a.risk.score);
}

export function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export function systemChipsFromStatus(status) {
  const cameraLabel = status.camera === 'warning' ? 'Camera Warning' : status.camera === 'offline' || status.camera === 'disconnected' ? 'Camera Offline' : 'Camera Active';
  return [
    ['Live Monitoring', 'activity', status.liveMonitoring],
    ['AI Online', 'cpu', status.ai],
    ['Robot Connected', 'radio', status.robot],
    [cameraLabel, 'camera', status.camera],
  ];
}
