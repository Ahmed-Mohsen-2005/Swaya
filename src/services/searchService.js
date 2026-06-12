import { dataService } from './dataService';

const includes = (value, query) => String(value || '').toLowerCase().includes(query.toLowerCase());

export const searchService = {
  async search(query, role = 'teacher') {
    if (!query.trim()) return [];
    const { students, sessions, reports, notes, alerts, recommendations } = await dataService.getSearchIndex();
    const results = [];
    const add = (category, title, description, href, keywords = '') => {
      if ([title, description, keywords].some(value => includes(value, query))) results.push({ category, title, description, href });
    };

    students.forEach(student => {
      const base = role === 'doctor' ? `/doctor/patients/${student.id}` : `/teacher/students/${student.id}`;
      add('Students', student.fullName, `${student.classification} ${student.autismLevel}`, base, `${student.shortName} ${student.status}`);
    });
    sessions.forEach(session => add('Sessions', session.title, `${session.date} · ${session.durationMinutes} min`, role === 'teacher' ? `/teacher/sessions/${session.id}` : '/parent/sessions', session.status));
    reports.forEach(report => add('Reports', report.title, report.summary, role === 'parent' ? '/parent/reports' : role === 'doctor' ? '/doctor/reports' : '/teacher/reports', report.status));
    notes.forEach(note => add('Notes', note.content, note.authorRole, role === 'teacher' ? '/teacher/notes' : '/doctor/timeline', note.importance));
    alerts.forEach(alert => add('Alerts', alert.message, `${alert.studentName} · ${alert.severity}`, role === 'doctor' ? `/doctor/patients/${alert.studentId}` : `/teacher/students/${alert.studentId}`, alert.type));
    recommendations.forEach(rec => add('Recommendations', rec.title, rec.description, role === 'parent' ? '/parent/recommendations' : role === 'doctor' ? '/doctor/recommendations' : `/teacher/students/${rec.studentId}`, rec.category));
    [
      ['Pages', 'Dashboard', 'Role overview', role === 'doctor' ? '/doctor/dashboard' : role === 'parent' ? '/parent/dashboard' : '/teacher/dashboard'],
      ['Pages', 'Analytics', 'Trends and comparisons', role === 'doctor' ? '/doctor/analytics' : role === 'parent' ? '/parent/progress' : '/teacher/analytics'],
      ['Pages', 'Notifications', 'System updates and alerts', '/notifications'],
    ].forEach(item => add(...item));

    return results.slice(0, 8);
  },
};
