import { create } from 'zustand';
import { initializeMetrics, nextMetrics, calculateClassMetrics, createAlerts, robotEffectFor } from '../simulation/simulationEngine';
const nowTime = () => new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
const timeline = (type,title,description,studentId) => ({ id:`evt_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, type, title, description, studentId, timestamp:nowTime() });
let intervalRef = null;
export const useLiveSessionStore = create((set,get)=>({
  status:'idle', sessionId:null, classId:null, className:'', teacherId:null, students:[], tick:0, startedAt:null,
  selectedScenario:'normal', targetStudentId:null, affectedIds:[], focusedStudentId:null,
  currentStudentMetrics:{}, currentClassMetrics:{attention:0,engagement:0,stress:0,socialInteraction:0}, metricHistory:[], alerts:[], robotActions:[], timelineEvents:[], robotState:{mode:'Standby', target:'Whole Class', effect:'Waiting'}, robotEffects:{},
  startSession: ({classId,className,teacherId,students}) => {
    if(intervalRef) clearInterval(intervalRef);
    const sessionId = `live_${Date.now()}`;
    const currentStudentMetrics = initializeMetrics(students);
    const currentClassMetrics = calculateClassMetrics(currentStudentMetrics);
    set({status:'active', sessionId, classId, className, teacherId, students, tick:0, startedAt:new Date().toISOString(), currentStudentMetrics, currentClassMetrics, alerts:[], robotActions:[], metricHistory:[{time:nowTime(),...currentClassMetrics}], timelineEvents:[timeline('session_started','Session Started',`${className} live session started.`)], robotState:{mode:'Active', target:'Whole Class', effect:'Monitoring'}});
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
