import { Bell, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useI18n } from '../i18n';
import { useNotificationStore } from '../store/notificationStore';
import { relativeTime } from '../utils/dashboardData';

export default function Notifications() {
  const { t } = useI18n();
  const { notifications, loaded, load, markAllAsRead } = useNotificationStore();
  useEffect(() => { if (!loaded) load(); }, [loaded, load]);

  return (
    <div className="grid">
      <Card className="glass">
        <div className="account-placeholder">
          <div className="avatar avatar-lg"><Bell size={20}/></div>
          <div>
            <h1>{t('Notifications')}</h1>
            <p className="muted">{t('Review system alerts, session events, reports, and clinical updates.')}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="section-title">
          <h2>{t('Notification center')}</h2>
          <button className="pill" onClick={markAllAsRead}><CheckCircle2 size={14}/>{t('Mark all as read')}</button>
        </div>
        <div className="grid">
          {notifications.map(item => <Link to={item.href || '#'} className={`student-card ${item.unread ? 'focused' : ''}`} key={item.id}><b>{t(item.title)}</b><p className="muted">{t(item.description)}</p><div className="mini-row"><span>{t(item.priority)}</span><b>{t(relativeTime(item.createdAt))}</b></div></Link>)}
        </div>
      </Card>
    </div>
  );
}
