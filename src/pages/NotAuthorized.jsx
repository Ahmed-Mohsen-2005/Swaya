import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useI18n } from '../i18n';

export default function NotAuthorized() {
  const { t } = useI18n();
  return (
    <div className="content">
      <div className="card" style={{ maxWidth: 560, margin: '80px auto', textAlign: 'center' }}>
        <h1>{t('Not authorized')}</h1>
        <p className="muted">{t('This page is not available for your role.')}</p>
        <Link to="/login"><Button>{t('Back to login')}</Button></Link>
      </div>
    </div>
  );
}
