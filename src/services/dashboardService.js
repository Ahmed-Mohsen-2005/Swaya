import { dataService } from './dataService';
import { buildClinicalQueue, buildDoctorMetrics, buildParentSummary, buildPriorityStudents, buildTeacherMetrics } from '../utils/dashboardData';

export const dashboardService = {
  async getTeacherDashboard(teacherId) {
    const [students, sessions, alerts, analytics, systemStatus] = await Promise.all([
      dataService.getStudentsForTeacher(teacherId),
      dataService.getSessions(),
      dataService.getAlerts(),
      dataService.getClassAnalytics(),
      dataService.getSystemStatus(),
    ]);
    const teacherAlerts = alerts.filter(alert => students.some(student => student.id === alert.studentId));
    return {
      students,
      sessions,
      alerts: teacherAlerts,
      metrics: buildTeacherMetrics({ students, sessions, alerts: teacherAlerts }),
      priorityStudents: buildPriorityStudents({ students, alerts: teacherAlerts, sessions }),
      analytics,
      systemStatus: { ...systemStatus, updatedAt: new Date().toISOString() },
      loadedAt: new Date().toISOString(),
    };
  },
  async getDoctorDashboard(doctorId) {
    const [patients, sessions, alerts, reports, analytics, recommendations] = await Promise.all([
      dataService.getPatientsForDoctor(doctorId),
      dataService.getSessions(),
      dataService.getAlerts(),
      dataService.getReportsForRole('doctor'),
      dataService.getClassAnalytics(),
      dataService.getAllRecommendations('teacher'),
    ]);
    const plans = (await Promise.all(patients.map(patient => dataService.getTherapyPlan(patient.id)))).filter(Boolean);
    const doctorAlerts = alerts.filter(alert => patients.some(patient => patient.id === alert.studentId));
    return {
      patients,
      sessions,
      alerts: doctorAlerts,
      reports,
      plans,
      analytics,
      recommendations,
      metrics: buildDoctorMetrics({ patients, reports, plans, recommendations }),
      clinicalQueue: buildClinicalQueue({ patients, alerts: doctorAlerts, sessions }),
      loadedAt: new Date().toISOString(),
    };
  },
  async getParentDashboard(parentId, liveStatus = 'idle', liveMetrics = null) {
    const child = await dataService.getChildForParent(parentId);
    if (!child) return null;
    const [recommendations, reports, sessions] = await Promise.all([
      dataService.getRecommendations(child.id, 'parent'),
      dataService.getReportsForRole('parent', child.id),
      dataService.getSessions(),
    ]);
    const metrics = liveMetrics || child.baselineMetrics;
    return {
      child,
      recommendations,
      reports,
      sessions,
      metrics,
      summary: buildParentSummary({ child, recommendations, liveStatus, metrics }),
      loadedAt: new Date().toISOString(),
    };
  },
};
