export const scenarios = [
  { id:'normal', name:'Normal Class', description:'Stable classroom behavior', type:'class' },
  { id:'high_stress_student', name:'High Stress Student', description:'Selected student stress rises gradually', type:'student' },
  { id:'low_attention_student', name:'Low Attention Student', description:'Selected student attention drops gradually', type:'student' },
  { id:'low_engagement_group', name:'Low Engagement Group', description:'Several students disengage', type:'group' },
  { id:'relax', name:'Relax / Calm State', description:'Stress decreases and class stabilizes', type:'class' },
  { id:'multiple_alerts', name:'Multiple Alerts', description:'Several students trigger alerts', type:'group' },
  { id:'robot_calm_success', name:'Robot Calm Success', description:'Stress rises then calm mode works', type:'student' },
  { id:'activity_change_success', name:'Activity Change Success', description:'Engagement improves after activity change', type:'class' }
];
export const thresholds = {
  stress:{ medium:60, high:75, critical:85 },
  attention:{ low:40, critical:25 },
  engagement:{ low:45, critical:30 }
};
