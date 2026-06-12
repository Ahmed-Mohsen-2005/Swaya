import { users, classes, students, sessions, reports, notes, therapyPlans, recommendations, alerts, classAnalytics, parentProgress, systemStatus, notifications } from '../../data/mockData';
const delay = (v) => new Promise(r => setTimeout(() => r(v), 120));
export const mockRepository = {
  login: async (email, password, role) => delay(users.find(u => u.email === email && u.password === password && u.role === role) || null),
  getUser: async (id) => delay(users.find(u => u.id === id)),
  getClassesForTeacher: async (teacherId) => delay(classes.filter(c => c.teacherIds.includes(teacherId))),
  getClassById: async (id) => delay(classes.find(c => c.id === id)),
  getStudentsByClass: async (classId) => delay(students.filter(s => s.classId === classId)),
  getStudentsForTeacher: async (teacherId) => delay(students.filter(s => s.teacherIds.includes(teacherId))),
  getPatientsForDoctor: async (doctorId) => delay(students.filter(s => s.doctorIds.includes(doctorId))),
  getChildForParent: async (parentId) => delay(students.find(s => s.parentIds.includes(parentId))),
  getStudentById: async (id) => delay(students.find(s => s.id === id)),
  getSessions: async () => delay(sessions),
  getReportsForStudent: async (studentId) => delay(reports.filter(r => r.studentId === studentId)),
  getReportsForRole: async (role, studentId) => delay(reports.filter(r => role === 'parent' ? r.audience === 'parent' && r.studentId === studentId : r.audience === role || r.audience === 'teacher')),
  getNotesForStudent: async (studentId) => delay(notes.filter(n => n.studentId === studentId)),
  getTherapyPlan: async (studentId) => delay(therapyPlans.find(p => p.studentId === studentId)),
  getRecommendations: async (studentId, audience) => delay(recommendations.filter(r => r.studentId === studentId && (!audience || r.audience === audience))),
  getAllRecommendations: async (audience) => delay(recommendations.filter(r => !audience || r.audience === audience)),
  getAlerts: async () => delay(alerts),
  getClassAnalytics: async () => delay(classAnalytics),
  getParentProgress: async (studentId) => delay(parentProgress[studentId] || null),
  getSystemStatus: async () => delay(systemStatus),
  getNotifications: async () => delay(notifications),
  getSearchIndex: async () => delay({ users, classes, students, sessions, reports, notes, alerts, recommendations })
};
