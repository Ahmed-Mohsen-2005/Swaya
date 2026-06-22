import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { useAuthStore } from './store/authStore';
import { canAccess } from './utils/permissions';
import { I18nProvider } from './i18n';
import './styles.css';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import NotAuthorized from './pages/NotAuthorized';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherLiveSession from './pages/teacher/TeacherLiveSession';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherStudentProfile from './pages/teacher/TeacherStudentProfile';
import TeacherSessions from './pages/teacher/TeacherSessions';
import TeacherSessionDetails from './pages/teacher/TeacherSessionDetails';
import TeacherStudyPlan from './pages/teacher/TeacherStudyPlan';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import TeacherReports from './pages/teacher/TeacherReports';
import TeacherNotes from './pages/teacher/TeacherNotes';
import TeacherGuidance from './pages/teacher/TeacherGuidance';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPatientProfile from './pages/doctor/DoctorPatientProfile';
import DoctorAnalytics from './pages/doctor/DoctorAnalytics';
import DoctorTherapyPlans from './pages/doctor/DoctorTherapyPlans';
import DoctorReports from './pages/doctor/DoctorReports';
import DoctorRecommendations from './pages/doctor/DoctorRecommendations';
import DoctorTimeline from './pages/doctor/DoctorTimeline';
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentProgress from './pages/parent/ParentProgress';
import ParentReports from './pages/parent/ParentReports';
import ParentRecommendations from './pages/parent/ParentRecommendations';
import ParentSessions from './pages/parent/ParentSessions';
import ParentMessages from './pages/parent/ParentMessages';
import { AccountPlaceholder } from './pages/AccountPlaceholder';
import Notifications from './pages/Notifications';

const savedLanguage = localStorage.getItem('language') || localStorage.getItem('i18nextLng') || 'ar';
document.documentElement.lang = savedLanguage === 'en' ? 'en' : 'ar';
document.documentElement.dir = savedLanguage === 'en' ? 'ltr' : 'rtl';

function Protected(){ const {user}=useAuthStore(); const loc=useLocation(); if(!user) return <Navigate to="/login" replace/>; if(!canAccess(user, loc.pathname)) return <Navigate to="/not-authorized" replace/>; return <AppLayout/> }
function RoleIndex(){ const {user}=useAuthStore(); return <Navigate to={user?.role==='teacher'?'/teacher/dashboard':user?.role==='doctor'?'/doctor/dashboard':'/parent/dashboard'} replace/> }
createRoot(document.getElementById('root')).render(<React.StrictMode><I18nProvider><BrowserRouter><Routes><Route path="/" element={<Welcome/>}/><Route path="/login" element={<Login/>}/><Route path="/not-authorized" element={<NotAuthorized/>}/><Route element={<Protected/>}><Route path="/app" element={<RoleIndex/>}/><Route path="/profile" element={<AccountPlaceholder type="profile"/>}/><Route path="/settings/account" element={<AccountPlaceholder type="account"/>}/><Route path="/settings/security" element={<AccountPlaceholder type="security"/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace/>}/><Route path="/teacher/dashboard" element={<TeacherDashboard/>}/><Route path="/teacher/live-session" element={<TeacherLiveSession/>}/><Route path="/teacher/study-plan" element={<TeacherStudyPlan/>}/><Route path="/teacher/students" element={<TeacherStudents/>}/><Route path="/teacher/students/:studentId" element={<TeacherStudentProfile/>}/><Route path="/teacher/sessions" element={<TeacherSessions/>}/><Route path="/teacher/sessions/:sessionId" element={<TeacherSessionDetails/>}/><Route path="/teacher/analytics" element={<TeacherAnalytics/>}/><Route path="/teacher/reports" element={<TeacherReports/>}/><Route path="/teacher/notes" element={<TeacherNotes/>}/><Route path="/teacher/recommendations" element={<TeacherGuidance/>}/><Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace/>}/><Route path="/doctor/dashboard" element={<DoctorDashboard/>}/><Route path="/doctor/patients" element={<DoctorPatients/>}/><Route path="/doctor/patients/:studentId" element={<DoctorPatientProfile/>}/><Route path="/doctor/analytics" element={<DoctorAnalytics/>}/><Route path="/doctor/therapy-plans" element={<DoctorTherapyPlans/>}/><Route path="/doctor/therapy-plans/:studentId" element={<DoctorTherapyPlans/>}/><Route path="/doctor/reports" element={<DoctorReports/>}/><Route path="/doctor/recommendations" element={<DoctorRecommendations/>}/><Route path="/doctor/timeline" element={<DoctorTimeline/>}/><Route path="/parent" element={<Navigate to="/parent/dashboard" replace/>}/><Route path="/parent/dashboard" element={<ParentDashboard/>}/><Route path="/parent/progress" element={<ParentProgress/>}/><Route path="/parent/reports" element={<ParentReports/>}/><Route path="/parent/recommendations" element={<ParentRecommendations/>}/><Route path="/parent/sessions" element={<ParentSessions/>}/><Route path="/parent/messages" element={<ParentMessages/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></BrowserRouter></I18nProvider></React.StrictMode>);
