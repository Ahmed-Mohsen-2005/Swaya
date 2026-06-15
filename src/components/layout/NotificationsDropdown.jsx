import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Bell, CheckCircle2, ClipboardList, HeartPulse, Info, Radio } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useNotificationStore } from '../../store/notificationStore';
import { relativeTime } from '../../utils/dashboardData';

const priorityClass = priority => priority.toLowerCase();
const iconMap = { alert: AlertTriangle, heart: HeartPulse, check: CheckCircle2, report: ClipboardList, radio: Radio };

export function NotificationsDropdown({ open, setOpen, onOpen }) {
  const { t } = useI18n();
  const { notifications, loaded, load, markAllAsRead, markAsRead } = useNotificationStore();
  const wrapRef = useRef(null);
  const unreadCount = notifications.filter(item => item.unread).length;

  useEffect(() => { if (!loaded) load(); }, [loaded, load]);

  useEffect(() => {
    function onPointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [setOpen]);

  const toggleOpen = () => {
    setOpen(current => {
      if (!current) onOpen?.();
      return !current;
    });
  };

  return (
    <div className="notifications-wrap" ref={wrapRef}>
      <button className="icon-button notification" aria-label={t('Notifications')} aria-haspopup="dialog" aria-expanded={open} onClick={toggleOpen}>
        <Bell size={18}/>
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="notifications-panel" role="dialog" aria-label={t('Notifications')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
            <div className="notifications-head">
              <div>
                <h2>{t('Notifications')}</h2>
                <p>{unreadCount > 0 ? t('{{count}} unread updates', { count: unreadCount }) : t('No unread updates')}</p>
              </div>
              <button className="mark-read" onClick={markAllAsRead} disabled={unreadCount === 0}>{t('Mark all as read')}</button>
            </div>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="notifications-empty">
                  <Info size={20}/>
                  <b>{t('No notifications yet')}</b>
                  <p>{t('Operational alerts and reports will appear here.')}</p>
                </div>
              ) : notifications.map(item => {
                const Icon = iconMap[item.icon] || Info;
                return (
                  <Link to={item.href || '/notifications'} onClick={() => { markAsRead(item.id); setOpen(false); }} className={`notification-item ${item.unread ? 'unread' : ''}`} key={item.id}>
                    <span className={`notification-icon ${priorityClass(item.priority)}`}><Icon size={17}/></span>
                    <div className="notification-body">
                      <div className="notification-row">
                        <b>{t(item.title)}</b>
                        {item.unread && <span className="unread-dot" aria-label={t('Unread')}/>}
                      </div>
                      <p>{t(item.description)}</p>
                      <div className="notification-meta">
                        <span>{t(relativeTime(item.createdAt))}</span>
                        <span className={`priority-badge ${priorityClass(item.priority)}`}>{t(item.priority)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link className="notifications-footer" to="/notifications" onClick={() => setOpen(false)}>{t('View all notifications')}</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
