import { mockRepository } from '../repositories/mock/mockRepository';
export const dataService = {
  getClassesForTeacher: mockRepository.getClassesForTeacher,
  getClassById: mockRepository.getClassById,
  getStudentsByClass: mockRepository.getStudentsByClass,
  getStudentsForTeacher: mockRepository.getStudentsForTeacher,
  getPatientsForDoctor: mockRepository.getPatientsForDoctor,
  getChildForParent: mockRepository.getChildForParent,
  getStudentById: mockRepository.getStudentById,
  getSessions: mockRepository.getSessions,
  getReportsForStudent: mockRepository.getReportsForStudent,
  getReportsForRole: mockRepository.getReportsForRole,
  getNotesForStudent: mockRepository.getNotesForStudent,
  getTherapyPlan: mockRepository.getTherapyPlan,
  getRecommendations: mockRepository.getRecommendations,
  getAllRecommendations: mockRepository.getAllRecommendations,
  getAlerts: mockRepository.getAlerts,
  getClassAnalytics: mockRepository.getClassAnalytics,
  getParentProgress: mockRepository.getParentProgress,
  getSystemStatus: mockRepository.getSystemStatus,
  getNotifications: mockRepository.getNotifications,
  getSearchIndex: mockRepository.getSearchIndex
};
