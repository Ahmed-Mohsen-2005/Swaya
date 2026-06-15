import { create } from 'zustand';
import { initializeMetrics, nextMetrics, calculateClassMetrics, createAlerts, robotEffectFor } from '../simulation/simulationEngine';
import { students as mockStudents } from '../data/mockData';
const nowTime = () => new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit', hour12:false});
const timeline = (type,title,description,studentId) => ({ id:`evt_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, type, title, description, studentId, timestamp:nowTime() });
let intervalRef = null;
const demoStudents = mockStudents.filter(student => ['stu_001', 'stu_006', 'stu_002'].includes(student.id));
const demoMetricHistory = [
  { time: '09:00', attention: 64, engagement: 67, stress: 36 },
  { time: '09:05', attention: 68, engagement: 70, stress: 33 },
  { time: '09:10', attention: 71, engagement: 73, stress: 30 },
  { time: '09:15', attention: 69, engagement: 72, stress: 34 },
  { time: '09:20', attention: 74, engagement: 76, stress: 28 },
  { time: '09:25', attention: 76, engagement: 78, stress: 25 },
];
const demoStudentMetrics = {
  stu_001: { attention: 70, engagement: 73, stress: 31, socialInteraction: 58, emotionalState: 'engaged' },
  stu_006: { attention: 46, engagement: 48, stress: 62, socialInteraction: 44, emotionalState: 'anxious' },
  stu_002: { attention: 72, engagement: 74, stress: 29, socialInteraction: 61, emotionalState: 'calm' },
};
const demoClassMetrics = { attention: 70, engagement: 73, stress: 31, socialInteraction: 54 };
const demoAlerts = [
  { id: 'live_demo_alert_1', sessionId: 'live_demo', classId: 'class_001', studentId: 'stu_001', studentName: 'Abdullah Ali', type: 'transition_stress', severity: 'medium', status: 'active', message: 'Mild stress increase during activity transition.', suggestedAction: 'Calm Mode', createdAt: '2026-06-15T09:05:00Z' },
  { id: 'live_demo_alert_2', sessionId: 'live_demo', classId: 'class_001', studentId: 'stu_006', studentName: 'Noor A.', type: 'low_attention', severity: 'warning', status: 'active', message: 'Attention dropped after long verbal instructions.', suggestedAction: 'Repeat Instruction', createdAt: '2026-06-15T09:12:00Z' },
  { id: 'live_demo_alert_3', sessionId: 'live_demo', classId: 'class_001', studentId: 'stu_001', studentName: 'Abdullah Ali', type: 'robot_success', severity: 'info', status: 'active', message: 'Calm mode was activated successfully.', suggestedAction: 'Continue monitoring', createdAt: '2026-06-15T09:15:00Z' },
];
const demoTimelineEvents = [
  { id: 'live_demo_evt_1', type: 'session_started', title: 'Session Started', description: 'Live class session started.', timestamp: '09:05' },
  { id: 'live_demo_evt_2', type: 'robot_action', title: 'Robot Action', description: 'Calm mode activated.', studentId: 'stu_001', timestamp: '09:08' },
  { id: 'live_demo_evt_3', type: 'metric_update', title: 'Engagement Improved', description: 'Abdullah engagement improved.', studentId: 'stu_001', timestamp: '09:12' },
  { id: 'live_demo_evt_4', type: 'alert_created', title: 'Mild Stress Alert', description: 'Mild stress increase during transition.', studentId: 'stu_001', timestamp: '09:15' },
];
export const useLiveSessionStore = create((set,get)=>({
  status:'idle', sessionId:'live_demo', classId:'class_001', className:'Inclusive Class A', teacherId:null, students:demoStudents, tick:7, startedAt:null,
  selectedScenario:'normal', targetStudentId:'stu_001', affectedIds:[], focusedStudentId:'stu_001',
  currentStudentMetrics:demoStudentMetrics, currentClassMetrics:demoClassMetrics, metricHistory:demoMetricHistory, alerts:demoAlerts, robotActions:[], timelineEvents:demoTimelineEvents, robotState:{mode:'Standby', target:'Whole Class', effect:'Demo monitoring'}, robotEffects:{},
  startSession: ({classId,className,teacherId,students}) => {
    if(intervalRef) clearInterval(intervalRef);
    const sessionId = `live_${Date.now()}`;
    const sessionStudents = students?.length ? students : demoStudents;
    const currentStudentMetrics = initializeMetrics(sessionStudents);
    const currentClassMetrics = calculateClassMetrics(currentStudentMetrics);
    set({status:'active', sessionId, classId, className, teacherId, students:sessionStudents, tick:0, startedAt:new Date().toISOString(), currentStudentMetrics, currentClassMetrics, alerts:[], robotActions:[], metricHistory:[...demoMetricHistory.slice(-3), {time:nowTime(),...currentClassMetrics}], timelineEvents:[timeline('session_started','Session Started',`${className} live session started.`)], robotState:{mode:'Active', target:'Whole Class', effect:'Monitoring'}});
    intervalRef = setInterval(()=>get().step(), 2000);
  },
  pauseSession: () => set({status:'paused', timelineEvents:[...get().timelineEvents, timeline('session_paused','Session Paused','Teacher paused live simulation.')] }),
  resumeSession: () => set({status:'active', timelineEvents:[...get().timelineEvents, timeline('session_resumed','Session Resumed','Teacher resumed live simulation.')] }),
  endSession: () => { if(intervalRef) clearInterval(intervalRef); set({status:'ended', timelineEvents:[...get().timelineEvents, timeline('session_ended','Session Ended','Class session ended and summary is ready.')]}); },
  setScenario: (selectedScenario,targetStudentId) => {
    const st = get().students;
    const affectedIds = selectedScenario === 'low_engagement_group' || selectedScenario === 'multiple_alerts' ? st.filter(s=>s.id!==targetStudentId).slice(0,2).map(s=>s.id) : [];
    set({selectedScenario,targetStudentId,affectedIds, timelineEvents:[...get().timelineEvents, timeline('scenario_changed','Scenario Changed',selectedScenario.replaceAll('_',' '),targetStudentId)]});
  },
  focusStudent: (id) => set({focusedStudentId:id, timelineEvents:[...get().timelineEvents, timeline('student_focus','Student Focus Opened',`Teacher focused on ${get().students.find(s=>s.id===id)?.fullName || 'student'}.`,id)]}),
  clearFocus: () => set({focusedStudentId:null}),
  step: () => {
    const state = get(); if(state.status !== 'active') return;
    const currentStudentMetrics = nextMetrics({students:state.students,currentMetrics:state.currentStudentMetrics,scenarioId:state.selectedScenario,targetStudentId:state.targetStudentId,affectedIds:state.affectedIds,robotEffects:state.robotEffects});
    const currentClassMetrics = calculateClassMetrics(currentStudentMetrics);
    const newAlerts = createAlerts({studentMetrics:currentStudentMetrics, students:state.students, sessionId:state.sessionId, classId:state.classId, existingAlerts:state.alerts});
    const alertEvents = newAlerts.map(a => timeline('alert_created', a.type.replace('_',' '), `${a.studentName}: ${a.message}`, a.studentId));
    const point = {time:nowTime(), ...currentClassMetrics};
    const robotEffects = state.robotEffects; // decay after every tick by keeping only if no safe yet
    set({
      tick:state.tick+1, currentStudentMetrics, currentClassMetrics,
      alerts:[...state.alerts,...newAlerts], metricHistory:[...state.metricHistory.slice(-16), point],
      timelineEvents:[...state.timelineEvents, ...alertEvents].slice(-20), robotEffects
    });
  },
  markAlertHandled: (id) => set({alerts:get().alerts.map(a=>a.id===id?{...a,status:'handled'}:a), timelineEvents:[...get().timelineEvents,timeline('alert_handled','Alert Handled','Teacher marked alert as handled.')] }),
  runRobotAction: (action, targetType='student') => {
    const state = get();
    const targetStudentId = targetType==='student' ? (state.focusedStudentId || state.targetStudentId || state.students[0]?.id) : null;
    const effects = robotEffectFor(action,targetStudentId,state.students);
    const robotAction = {id:`ra_${Date.now()}`, actionType:action, targetType, targetId:targetStudentId||state.classId, createdAt:new Date().toISOString()};
    const label = action.replaceAll('_',' ');
    set({robotEffects:effects, robotActions:[...state.robotActions,robotAction], robotState:{mode:label, target:targetStudentId ? state.students.find(s=>s.id===targetStudentId)?.fullName : 'Whole Class', effect: action==='calm_mode'?'Stress decreasing':action==='change_activity'?'Attention improving':'Support active'}, timelineEvents:[...state.timelineEvents, timeline('robot_action','Robot Action',`${label} activated.`,targetStudentId)]});
  }
}));
