import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';
import { FilterTabs } from '../../components/ui/FilterTabs';

export default function TeacherStudents() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('all');
  useEffect(() => { dataService.getStudentsForTeacher(user.id).then(setStudents); }, [user.id]);
  const list = students.filter(s => filter === 'all' || (filter === 'asd' ? s.classification === 'ASD' : s.classification === 'Typical'));

  return (
    <div className="grid">
      <Card>
        <div className="section-title">
          <h2>{t('Assigned Students')}</h2>
          <FilterTabs items={[['all','All'],['asd','ASD'],['typical','Typical']]} active={filter} onChange={setFilter}/>
        </div>
        <div className="grid grid-4">
          {list.map(s => (
            <Link to={`/teacher/students/${s.id}`} className="student-card" key={s.id}>
              <div className="avatar">{s.shortName?.[0]}</div>
              <h3>{s.fullName}</h3>
              <p className="muted">{s.classification} · {s.autismLevel}</p>
              <div className="mini-row"><span>{t('Attention')}</span><b>{s.baselineMetrics.attention}%</b></div>
              <div className="mini-row"><span>{t('Stress')}</span><b>{s.baselineMetrics.stress}%</b></div>
              <StatusBadge status={s.status === 'stable' ? 'stable' : 'warning'}>{s.status.replace('_', ' ')}</StatusBadge>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
