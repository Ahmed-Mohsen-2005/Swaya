import { useMemo, useState } from 'react';
import { Activity, BookOpen, Clock3, Eye, HeartPulse, Smile } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { sessions } from '../../data/mockData';
import { useI18n } from '../../i18n';

const sessionDetails = {
  sess_102: {
    childStatus: 'Needed gentle support',
    support: 'Repeat instruction and calm prompt',
    teacherNote: 'Abdullah participated after instructions were shortened.',
    summary: 'Reading time was positive overall, with extra help during transitions.',
    tip: 'Read one short story together and pause for calm questions.',
  },
  sess_103: {
    childStatus: 'Positive week',
    support: 'Positive prompt delivered',
    teacherNote: 'Abdullah joined the story activity with steady attention.',
    summary: 'The story activity supported engagement and calm participation.',
    tip: 'Ask Abdullah to retell one part of the story at home.',
  },
  sess_104: {
    childStatus: 'Engagement is good',
    support: 'Calm mode activated',
    teacherNote: 'Abdullah responded well after calm mode was activated.',
    summary: 'The collaborative puzzle helped participation after calming support.',
    tip: 'Use a short calming routine before homework.',
  },
};

const latestSessions = sessions.slice(-3).map(session => ({
  ...session,
  ...(sessionDetails[session.id] || sessionDetails.sess_104),
}));

function formatDateTime(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

export default function ParentSessions() {
  const { t, language } = useI18n();
  const [selectedId, setSelectedId] = useState(latestSessions.at(-1)?.id);
  const selected = latestSessions.find(session => session.id === selectedId) || latestSessions.at(-1);

  const avgEngagement = useMemo(() => Math.round(latestSessions.reduce((sum, item) => sum + item.avgEngagement, 0) / latestSessions.length), []);
  const supportCount = latestSessions.filter(session => session.support).length;

  return (
    <div className="grid parent-module-page">
      <div className="grid grid-4 parent-summary-metrics">
        <MetricCard icon={<BookOpen />} label="Recent sessions" value={latestSessions.length} status="weekly" />
        <MetricCard icon={<Clock3 />} label="Latest session" value={selected ? formatDateTime(selected.date, language) : '-'} status="stable" color="green" />
        <MetricCard icon={<Smile />} label="Avg Engagement" value={`${avgEngagement}%`} status="Engagement is good" color="green" />
        <MetricCard icon={<HeartPulse />} label="Support received" value={supportCount} status="Support received" color="blue" />
      </div>

      <div className="grid parent-sessions-layout">
        <Card>
          <div className="parent-page-head">
            <div>
              <h2>{t('Child Session Summaries')}</h2>
              <p className="small muted">{t('Simple summaries of classroom sessions and helpful home follow-up.')}</p>
            </div>
          </div>
          <div className="parent-session-list">
            {latestSessions.map(session => (
              <button key={session.id} className={`parent-session-card ${selected?.id === session.id ? 'active' : ''}`} onClick={() => setSelectedId(session.id)}>
                <div className="parent-card-title-row">
                  <h3>{t(session.title)}</h3>
                  <StatusBadge status={session.avgStress >= 40 ? 'warning' : 'stable'}>{session.childStatus}</StatusBadge>
                </div>
                <p className="muted">{formatDateTime(session.date, language)} · {session.durationMinutes} {t('min')}</p>
                <div className="parent-mini-indicators">
                  <span><Eye size={13} />{t('Attention')} {session.avgAttention}%</span>
                  <span><Smile size={13} />{t('Engagement')} {session.avgEngagement}%</span>
                  <span><HeartPulse size={13} />{t('Stress')} {session.avgStress}%</span>
                </div>
                <p>{t(session.summary)}</p>
                <div className="parent-action-row">
                  <Button size="sm" variant="outline"><Activity size={14} />{t('View session details')}</Button>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="parent-preview-panel">
          {selected && (
            <>
              <div className="parent-page-head compact">
                <div>
                  <h2>{t(selected.title)}</h2>
                  <p className="small muted">{formatDateTime(selected.date, language)} · {selected.durationMinutes} {t('min')}</p>
                </div>
                <StatusBadge status={selected.avgStress >= 40 ? 'warning' : 'stable'}>{selected.childStatus}</StatusBadge>
              </div>
              <div className="parent-preview-section positive">
                <b>{t('Progress highlights')}</b>
                <span>{t(selected.summary)}</span>
                <span>{t(selected.teacherNote)}</span>
              </div>
              <div className="parent-preview-section support">
                <b>{t('Support used')}</b>
                <span>{t(selected.support)}</span>
              </div>
              <div className="parent-home-tip">
                <b>{t('Home follow-up tip')}</b>
                <p>{t(selected.tip)}</p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
