export const pct = (v) => `${Math.round(v)}%`;
export const statusFromMetrics = (m) => m.stress >= 85 || m.attention <= 25 || m.engagement <= 30 ? 'critical' : m.stress >= 60 || m.attention < 45 || m.engagement < 50 ? 'warning' : 'stable';
export const generalState = (m) => m.stress > 65 ? 'Needs Support' : m.engagement > 70 ? 'Engaged' : 'Calm';
export const badgeClass = (s = '') => {
  const value = String(s).toLowerCase().replaceAll('_', ' ');
  if (value.includes('critical') || value.includes('danger') || value.includes('urgent') || value.includes('high risk')) return 'red';
  if (value.includes('warning') || value.includes('follow') || value.includes('needs') || value.includes('attention') || value.includes('moderate risk')) return 'orange';
  if (value.includes('info') || value.includes('active') || value.includes('online') || value.includes('general') || value.includes('updated')) return 'blue';
  if (value.includes('gray') || value.includes('idle') || value.includes('draft')) return 'gray';
  return 'green';
};
