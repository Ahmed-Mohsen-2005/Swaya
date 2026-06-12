import { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { StudentsBarChart, LiveLineChart } from '../../components/charts/SimpleCharts';
import { useI18n } from '../../i18n';
import { FilterTabs } from '../../components/ui/FilterTabs';

const trend = [0, 1, 2, 3, 4, 5, 6].map((_, i) => ({ time: `Day ${i + 1}`, attention: 66 + i * 2, engagement: 68 + i * 2, stress: 38 - i + Math.random() * 3 }));

export default function TeacherAnalytics() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  useEffect(() => { dataService.getStudentsForTeacher(user.id).then(setStudents); }, [user.id]);
  const chart = students.map(s => ({ name: s.shortName, ...s.baselineMetrics }));

  return <div className="grid"><Card><div className="section-title"><h2>{t('Class Analytics')}</h2><FilterTabs items={[['week','This Week'],['asd','ASD'],['stress','High Stress']]} active="week"/></div></Card><div className="grid grid-2"><Card><h2>{t('Student Comparison')}</h2><StudentsBarChart data={chart}/></Card><Card><h2>{t('Class Trend')}</h2><LiveLineChart data={trend}/></Card></div></div>;
}
