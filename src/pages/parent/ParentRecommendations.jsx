import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, HeartHandshake, Home, MessageCircle, Repeat2 } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';

const extraRecommendations = [
  {
    id: 'parent_transition_prep',
    title: 'Prepare before activity transitions',
    category: 'routine',
    simplifiedDescription: 'Tell Abdullah what will change next using one short sentence and a visual cue.',
    why: 'It lowers surprise and helps him move calmly between activities.',
    frequency: 'Before homework and bedtime transitions',
    difficulty: 'Easy',
    status: 'active',
  },
  {
    id: 'parent_calm_talk',
    title: 'Encourage calm communication',
    category: 'communication',
    simplifiedDescription: 'Use a calm voice and give Abdullah time to answer without rushing.',
    why: 'It supports confidence and reduces pressure during communication.',
    frequency: '5 minutes daily',
    difficulty: 'Easy',
    status: 'active',
  },
];

const categoryLabel = {
  stress_reduction: 'Stress Reduction',
  home_activity: 'Routine',
  communication: 'Communication',
  routine: 'Routine',
  participation: 'Participation',
};

const categoryIcon = {
  stress_reduction: HeartHandshake,
  home_activity: Home,
  routine: Repeat2,
  communication: MessageCircle,
  participation: CheckCircle2,
};

export default function ParentRecommendations() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [completed, setCompleted] = useState(new Set());
  const [notice, setNotice] = useState('');

  useEffect(() => {
    dataService.getChildForParent(user.id).then(child => {
      if (child) {
        dataService.getRecommendations(child.id, 'parent').then(items => {
          setRecommendations([...items, ...extraRecommendations]);
        });
      }
    });
  }, [user.id]);

  const filtered = useMemo(() => {
    return recommendations.filter(item => filter === 'all' || categoryLabel[item.category] === filter);
  }, [recommendations, filter]);

  const homeTips = recommendations.filter(item => ['home_activity', 'routine'].includes(item.category)).length;
  const activeCount = recommendations.filter(item => !completed.has(item.id)).length;

  const markComplete = id => {
    setCompleted(current => new Set([...current, id]));
    setNotice(t('Recommendation marked as completed.'));
  };

  return (
    <div className="grid parent-module-page">
      <div className="grid grid-4 parent-summary-metrics">
        <MetricCard icon={<HeartHandshake />} label="Active recommendations" value={activeCount} status="active" color="blue" />
        <MetricCard icon={<CheckCircle2 />} label="Completed" value={completed.size} status="stable" color="green" />
        <MetricCard icon={<Home />} label="Home tips" value={homeTips} status="info" color="blue" />
        <MetricCard icon={<Repeat2 />} label="Needs follow-up" value={Math.max(0, activeCount - homeTips)} status={activeCount ? 'Needs support' : 'All clear'} color={activeCount ? 'orange' : 'green'} />
      </div>

      <Card>
        <div className="parent-page-head">
          <div>
            <h2>{t('Home Recommendations')}</h2>
            <p className="small muted">{t('Small home actions that support steady progress without pressure.')}</p>
          </div>
          {notice && <span className="badge green">{notice}</span>}
        </div>
        <div className="filters parent-filters">
          {[
            ['all', 'All'],
            ['Communication', 'Communication'],
            ['Stress Reduction', 'Stress Reduction'],
            ['Routine', 'Routine'],
            ['Participation', 'Participation'],
          ].map(([id, label]) => (
            <button className={`pill ${filter === id ? 'active' : ''}`} key={id} onClick={() => setFilter(id)}>{t(label)}</button>
          ))}
        </div>

        <div className="parent-recommendation-grid">
          {filtered.map(item => {
            const Icon = categoryIcon[item.category] || HeartHandshake;
            const isDone = completed.has(item.id);
            return (
              <div className={`parent-recommendation-card ${isDone ? 'done' : ''}`} key={item.id}>
                <div className="parent-rec-icon"><Icon size={18} /></div>
                <div className="parent-card-title-row">
                  <h3>{t(item.title)}</h3>
                  <StatusBadge status={isDone ? 'stable' : 'info'}>{isDone ? 'Completed' : 'Active'}</StatusBadge>
                </div>
                <p>{t(item.simplifiedDescription || item.description)}</p>
                <div className="parent-rec-details">
                  <span><b>{t('Category')}</b>{t(categoryLabel[item.category] || item.category)}</span>
                  <span><b>{t('Why it helps')}</b>{t(item.why || 'Why it helps: supports consistency between school and home.')}</span>
                  <span><b>{t('Duration')}</b>{t(item.frequency || 'Three times per week')}</span>
                  <span><b>{t('Difficulty')}</b>{t(item.difficulty || 'Easy')}</span>
                </div>
                <div className="parent-action-row">
                  <Button variant={isDone ? 'green' : 'outline'} disabled={isDone} onClick={() => markComplete(item.id)}><CheckCircle2 size={14} />{t(isDone ? 'Completed' : 'Mark as completed')}</Button>
                  <Button variant="soft" onClick={() => setNotice(t('Guidance opened for selected recommendation.'))}>{t('View Guidance')}</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
