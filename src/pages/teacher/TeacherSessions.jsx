import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable } from '../../components/ui/DataTable';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { useI18n } from '../../i18n';

export default function TeacherSessions() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState([]);
  useEffect(() => { dataService.getSessions().then(setSessions); }, []);
  const columns = [
    { key: 'title', header: 'Session', render: s => <Link to={`/teacher/sessions/${s.id}`}><b>{s.title}</b></Link> },
    { key: 'date', header: 'Date' },
    { key: 'durationMinutes', header: 'Duration', render: s => `${s.durationMinutes} min` },
    { key: 'avgAttention', header: 'Attention', render: s => `${s.avgAttention}%` },
    { key: 'avgEngagement', header: 'Engagement', render: s => `${s.avgEngagement}%` },
    { key: 'avgStress', header: 'Stress', render: s => `${s.avgStress}%` },
    { key: 'alerts', header: 'Alerts', render: s => <StatusBadge status={s.alerts > 2 ? 'warning' : 'stable'}>{s.alerts}</StatusBadge> },
  ];
  return <Card><div className="section-title"><h2>{t('Class Sessions')}</h2><FilterTabs items={[['all','All'],['stress','High Stress'],['week','This Week']]} active="all"/></div><DataTable columns={columns} rows={sessions}/></Card>;
}
