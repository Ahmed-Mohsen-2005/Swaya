import { useEffect, useState } from 'react';
import { Camera, Cpu, Radio } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLiveSessionStore } from '../../store/liveSessionStore';
import { dataService } from '../../services/dataService';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { LiveLineChart } from '../../components/charts/SimpleCharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { AlertsPanel, ClassMetrics, RobotControl, ScenarioController, SessionHeader, StudentFocus, StudentsGrid, Timeline } from '../../components/teacher/LiveSessionParts';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useI18n } from '../../i18n';

export default function TeacherLiveSession() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const st = useLiveSessionStore();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    dataService.getClassesForTeacher(user.id).then(items => {
      setClasses(items);
      setSelectedClassId(items[0]?.id || '');
    });
  }, [user.id]);

  useEffect(() => {
    if (selectedClassId) dataService.getStudentsByClass(selectedClassId).then(setStudents);
  }, [selectedClassId]);

  const start = () => {
    const currentClass = classes.find(item => item.id === selectedClassId);
    st.startSession({ classId: selectedClassId, className: currentClass?.name, teacherId: user.id, students });
  };

  const saveQuickNote = () => {
    if (!quickNote.trim()) return;
    setNoteSaved(true);
    setQuickNote('');
    setTimeout(() => setNoteSaved(false), 1400);
  };

  const deviceStatuses = [
    ['Camera Active', Camera, 'online'],
    ['AI Online', Cpu, 'online'],
    ['Robot Connected', Radio, st.status === 'active' ? 'online' : 'warning'],
  ];

  return (
    <div className="grid teacher-module-page">
      <PageHeader
        title="Live Class Session"
        subtitle="Run a real-time classroom monitoring session with alerts, robot controls, and quick teacher observations."
        badge={st.status === 'active' ? 'Active monitoring' : st.status === 'paused' ? 'Paused' : st.status === 'ended' ? 'Ended' : 'Ready'}
      />

      <div className="grid grid-3 teacher-live-summary">
        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Session status')}</h2>
              <p className="small muted">{t('Current classroom state')}</p>
            </div>
            <StatusBadge status={st.status === 'active' ? 'active' : st.status === 'paused' ? 'warning' : st.status === 'ended' ? 'critical' : 'stable'}>{st.status === 'idle' ? t('Ready') : t(st.status)}</StatusBadge>
          </div>
          <p className="small muted">{t('Class')}: {classes.find(item => item.id === selectedClassId)?.name || 'Inclusive Class A'}</p>
        </Card>

        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Connected devices')}</h2>
              <p className="small muted">{t('Live monitoring hardware')}</p>
            </div>
          </div>
          <div className="teacher-device-list">
            {deviceStatuses.map(([label, Icon, tone]) => (
              <div key={label} className="teacher-device-row">
                <span><Icon size={15} /> {t(label)}</span>
                <StatusBadge status={tone}>{tone === 'online' ? t('Online') : t('Needs attention')}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Quick session note')}</h2>
              <p className="small muted">{t('Log a live observation')}</p>
            </div>
          </div>
          <textarea value={quickNote} onChange={event => setQuickNote(event.target.value)} rows={4} placeholder={t('Write teacher observation...')} />
          <div className="teacher-action-row">
            <Button size="sm" onClick={saveQuickNote}>{t('Save Note')}</Button>
            {noteSaved && <span className="small muted">{t('Saved')}</span>}
          </div>
        </Card>
      </div>

      <SessionHeader classes={classes} selectedClassId={selectedClassId} setSelectedClassId={setSelectedClassId} onStart={start} />
      <ScenarioController students={students} />
      <ClassMetrics />

      <div className="grid" style={{ gridTemplateColumns: '2fr 1.05fr' }}>
        <ChartCard title="Class Trends" subtitle="Live attention, engagement, and stress signals" actions={<><span className="badge blue">{t('Attention')}</span><span className="badge green">{t('Engagement')}</span><span className="badge orange">{t('Stress')}</span></>}>
          <LiveLineChart data={st.metricHistory} />
        </ChartCard>
        <AlertsPanel />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <StudentsGrid />
        <RobotControl />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.1fr 1fr' }}>
        <StudentFocus />
        <Card>
          <h2 style={{ marginTop: 0 }}>{t('Robot Status')}</h2>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="robot-face status-pulse" />
            <div>
              <div className="small muted">{t('Current mode')}</div>
              <h2 style={{ margin: '5px 0', fontSize: 22 }}>{t(st.robotState.mode)}</h2>
              <p className="muted">{t('Target')}: {t(st.robotState.target)}<br />{t('Effect')}: {t(st.robotState.effect)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Timeline />
    </div>
  );
}
