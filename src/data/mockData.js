export const users = [
  { id:'user_teacher_001', name:{ en:'Mona Hassan', ar:'\u0645\u0646\u0649 \u062d\u0633\u0646' }, fullName:'Mona Hassan', email:'teacher@swaya.demo', password:'demo123', role:'teacher', linkedClassIds:['class_001'], linkedStudentIds:['stu_001','stu_002','stu_003','stu_004','stu_005','stu_006','stu_007','stu_008'] },
  { id:'user_doctor_001', name:{ en:'Dr. Ahmed Sami', ar:'\u062f. \u0623\u062d\u0645\u062f \u0633\u0627\u0645\u064a' }, fullName:'Dr. Ahmed Sami', email:'doctor@swaya.demo', password:'demo123', role:'doctor', linkedStudentIds:['stu_001','stu_002','stu_006','stu_008'] },
  { id:'user_parent_001', name:{ en:"Abdullah's Parent", ar:'\u0648\u0644\u064a \u0623\u0645\u0631 \u0639\u0628\u062f\u0627\u0644\u0644\u0647' }, fullName:"Abdullah's Parent", email:'parent@swaya.demo', password:'demo123', role:'parent', linkedStudentIds:['stu_001'] }
];
export const classes = [{ id:'class_001', name:'Inclusive Class A', grade:'Grade 3', schoolName:'SWAYA Demo School', teacherIds:['user_teacher_001'], studentIds:['stu_001','stu_002','stu_003','stu_004','stu_005','stu_006','stu_007','stu_008'], status:'active' }];
export const students = [
  { id:'stu_001', name:{ en:'Abdullah Ali', ar:'\u0639\u0628\u062f\u0627\u0644\u0644\u0647 \u0639\u0644\u064a' }, shortNameLocalized:{ en:'Abdullah', ar:'\u0639\u0628\u062f\u0627\u0644\u0644\u0647' }, fullName:'Abdullah Ali', shortName:'Abdullah', age:8, gender:'male', classification:'ASD', autismLevel:'moderate', classId:'class_001', parentIds:['user_parent_001'], teacherIds:['user_teacher_001'], doctorIds:['user_doctor_001'], status:'needs_attention', avatar:'\u{1F9D2}', baselineMetrics:{attention:64,engagement:58,stress:38,socialInteraction:48}},
  { id:'stu_002', name:{ en:'Sara M.', ar:'\u0633\u0627\u0631\u0629 \u0645\u062d\u0645\u062f' }, shortNameLocalized:{ en:'Sara', ar:'\u0633\u0627\u0631\u0629' }, fullName:'Sara M.', shortName:'Sara', age:8, gender:'female', classification:'ASD', autismLevel:'mild', classId:'class_001', parentIds:[], teacherIds:['user_teacher_001'], doctorIds:['user_doctor_001'], status:'stable', avatar:'\u{1F467}', baselineMetrics:{attention:66,engagement:61,stress:35,socialInteraction:52}},
  { id:'stu_003', name:{ en:'Omar H.', ar:'\u0639\u0645\u0631 \u062d\u0633\u0646' }, shortNameLocalized:{ en:'Omar', ar:'\u0639\u0645\u0631' }, fullName:'Omar H.', shortName:'Omar', age:9, gender:'male', classification:'Typical', autismLevel:'not_applicable', classId:'class_001', parentIds:[], teacherIds:['user_teacher_001'], doctorIds:[], status:'stable', avatar:'\u{1F466}', baselineMetrics:{attention:78,engagement:82,stress:24,socialInteraction:75}},
  { id:'stu_004', name:{ en:'Layla K.', ar:'\u0644\u064a\u0644\u0649 \u062e\u0627\u0644\u062f' }, shortNameLocalized:{ en:'Layla', ar:'\u0644\u064a\u0644\u0649' }, fullName:'Layla K.', shortName:'Layla', age:8, gender:'female', classification:'ASD', autismLevel:'mild', classId:'class_001', parentIds:[], teacherIds:['user_teacher_001'], doctorIds:[], status:'stable', avatar:'\u{1F467}', baselineMetrics:{attention:70,engagement:76,stress:28,socialInteraction:63}},
  { id:'stu_005', name:{ en:'Youssef T.', ar:'\u064a\u0648\u0633\u0641 \u0637\u0627\u0631\u0642' }, shortNameLocalized:{ en:'Youssef', ar:'\u064a\u0648\u0633\u0641' }, fullName:'Youssef T.', shortName:'Youssef', age:9, gender:'male', classification:'Typical', autismLevel:'not_applicable', classId:'class_001', parentIds:[], teacherIds:['user_teacher_001'], doctorIds:[], status:'stable', avatar:'\u{1F466}', baselineMetrics:{attention:69,engagement:72,stress:30,socialInteraction:70}},
  { id:'stu_006', name:{ en:'Noor A.', ar:'\u0646\u0648\u0631 \u0623\u062d\u0645\u062f' }, shortNameLocalized:{ en:'Noor', ar:'\u0646\u0648\u0631' }, fullName:'Noor A.', shortName:'Noor', age:8, gender:'female', classification:'ASD', autismLevel:'moderate', classId:'class_001', parentIds:[], teacherIds:['user_teacher_001'], doctorIds:['user_doctor_001'], status:'needs_attention', avatar:'\u{1F467}', baselineMetrics:{attention:55,engagement:52,stress:50,socialInteraction:43}},
  { id:'stu_007', name:{ en:'Ibrahim S.', ar:'\u0625\u0628\u0631\u0627\u0647\u064a\u0645 \u0633\u0627\u0645\u064a' }, shortNameLocalized:{ en:'Ibrahim', ar:'\u0625\u0628\u0631\u0627\u0647\u064a\u0645' }, fullName:'Ibrahim S.', shortName:'Ibrahim', age:9, gender:'male', classification:'Typical', autismLevel:'not_applicable', classId:'class_001', parentIds:[], teacherIds:['user_teacher_001'], doctorIds:[], status:'stable', avatar:'\u{1F466}', baselineMetrics:{attention:75,engagement:77,stress:22,socialInteraction:72}},
  { id:'stu_008', name:{ en:'Hana M.', ar:'\u0647\u0646\u0627 \u0645\u062d\u0645\u0648\u062f' }, shortNameLocalized:{ en:'Hana', ar:'\u0647\u0646\u0627' }, fullName:'Hana M.', shortName:'Hana', age:8, gender:'female', classification:'ASD', autismLevel:'mild', classId:'class_001', parentIds:[], teacherIds:['user_teacher_001'], doctorIds:['user_doctor_001'], status:'stable', avatar:'\u{1F467}', baselineMetrics:{attention:66,engagement:70,stress:29,socialInteraction:60}}
];
export const sessions = [
  {id:'sess_101', classId:'class_001', teacherId:'user_teacher_001', title:'Morning Social Activity', date:'2026-05-20', durationMinutes:35, status:'ended', avgAttention:70, avgEngagement:74, avgStress:32, alerts:2},
  {id:'sess_102', classId:'class_001', teacherId:'user_teacher_001', title:'Group Reading', date:'2026-05-21', durationMinutes:40, status:'ended', avgAttention:67, avgEngagement:69, avgStress:38, alerts:3},
  {id:'sess_103', classId:'class_001', teacherId:'user_teacher_001', title:'Interactive Story', date:'2026-05-22', durationMinutes:38, status:'ended', avgAttention:76, avgEngagement:79, avgStress:27, alerts:1},
  {id:'sess_104', classId:'class_001', teacherId:'user_teacher_001', title:'Collaborative Puzzle', date:'2026-05-25', durationMinutes:42, status:'ended', avgAttention:72, avgEngagement:78, avgStress:34, alerts:3}
];
export const reports = [
  {id:'rep_001', studentId:'stu_001', title:"Abdullah's Weekly Progress Summary", reportType:'weekly_parent', audience:'parent', date:'2026-05-26', status:'published', summary:'Abdullah showed better participation this week and responded well to calming support.', metrics:{attention:68, engagement:72, stress:38, socialInteraction:55}},
  {id:'rep_002', studentId:'stu_001', title:'Clinical Behavior Analysis', reportType:'clinical', audience:'doctor', date:'2026-05-25', status:'draft', summary:'Stress events appear linked to group transition activities.', metrics:{attention:64, engagement:58, stress:45, socialInteraction:48}},
  {id:'rep_003', classId:'class_001', title:'Class Session Report', reportType:'class_session', audience:'teacher', date:'2026-05-25', status:'published', summary:'Class engagement improved after group prompt.', metrics:{attention:72, engagement:78, stress:34, socialInteraction:66}}
];
export const notes = [
  {id:'note_001', authorId:'user_teacher_001', authorRole:'teacher', studentId:'stu_001', sessionId:'sess_104', importance:'medium', visibility:'teacher_doctor', content:'Abdullah responded well after calm mode was activated.', createdAt:'2026-05-25T09:10:00Z'},
  {id:'note_002', authorId:'user_doctor_001', authorRole:'doctor', studentId:'stu_001', importance:'high', visibility:'clinical_only', content:'Repeated stress response appears linked to group transition activities.', createdAt:'2026-05-25T12:30:00Z'},
  {id:'note_003', authorId:'user_teacher_001', authorRole:'teacher', studentId:'stu_006', sessionId:'sess_102', importance:'medium', visibility:'teacher_doctor', content:'Noor loses attention after long verbal instructions.', createdAt:'2026-05-21T10:00:00Z'}
];
export const therapyPlans = [
  {id:'plan_001', studentId:'stu_001', doctorId:'user_doctor_001', status:'active', robotInteractionStyle:'gentle', sensoryLevel:'low', communicationStyle:'visual_support', goals:[{id:'goal_001', title:'Improve stress regulation', progress:45, status:'active', category:'stress_management'}, {id:'goal_002', title:'Increase group participation', progress:62, status:'active', category:'social_interaction'}], classroomStrategies:['Use calm mode when stress starts rising.','Give short transition warnings before activity changes.'], homeStrategies:['Practice a short calming routine before homework.','Praise effort and participation.'], updatedAt:'2026-05-26T12:45:00Z'},
  {id:'plan_002', studentId:'stu_006', doctorId:'user_doctor_001', status:'active', robotInteractionStyle:'balanced', sensoryLevel:'medium', communicationStyle:'mixed', goals:[{id:'goal_003', title:'Improve attention during group tasks', progress:40, status:'active', category:'attention'}], classroomStrategies:['Use repeat instruction when attention drops below 45%.'], homeStrategies:['Use short focused activities.'], updatedAt:'2026-05-24T11:00:00Z'}
];
export const recommendations = [
  {id:'rec_001', studentId:'stu_001', createdBy:'user_doctor_001', audience:'teacher', category:'stress_reduction', title:'Use early calm intervention', description:"Activate calm mode when Abdullah's stress rises above 65% instead of waiting for critical level.", status:'active', createdAt:'2026-05-26T12:50:00Z'},
  {id:'rec_002', studentId:'stu_001', createdBy:'user_doctor_001', audience:'parent', category:'home_activity', title:'Practice calming routine', description:'Practice a short calming routine at home three times per week.', simplifiedDescription:'Try a simple 3-minute calming activity with Abdullah before homework.', status:'active', createdAt:'2026-05-26T12:55:00Z'},
  {id:'rec_003', studentId:'stu_001', createdBy:'user_doctor_001', audience:'parent', category:'communication', title:'Praise participation', description:'Praise small participation moments after school.', simplifiedDescription:'Celebrate any effort Abdullah made in class, even if it was small.', status:'active', createdAt:'2026-05-26T12:58:00Z'}
];

export const alerts = [
  { id:'alert_001', studentId:'stu_001', studentName:'Abdullah Ali', classId:'class_001', type:'stress', severity:'warning', status:'active', message:'Stress increased during group transition.', createdAt:'2026-05-27T09:18:00Z' },
  { id:'alert_002', studentId:'stu_006', studentName:'Noor A.', classId:'class_001', type:'attention', severity:'critical', status:'active', message:'Attention dropped below threshold after verbal instructions.', createdAt:'2026-05-27T09:22:00Z' },
  { id:'alert_003', studentId:'stu_001', studentName:'Abdullah Ali', classId:'class_001', type:'engagement', severity:'warning', status:'handled', message:'Engagement dropped during reading activity.', createdAt:'2026-05-27T08:58:00Z' },
  { id:'alert_004', studentId:'stu_006', studentName:'Noor A.', classId:'class_001', type:'stress', severity:'warning', status:'active', message:'Repeated elevated stress pattern detected.', createdAt:'2026-05-27T09:28:00Z' }
];

export const classAnalytics = {
  today: [
    { name:'09:00', time:'09:00', attention:68, engagement:70, stress:34 },
    { name:'09:10', time:'09:10', attention:72, engagement:73, stress:31 },
    { name:'09:20', time:'09:20', attention:65, engagement:69, stress:42 },
    { name:'09:30', time:'09:30', attention:74, engagement:78, stress:30 },
    { name:'09:40', time:'09:40', attention:71, engagement:76, stress:33 }
  ],
  week: [
    { name:'Sun', time:'Sun', attention:67, engagement:69, stress:38 },
    { name:'Mon', time:'Mon', attention:70, engagement:74, stress:32 },
    { name:'Tue', time:'Tue', attention:68, engagement:71, stress:36 },
    { name:'Wed', time:'Wed', attention:74, engagement:78, stress:30 },
    { name:'Thu', time:'Thu', attention:72, engagement:77, stress:34 }
  ],
  month: [
    { name:'W1', time:'W1', attention:65, engagement:68, stress:40 },
    { name:'W2', time:'W2', attention:68, engagement:71, stress:37 },
    { name:'W3', time:'W3', attention:71, engagement:74, stress:34 },
    { name:'W4', time:'W4', attention:73, engagement:77, stress:31 }
  ]
};

export const parentProgress = {
  stu_001: {
    updatedAt: new Date().toISOString(),
    headline: 'Abdullah is improving steadily',
    subtitle: 'Clear weekly progress, supportive guidance, and calm home-friendly context.',
    statusSummary: [
      { label: 'Current mood', value: 'Calm', tone: 'green' },
      { label: 'Engagement', value: 'Good', tone: 'green' },
      { label: 'Stress', value: 'Lower', tone: 'green' }
    ],
    wellbeing: {
      value: 82,
      label: 'Positive week',
      explanation: 'Abdullah showed steady engagement and lower stress signals this week.',
      breakdown: ['Engagement improving', 'Stress lower', 'Support received']
    },
    periods: {
      week: {
        subtitle: 'Parent-friendly weekly progress summary',
        insight: 'Attention and engagement are trending upward this week.',
        data: [
          { time: 'Sun', attention: 62, engagement: 58, stress: 42 },
          { time: 'Mon', attention: 65, engagement: 61, stress: 40 },
          { time: 'Tue', attention: 66, engagement: 64, stress: 39 },
          { time: 'Wed', attention: 68, engagement: 67, stress: 37 },
          { time: 'Thu', attention: 71, engagement: 70, stress: 35 },
          { time: 'Fri', attention: 73, engagement: 72, stress: 34 }
        ]
      },
      month: {
        subtitle: 'Parent-friendly monthly progress summary',
        insight: 'Progress is steady this month, with lower stress signals and stronger participation.',
        data: [
          { time: 'W1', attention: 60, engagement: 57, stress: 44 },
          { time: 'W2', attention: 64, engagement: 62, stress: 41 },
          { time: 'W3', attention: 68, engagement: 67, stress: 38 },
          { time: 'W4', attention: 72, engagement: 71, stress: 35 }
        ]
      }
    },
    summaryCards: [
      { id: 'achievements', title: 'Positive Achievements', body: 'Abdullah participated in a group activity and responded well to calming support.', action: 'View details', href: '/parent/reports', tone: 'green' },
      { id: 'support', title: 'Needs Support', body: 'Transitions between activities may still need short preparation.', action: 'View guidance', href: '/parent/recommendations', tone: 'orange' },
      { id: 'tip', title: 'Home Tip', body: 'Practice a short calming routine before homework.', action: 'Save tip', tone: 'blue' }
    ]
  }
};

export const systemStatus = {
  liveMonitoring: 'online',
  ai: 'online',
  robot: 'online',
  camera: 'online',
  updatedAt: new Date().toISOString()
};

export const notifications = [
  { id:'notif_001', icon:'alert', title:'Critical stress level detected', description:'Student showed elevated stress during the current session.', createdAt:'2026-05-27T09:28:00Z', priority:'Critical', unread:true, href:'/teacher/students/stu_006' },
  { id:'notif_002', icon:'heart', title:'Low attention score warning', description:'Attention score dropped below the configured threshold.', createdAt:'2026-05-27T09:22:00Z', priority:'Warning', unread:true, href:'/teacher/students/stu_006' },
  { id:'notif_003', icon:'check', title:'Robot session completed', description:'The latest classroom robot session was completed successfully.', createdAt:'2026-05-27T09:05:00Z', priority:'Success', unread:true, href:'/teacher/sessions/sess_104' },
  { id:'notif_004', icon:'report', title:'New weekly report available', description:'A weekly progress report is ready for review.', createdAt:'2026-05-27T08:30:00Z', priority:'Info', unread:false, href:'/teacher/reports' },
  { id:'notif_005', icon:'radio', title:'Doctor added a recommendation', description:'A therapist added a new intervention recommendation.', createdAt:'2026-05-26T12:50:00Z', priority:'Info', unread:false, href:'/teacher/students/stu_001' }
];
