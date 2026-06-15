import { users, classes, students, sessions, reports, notes, therapyPlans, recommendations, alerts, classAnalytics, parentProgress, systemStatus, notifications } from '../../data/mockData';
const resolve = (v) => Promise.resolve(v);
export const mockRepository = {
  login: async (email, password, role) => resolve(users.find(u => u.email === email && u.password === password && u.role === role) || null),
  getUser: async (id) => resolve(users.find(u => u.id === id)),
  getClassesForTeacher: async (teacherId) => resolve(classes.filter(c => c.teacherIds.includes(teacherId))),
  getClassById: async (id) => resolve(classes.find(c => c.id === id)),
  getStudentsByClass: async (classId) => resolve(students.filter(s => s.classId === classId)),
  getStudentsForTeacher: async (teacherId) => resolve(students.filter(s => s.teacherIds.includes(teacherId))),
  getPatientsForDoctor: async (doctorId) => resolve(students.filter(s => s.doctorIds.includes(doctorId))),
  getChildForParent: async (parentId) => resolve(students.find(s => s.parentIds.includes(parentId))),
  getStudentById: async (id) => resolve(students.find(s => s.id === id)),
  getSessions: async () => resolve(sessions),
  getReportsForStudent: async (studentId) => resolve(reports.filter(r => r.studentId === studentId)),
  getReportsForRole: async (role, studentId) => resolve(reports.filter(r => role === 'parent' ? r.audience === 'parent' && r.studentId === studentId : r.audience === role || r.audience === 'teacher')),
  getNotesForStudent: async (studentId) => resolve(notes.filter(n => n.studentId === studentId)),
  getTherapyPlan: async (studentId) => resolve(therapyPlans.find(p => p.studentId === studentId)),
  getRecommendations: async (studentId, audience) => resolve(recommendations.filter(r => r.studentId === studentId && (!audience || r.audience === audience))),
  getAllRecommendations: async (audience) => resolve(recommendations.filter(r => !audience || r.audience === audience)),
  getAlerts: async () => resolve(alerts),
  getClassAnalytics: async () => resolve(classAnalytics),
  getParentProgress: async (studentId) => resolve(parentProgress[studentId] || null),
  getSystemStatus: async () => resolve(systemStatus),
  getNotifications: async () => resolve(notifications),
  getSearchIndex: async () => resolve({ users, classes, students, sessions, reports, notes, alerts, recommendations })
};
