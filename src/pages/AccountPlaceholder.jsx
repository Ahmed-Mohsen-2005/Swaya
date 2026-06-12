import { Shield, UserRound } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../i18n';

const copy = {
  profile: ['Profile', 'Personal profile and professional account details.', 'Avatar and identity controls will connect to the production profile service.'],
  account: ['Account Settings', 'Manage identity, preferences, and access settings.', 'Account preferences and notification settings will appear here.'],
  security: ['Security', 'Update password and security preferences.', 'Password and session controls will appear here.'],
};

export function AccountPlaceholder({ type }) {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const [title, subtitle, body] = copy[type] || copy.profile;
  const initials = user?.fullName?.split(' ').map(part => part[0]).slice(0, 2).join('') || 'SW';

  return (
    <div className="grid">
      <Card className="glass">
        <div className="account-placeholder">
          <div className="avatar avatar-lg">{initials}</div>
          <div>
            <h1>{t(title)}</h1>
            <p className="muted">{t(subtitle)}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="section-title">
          <h2>{t(title)}</h2>
          {type === 'security' ? <Shield size={18}/> : <UserRound size={18}/>}
        </div>
        <p className="muted">{t(body)}</p>
      </Card>
    </div>
  );
}
