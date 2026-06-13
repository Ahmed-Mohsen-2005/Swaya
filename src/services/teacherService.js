import { dataService } from './dataService';
import { buildPriorityStudents, buildTeacherMetrics, relativeTime, riskForStudent } from '../utils/dashboardData';

const avg = values => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
const byDateDesc = (left, right) => new Date(right).getTime() - new Date(left).getTime();

const formatDate = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
const formatDateTime = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const formatTimeOnly = value => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const initialsFor = name => name?.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'SW';

const sessionStatusLabel = session => session.status === 'ended'
  ? session.avgStress >= 45 || session.alerts >= 4 ? 'Needs follow-up' : 'Stable session'
  : session.status === 'active'
    ? 'Active monitoring'
    : session.status === 'paused'
      ? 'Paused'
      : 'Ready';

const reportTypeMap = {
  weekly_parent: 'Weekly',
  clinical: 'Clinical',
  class_session: 'Session',
  class_weekly: 'Weekly',
  follow_up: 'Follow-up',
};

const inferNoteCategory = note => {
  const value = String(note.content || '').toLowerCase();
  if (value.includes('stress') || value.includes('calm')) return 'Stress';
  if (value.includes('attention')) return 'Attention';
  if (value.includes('engagement') || value.includes('particip')) return 'Engagement';
  if (value.includes('behavior') || value.includes('transition')) return 'Behavior';
  return 'General';
};

const severityMap = { low: 'Low', medium: 'Medium', high: 'High' };
const statusToneFromLabel = value => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('critical') || normalized.includes('high')) return 'critical';
  if (normalized.includes('warning') || normalized.includes('follow') || normalized.includes('attention') || normalized.includes('moderate')) return 'warning';
  if (normalized.includes('active') || normalized.includes('review') || normalized.includes('monitor')) return 'info';
  return 'stable';
};

function buildStudentSessionMap(sessions, notes) {
  const map = new Map();
  notes.forEach(note => {
    if (!note.studentId || !note.sessionId) return;
    const sessionIds = map.get(note.studentId) || new Set();
    sessionIds.add(note.sessionId);
    map.set(note.studentId, sessionIds);
  });
  return new Map([...map.entries()].map(([studentId, ids]) => [studentId, sessions.filter(session => ids.has(session.id))]));
}

function deriveStudentView(student, { alerts, sessions, notes, recommendations }) {
  const studentAlerts = alerts.filter(alert => alert.studentId === student.id);
  const activeAlerts = studentAlerts.filter(alert => alert.status === 'active');
  const risk = riskForStudent(student, alerts);
  const linkedSessions = sessions.length ? sessions : [];
  const lastSession = linkedSessions[0];
  const studentNotes = notes.filter(note => note.studentId === student.id);
  const studentRecommendations = recommendations.filter(rec => rec.studentId === student.id);

  return {
    ...student,
    initials: initialsFor(student.fullName),
    risk,
    statusLabel: risk.level === 'High Risk' ? 'High risk' : student.status === 'needs_attention' ? 'Needs attention' : 'Stable',
    statusTone: risk.level === 'High Risk' ? 'critical' : risk.level === 'Moderate Risk' || student.status === 'needs_attention' ? 'warning' : 'stable',
    metrics: student.baselineMetrics,
    activeAlertsCount: activeAlerts.length,
    alertsCount: studentAlerts.length,
    noteCount: studentNotes.length,
    recommendationCount: studentRecommendations.length,
    lastSessionAt: lastSession?.date || null,
    lastSessionLabel: lastSession ? formatDate(lastSession.date) : 'No recent session',
    lastSessionRelative: lastSession ? relativeTime(new Date(`${lastSession.date}T09:00:00Z`).toISOString()) : 'No recent session',
  };
}

function buildReportCollection({ baseReports, sessions, students, alerts }) {
  const latestSession = [...sessions].sort((a, b) => byDateDesc(a.date, b.date))[0];
  const attentionGapStudents = students.filter(student => student.baselineMetrics.attention < 60);
  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  const derivedReports = [
    {
      id: 'rep_teacher_weekly_001',
      title: 'Inclusive Class Weekly Summary',
      reportType: 'class_weekly',
      audience: 'teacher',
      date: latestSession?.date || new Date().toISOString(),
      status: activeAlerts.length ? 'pending_review' : 'published',
      summary: activeAlerts.length
        ? `${activeAlerts.length} active alerts still need review before the weekly class summary is finalized.`
        : 'Class attention and engagement trends improved across the latest monitored week.',
      classId: 'class_001',
      relatedLabel: 'Inclusive Class A',
    },
    {
      id: 'rep_teacher_followup_001',
      title: 'Student Support Follow-up',
      reportType: 'follow_up',
      audience: 'teacher',
      date: latestSession?.date || new Date().toISOString(),
      status: attentionGapStudents.length ? 'draft' : 'published',
      summary: attentionGapStudents.length
        ? `${attentionGapStudents.length} students need additional teacher follow-up after recent live sessions.`
        : 'No additional student follow-up is required this week.',
      relatedLabel: attentionGapStudents[0]?.fullName || 'Whole class',
    },
  ];

  const sessionReports = sessions.map(session => ({
    id: `rep_${session.id}`,
    title: `${session.title} Session Report`,
    reportType: 'class_session',
    audience: 'teacher',
    date: session.date,
    status: session.alerts >= 3 ? 'pending_review' : 'published',
    summary: `${session.avgEngagement}% engagement and ${session.alerts} alerts recorded during this session.`,
    sessionId: session.id,
    classId: session.classId,
    relatedLabel: session.title,
  }));

  return [...baseReports, ...derivedReports, ...sessionReports]
    .map(report => ({
      ...report,
      reportTypeLabel: reportTypeMap[report.reportType] || 'General',
      dateLabel: formatDate(report.date),
      dateTimeLabel: formatDateTime(report.date),
      statusLabel: report.status === 'pending_review' ? 'Pending Review' : report.status === 'draft' ? 'Draft' : 'Published',
      statusTone: report.status === 'pending_review' ? 'warning' : report.status === 'draft' ? 'gray' : 'stable',
      relatedLabel: report.relatedLabel || report.title,
    }))
    .sort((left, right) => byDateDesc(left.date, right.date));
}

function buildSessionDetails(session, { alerts, notes, students }) {
  const sessionNotes = notes.filter(note => note.sessionId === session.id);
  const sessionAlerts = alerts.filter(alert => {
    if (sessionNotes.some(note => note.studentId === alert.studentId)) return true;
    return alert.createdAt.slice(0, 10) === session.date;
  });
  const relatedStudents = students.filter(student => sessionNotes.some(note => note.studentId === student.id) || sessionAlerts.some(alert => alert.studentId === student.id));
  const timeline = [
    { id: `${session.id}-start`, time: '09:00', title: 'Session started', detail: `${session.title} started for Inclusive Class A.`, tone: 'info' },
    ...sessionAlerts.slice(0, 3).map((alert, index) => ({
      id: `${session.id}-alert-${index}`,
      time: formatTimeOnly(alert.createdAt),
      title: alert.severity === 'critical' ? 'Critical alert detected' : 'Alert detected',
      detail: `${alert.studentName}: ${alert.message}`,
      tone: alert.severity === 'critical' ? 'critical' : 'warning',
    })),
    ...sessionNotes.slice(0, 2).map((note, index) => ({
      id: `${session.id}-note-${index}`,
      time: formatTimeOnly(note.createdAt),
      title: 'Teacher note added',
      detail: note.content,
      tone: 'info',
    })),
    { id: `${session.id}-robot`, time: '09:18', title: 'Robot support executed', detail: session.avgStress >= 35 ? 'Calm mode and repeat instruction were used during the session.' : 'Positive reinforcement and group prompts were used during the session.', tone: 'stable' },
  ];

  return {
    ...session,
    statusLabel: sessionStatusLabel(session),
    statusTone: statusToneFromLabel(sessionStatusLabel(session)),
    dateLabel: formatDate(session.date),
    dateTimeLabel: formatDateTime(session.date),
    overview: `${session.title} delivered ${session.avgEngagement}% engagement with ${session.alerts} monitored alerts across the class.`,
    timeline,
    relatedStudents,
    sessionAlerts,
    sessionNotes,
    robotSummary: session.avgStress >= 35
      ? ['Calm mode activated for stress spikes', 'Repeat instruction used after low attention', 'Teacher alert dispatched for follow-up']
      : ['Positive prompt delivered to whole class', 'Robot maintained active support mode', 'No emergency stop events recorded'],
    metricHistory: Array.from({ length: 8 }, (_, index) => ({
      time: `09:${String(index * 5).padStart(2, '0')}`,
      attention: Math.max(38, Math.min(96, session.avgAttention - 6 + index * 2)),
      engagement: Math.max(42, Math.min(97, session.avgEngagement - 5 + index * 1.8)),
      stress: Math.max(12, Math.min(88, session.avgStress + 6 - index * 1.4)),
    })),
  };
}

async function getTeacherBundle(teacherId) {
  const [classes, rawStudents, rawSessions, rawAlerts, rawReports, searchIndex, rawRecommendations, rawAnalytics, systemStatus] = await Promise.all([
    dataService.getClassesForTeacher(teacherId),
    dataService.getStudentsForTeacher(teacherId),
    dataService.getSessions(),
    dataService.getAlerts(),
    dataService.getReportsForRole('teacher'),
    dataService.getSearchIndex(),
    dataService.getAllRecommendations('teacher'),
    dataService.getClassAnalytics(),
    dataService.getSystemStatus(),
  ]);

  const sessions = rawSessions.filter(session => session.teacherId === teacherId).sort((left, right) => byDateDesc(left.date, right.date));
  const alerts = rawAlerts.filter(alert => rawStudents.some(student => student.id === alert.studentId)).sort((left, right) => byDateDesc(left.createdAt, right.createdAt));
  const teacherNotes = searchIndex.notes
    .filter(note => note.authorRole === 'teacher' && rawStudents.some(student => student.id === note.studentId))
    .map(note => ({
      ...note,
      severity: severityMap[note.importance] || 'Medium',
      severityTone: note.importance === 'high' ? 'critical' : note.importance === 'medium' ? 'warning' : 'stable',
      category: inferNoteCategory(note),
      author: 'Mona Hassan',
      timestampLabel: formatDateTime(note.createdAt),
    }))
    .sort((left, right) => byDateDesc(left.createdAt, right.createdAt));

  const sessionMap = buildStudentSessionMap(sessions, teacherNotes);
  const students = rawStudents
    .map(student => deriveStudentView(student, {
      alerts,
      sessions: sessionMap.get(student.id) || sessions.slice(0, 2),
      notes: teacherNotes,
      recommendations: rawRecommendations,
    }))
    .sort((left, right) => left.fullName.localeCompare(right.fullName));

  return {
    classes,
    students,
    sessions: sessions.map(session => ({
      ...session,
      dateLabel: formatDate(session.date),
      dateTimeLabel: formatDateTime(session.date),
      durationLabel: `${session.durationMinutes} min`,
      statusLabel: sessionStatusLabel(session),
      statusTone: statusToneFromLabel(sessionStatusLabel(session)),
      alertsCount: session.alerts,
    })),
    alerts,
    notes: teacherNotes,
    reports: buildReportCollection({ baseReports: rawReports, sessions, students, alerts }),
    recommendations: rawRecommendations,
    analytics: rawAnalytics,
    systemStatus,
  };
}

export const teacherService = {
  async getTeacherDashboard(teacherId) {
    const bundle = await getTeacherBundle(teacherId);
    return {
      ...bundle,
      metrics: buildTeacherMetrics({ students: bundle.students, sessions: bundle.sessions, alerts: bundle.alerts }),
      priorityStudents: buildPriorityStudents({ students: bundle.students, alerts: bundle.alerts, sessions: bundle.sessions }),
    };
  },

  async getStudentsPage(teacherId) {
    const bundle = await getTeacherBundle(teacherId);
    const asdStudents = bundle.students.filter(student => student.classification === 'ASD');
    const typicalStudents = bundle.students.filter(student => student.classification === 'Typical');
    const needsAttention = bundle.students.filter(student => student.statusTone !== 'stable');
    return {
      ...bundle,
      summary: [
        { label: 'Total students', value: bundle.students.length, trend: `${bundle.classes[0]?.name || 'Class'} active`, status: 'stable' },
        { label: 'ASD students', value: asdStudents.length, trend: 'Structured support', status: 'info' },
        { label: 'Typical students', value: typicalStudents.length, trend: 'Balanced classroom', status: 'stable' },
        { label: 'Need attention', value: needsAttention.length, trend: needsAttention.length ? `${needsAttention.length} need follow-up` : 'No urgent action', status: needsAttention.length ? 'warning' : 'stable' },
      ],
    };
  },

  async getStudentProfile(teacherId, studentId) {
    const bundle = await getTeacherBundle(teacherId);
    const student = bundle.students.find(item => item.id === studentId);
    if (!student) return null;
    const relatedSessions = bundle.sessions.filter(session => bundle.notes.some(note => note.studentId === studentId && note.sessionId === session.id)).slice(0, 4);
    return {
      ...bundle,
      student,
      classRoom: bundle.classes.find(item => item.id === student.classId),
      sessions: relatedSessions.length ? relatedSessions : bundle.sessions.slice(0, 3),
      alerts: bundle.alerts.filter(alert => alert.studentId === studentId),
      notes: bundle.notes.filter(note => note.studentId === studentId),
      recommendations: bundle.recommendations.filter(rec => rec.studentId === studentId).map(rec => ({
        ...rec,
        statusLabel: rec.status === 'active' ? 'Active recommendation' : 'General guidance',
      })),
      trend: Array.from({ length: 7 }, (_, index) => ({
        time: `D${index + 1}`,
        attention: Math.max(42, Math.min(92, student.metrics.attention - 6 + index * 3)),
        engagement: Math.max(40, Math.min(95, student.metrics.engagement - 4 + index * 2.5)),
        stress: Math.max(18, Math.min(84, student.metrics.stress + 4 - index * 1.5)),
      })),
    };
  },

  async getSessionsPage(teacherId) {
    const bundle = await getTeacherBundle(teacherId);
    const thisWeekSessions = bundle.sessions.slice(0, 3);
    return {
      ...bundle,
      summary: [
        { label: 'Total sessions', value: bundle.sessions.length, trend: `${thisWeekSessions.length} this week`, status: 'info' },
        { label: 'Average duration', value: `${avg(bundle.sessions.map(session => session.durationMinutes))} min`, trend: 'Consistent pacing', status: 'stable' },
        { label: 'Avg attention', value: `${avg(bundle.sessions.map(session => session.avgAttention))}%`, trend: 'Class focus trend', status: 'stable' },
        { label: 'Alerts this week', value: bundle.alerts.filter(alert => alert.status === 'active').length, trend: bundle.alerts.filter(alert => alert.status === 'active').length ? 'Needs follow-up' : 'No urgent action', status: bundle.alerts.filter(alert => alert.status === 'active').length ? 'warning' : 'stable' },
      ],
    };
  },

  async getSessionDetails(teacherId, sessionId) {
    const bundle = await getTeacherBundle(teacherId);
    const session = bundle.sessions.find(item => item.id === sessionId);
    if (!session) return null;
    return buildSessionDetails(session, bundle);
  },

  async getAnalyticsPage(teacherId) {
    const bundle = await getTeacherBundle(teacherId);
    const supportStudents = bundle.students.filter(student => student.statusTone !== 'stable');
    const improvingStudents = [...bundle.students]
      .sort((left, right) => (right.metrics.engagement - right.metrics.stress) - (left.metrics.engagement - left.metrics.stress))
      .slice(0, 3);
    return {
      ...bundle,
      summary: [
        { label: 'Avg attention', value: `${avg(bundle.students.map(student => student.metrics.attention))}%`, trend: 'Classwide focus', status: 'stable' },
        { label: 'Avg engagement', value: `${avg(bundle.students.map(student => student.metrics.engagement))}%`, trend: 'Improving participation', status: 'stable' },
        { label: 'Avg stress', value: `${avg(bundle.students.map(student => student.metrics.stress))}%`, trend: supportStudents.length ? `${supportStudents.length} need monitoring` : 'Healthy classroom', status: supportStudents.length ? 'warning' : 'stable' },
        { label: 'Students needing support', value: supportStudents.length, trend: supportStudents.length ? 'Action required' : 'Stable class', status: supportStudents.length ? 'warning' : 'stable' },
      ],
      insight: supportStudents.length
        ? `Engagement is improving, while stress remains elevated for ${supportStudents.length} students.`
        : 'Class engagement is improving and no students currently require urgent follow-up.',
      comparisonData: bundle.students.map(student => ({ name: student.shortName, attention: student.metrics.attention, engagement: student.metrics.engagement, stress: student.metrics.stress })),
      riskDistribution: [
        { label: 'Stable', value: bundle.students.filter(student => student.statusTone === 'stable').length },
        { label: 'Needs follow-up', value: bundle.students.filter(student => student.statusTone === 'warning').length },
        { label: 'High risk', value: bundle.students.filter(student => student.statusTone === 'critical').length },
      ],
      improvingStudents,
      followUpStudents: supportStudents.slice(0, 3),
    };
  },

  async getReportsPage(teacherId) {
    const bundle = await getTeacherBundle(teacherId);
    return {
      ...bundle,
      summary: [
        { label: 'Published reports', value: bundle.reports.filter(report => report.status === 'published').length, trend: 'Ready to share', status: 'stable' },
        { label: 'Weekly reports', value: bundle.reports.filter(report => report.reportTypeLabel === 'Weekly').length, trend: 'Class summaries', status: 'info' },
        { label: 'Session reports', value: bundle.reports.filter(report => report.reportTypeLabel === 'Session').length, trend: 'Live monitoring exports', status: 'info' },
        { label: 'Pending review', value: bundle.reports.filter(report => report.status === 'pending_review').length, trend: bundle.reports.filter(report => report.status === 'pending_review').length ? 'Needs review' : 'All clear', status: bundle.reports.filter(report => report.status === 'pending_review').length ? 'warning' : 'stable' },
      ],
    };
  },

  async getNotesPage(teacherId) {
    const bundle = await getTeacherBundle(teacherId);
    return {
      ...bundle,
      summary: [
        { label: 'Total notes', value: bundle.notes.length, trend: 'Teacher observations', status: 'info' },
        { label: 'High severity', value: bundle.notes.filter(note => note.severity === 'High').length, trend: 'Needs follow-up', status: bundle.notes.filter(note => note.severity === 'High').length ? 'warning' : 'stable' },
        { label: 'Stress notes', value: bundle.notes.filter(note => note.category === 'Stress').length, trend: 'Intervention focus', status: 'warning' },
        { label: 'Recent updates', value: bundle.notes.filter(note => note.createdAt.slice(0, 10) >= '2026-05-24').length, trend: 'Latest week', status: 'info' },
      ],
    };
  },

  async getGuidancePage(teacherId) {
    const bundle = await getTeacherBundle(teacherId);
    const activeAlerts = bundle.alerts.filter(alert => alert.status === 'active');
    const lowAttention = bundle.students.filter(student => student.metrics.attention < 60);
    const elevatedStress = bundle.students.filter(student => student.metrics.stress >= 45);
    let insight = {
      title: 'Positive reinforcement guidance',
      description: 'The class is stable. Reinforce engagement with positive prompts and predictable transitions.',
      tone: 'stable',
      actions: [
        'Use short praise prompts during collaborative work.',
        'Keep transition cues consistent across the class.',
        'Continue monitoring stress signals for early changes.',
      ],
    };

    if (elevatedStress.length) {
      insight = {
        title: 'Stress intervention guidance',
        description: `${elevatedStress.length} students show elevated stress signals. Use calm mode and shorter transitions before stress escalates.`,
        tone: 'warning',
        actions: [
          'Use calm robot mode before group transitions.',
          'Reduce long verbal instructions and add short visual cues.',
          'Document stress triggers in session notes for follow-up.',
        ],
      };
    } else if (lowAttention.length) {
      insight = {
        title: 'Attention support guidance',
        description: `${lowAttention.length} students need additional attention support. Use repeat instruction and shorter task blocks.`,
        tone: 'warning',
        actions: [
          'Break instructions into shorter chunks.',
          'Use repeat instruction when attention drops below threshold.',
          'Redirect using one supportive prompt before escalating alerts.',
        ],
      };
    }

    return {
      ...bundle,
      insight,
      activeAlerts,
      classGuidance: bundle.recommendations.map(rec => ({
        id: rec.id,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        student: bundle.students.find(student => student.id === rec.studentId)?.fullName || 'Assigned student',
      })),
    };
  },

  async getSidebarInsight(teacherId) {
    const page = await this.getGuidancePage(teacherId);
    return {
      title: page.insight.title,
      description: page.insight.description,
      tone: page.insight.tone,
      href: '/teacher/recommendations',
    };
  },
};
