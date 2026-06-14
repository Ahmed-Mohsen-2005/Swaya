import { dataService } from './dataService';
import { therapyPlans, students as allStudents } from '../data/mockData';
import { displayName, formatReportType, formatStatus, localizedValue, shortDisplayName } from '../utils/localization';

const includes = (value, query) => String(value || '').toLowerCase().includes(query.toLowerCase());

const classificationLabel = (student, language) => {
  if (language !== 'ar') return `${student.classification} · ${student.autismLevel}`;
  const classification = student.classification === 'ASD' ? 'اضطراب طيف التوحد' : 'نمطي';
  const levels = { mild: 'بسيط', moderate: 'متوسط', severe: 'شديد', not_applicable: 'غير منطبق' };
  return `${classification} · ${levels[student.autismLevel] || student.autismLevel}`;
};

const durationLabel = (minutes, language) => language === 'ar' ? `${minutes} دقيقة` : `${minutes} min`;

export const searchService = {
  async search(query, role = 'teacher', language = 'en') {
    if (!query.trim()) return [];
    const { students, sessions, reports, notes, alerts, recommendations } = await dataService.getSearchIndex();
    const studentById = new Map(students.map(student => [student.id, student]));
    const results = [];
    const add = (category, title, description, href, keywords = '') => {
      if ([title, description, keywords].some(value => includes(value, query))) results.push({ category, title, description, href });
    };

    students.forEach(student => {
      const base = role === 'doctor' ? `/doctor/patients/${student.id}` : `/teacher/students/${student.id}`;
      const category = role === 'doctor' ? 'Patients' : 'Students';
      add(category, displayName(student, language), classificationLabel(student, language), base, `${student.fullName} ${displayName(student, 'ar')} ${student.shortName} ${shortDisplayName(student, 'ar')} ${student.status}`);
    });
    sessions.forEach(session => add('Sessions', localizedValue(session.title, language), `${session.date} · ${durationLabel(session.durationMinutes, language)}`, role === 'teacher' ? `/teacher/sessions/${session.id}` : '/parent/sessions', session.status));
    reports.forEach(report => add('Reports', localizedValue(report.title, language), `${formatReportType(report.reportType, language)} · ${formatStatus(report.status, language)}`, role === 'parent' ? '/parent/reports' : role === 'doctor' ? '/doctor/reports' : '/teacher/reports', `${report.status} ${report.reportType} ${localizedValue(report.summary, language)}`));
    notes.forEach(note => add('Notes', note.content, note.authorRole, role === 'teacher' ? '/teacher/notes' : '/doctor/timeline', note.importance));
    alerts.forEach(alert => {
      const student = studentById.get(alert.studentId);
      const severity = language === 'ar' ? ({ critical: 'حرج', warning: 'تنبيه', info: 'معلومة' }[alert.severity] || alert.severity) : alert.severity;
      add('Alerts', alert.message, `${displayName(student, language) || alert.studentName} · ${severity}`, role === 'doctor' ? `/doctor/patients/${alert.studentId}` : `/teacher/students/${alert.studentId}`, `${alert.type} ${alert.studentName} ${displayName(student, 'ar')}`);
    });
    recommendations.forEach(rec => add('Recommendations', localizedValue(rec.title, language), localizedValue(rec.description, language), role === 'parent' ? '/parent/recommendations' : role === 'doctor' ? '/doctor/recommendations' : '/teacher/recommendations', rec.category));
    if (role === 'doctor') {
      therapyPlans.forEach(plan => {
        const patient = allStudents.find(student => student.id === plan.studentId);
        if (!patient) return;
        add('Therapy Plans', `${displayName(patient, language)} ${language === 'ar' ? 'الخطة العلاجية' : 'therapy plan'}`, plan.goals.map(goal => localizedValue(goal.title, language)).join(' '), `/doctor/therapy-plans/${patient.id}`, `${patient.fullName} ${displayName(patient, 'ar')}`);
      });
      add('Timeline', language === 'ar' ? 'الخط الزمني السلوكي' : 'Behavior timeline', language === 'ar' ? 'أحداث سريرية وتنبيهات وملاحظات' : 'Clinical events, alerts, and notes', '/doctor/timeline');
    }
    [
      ['Pages', 'Dashboard', 'Role overview', role === 'doctor' ? '/doctor/dashboard' : role === 'parent' ? '/parent/dashboard' : '/teacher/dashboard'],
      ['Pages', 'Analytics', 'Trends and comparisons', role === 'doctor' ? '/doctor/analytics' : role === 'parent' ? '/parent/progress' : '/teacher/analytics'],
      ['Pages', 'Guidance', 'Intervention recommendations and follow-up', role === 'teacher' ? '/teacher/recommendations' : role === 'doctor' ? '/doctor/recommendations' : '/parent/recommendations'],
      ['Pages', 'Notifications', 'System updates and alerts', '/notifications'],
    ].forEach(item => add(...item));

    return results.slice(0, 8);
  },
};
