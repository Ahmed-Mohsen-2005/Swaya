import { useMemo, useState } from 'react';
import { CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';

const recipients = [
  { id: 'teacher', name: 'Mona Hassan - Teacher', role: 'Teacher' },
  { id: 'doctor', name: 'Dr. Ahmed Sami - Doctor', role: 'Doctor' },
];

const seedMessages = [
  {
    id: 'msg_001',
    sender: 'Mona Hassan - Teacher',
    role: 'Teacher',
    category: 'Teacher',
    preview: 'Teacher: Abdullah had a positive session today.',
    body: 'Abdullah participated well today after a short calming prompt.',
    timestamp: '2026-05-27T09:40:00Z',
    unread: true,
  },
  {
    id: 'msg_002',
    sender: 'Dr. Ahmed Sami - Doctor',
    role: 'Doctor',
    category: 'Doctor',
    preview: 'Doctor: Please continue the calming routine at home.',
    body: 'Please continue the short calming routine at home before homework.',
    timestamp: '2026-05-26T13:10:00Z',
    unread: false,
  },
  {
    id: 'msg_003',
    sender: 'SWAYA',
    role: 'System',
    category: 'System',
    preview: 'A new parent-safe report is available.',
    body: 'A weekly progress report is ready for your review.',
    timestamp: '2026-05-26T09:00:00Z',
    unread: false,
  },
];

function formatTime(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-US', { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default function ParentMessages() {
  const { t, language } = useI18n();
  const [messages, setMessages] = useState(seedMessages);
  const [selectedId, setSelectedId] = useState(seedMessages[0].id);
  const [recipient, setRecipient] = useState('teacher');
  const [category, setCategory] = useState('General question');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const selected = messages.find(item => item.id === selectedId) || messages[0];
  const unreadCount = useMemo(() => messages.filter(item => item.unread).length, [messages]);

  const openThread = id => {
    setSelectedId(id);
    setMessages(current => current.map(item => item.id === id ? { ...item, unread: false } : item));
  };

  const sendMessage = () => {
    if (!text.trim()) {
      setError(t('Please write a message before sending.'));
      setSent(false);
      return;
    }
    const recipientData = recipients.find(item => item.id === recipient) || recipients[0];
    const newMessage = {
      id: `msg_${Date.now()}`,
      sender: 'Abdullah parent',
      role: 'Parent',
      category,
      preview: text.trim(),
      body: text.trim(),
      timestamp: new Date().toISOString(),
      unread: false,
      to: recipientData.name,
    };
    setMessages(current => [newMessage, ...current]);
    setSelectedId(newMessage.id);
    setText('');
    setError('');
    setSent(true);
  };

  return (
    <div className="grid parent-module-page parent-messages-page">
      <div className="grid grid-3 parent-summary-metrics">
        <Card className="parent-message-summary"><MessageSquare size={18} /><div><b>{messages.length}</b><span>{t('Recent Messages')}</span></div></Card>
        <Card className="parent-message-summary"><CheckCircle2 size={18} /><div><b>{unreadCount}</b><span>{t('Unread')}</span></div></Card>
        <Card className="parent-message-summary"><Send size={18} /><div><b>{t('Ready')}</b><span>{t('Communication panel')}</span></div></Card>
      </div>

      <div className="parent-message-layout">
        <Card className="parent-thread-list">
          <div className="parent-page-head compact">
            <div>
              <h2>{t('Recent Messages')}</h2>
              <p className="small muted">{t('Messages from the teacher, specialist, and SWAYA updates.')}</p>
            </div>
          </div>
          {messages.map(item => (
            <button key={item.id} className={`parent-thread-item ${selected?.id === item.id ? 'active' : ''}`} onClick={() => openThread(item.id)}>
              <span className={`thread-dot ${item.unread ? 'unread' : ''}`} />
              <div>
                <b>{t(item.sender)}</b>
                <p>{t(item.preview)}</p>
                <span>{formatTime(item.timestamp, language)}</span>
              </div>
              <StatusBadge status={item.category === 'System' ? 'info' : item.category === 'Doctor' ? 'blue' : 'stable'}>{item.category}</StatusBadge>
            </button>
          ))}
        </Card>

        <Card className="parent-thread-panel">
          <div className="parent-page-head">
            <div>
              <h2>{t('Message Teacher or Doctor')}</h2>
              <p className="small muted">{t('Send a calm, clear question or update to the support team.')}</p>
            </div>
            {sent && <span className="badge green">{t('Message sent')}</span>}
          </div>

          {selected && (
            <div className="parent-selected-thread">
              <div className="parent-thread-bubble incoming">
                <b>{t(selected.sender)}</b>
                <p>{t(selected.body)}</p>
                <span>{formatTime(selected.timestamp, language)}</span>
              </div>
            </div>
          )}

          <div className="parent-compose">
            <div className="form-row">
              <label>
                {t('Recipient')}
                <select className="select" value={recipient} onChange={event => setRecipient(event.target.value)}>
                  {recipients.map(item => <option value={item.id} key={item.id}>{t(item.name)}</option>)}
                </select>
              </label>
              <label>
                {t('Subject')}
                <select className="select" value={category} onChange={event => setCategory(event.target.value)}>
                  <option value="General question">{t('General question')}</option>
                  <option value="Home update">{t('Home update')}</option>
                  <option value="Need guidance">{t('Need guidance')}</option>
                </select>
              </label>
            </div>
            <textarea rows={6} value={text} onChange={event => setText(event.target.value)} placeholder={t('Write a message...')} />
            {error && <div className="auth-alert error">{error}</div>}
            <div className="parent-action-row">
              <Button onClick={sendMessage}><Send size={14} />{t('Send message')}</Button>
              <Button variant="outline" onClick={() => { setText(''); setError(''); }}>{t('Cancel')}</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
