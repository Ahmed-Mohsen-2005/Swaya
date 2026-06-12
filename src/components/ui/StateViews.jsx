import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import { Card } from './Card';
import { useI18n } from '../../i18n';

export function EmptyState({ title='No data yet', description='Content will appear here when available.' }) {
  const { t } = useI18n();
  return <Card className="state-card"><Inbox size={22}/><h2>{t(title)}</h2><p>{t(description)}</p></Card>;
}

export function LoadingState({ title='Loading workspace data' }) {
  const { t } = useI18n();
  return <Card className="state-card"><Loader2 className="spin" size={22}/><h2>{t(title)}</h2></Card>;
}

export function ErrorState({ title='Something went wrong', description='Please try again.' }) {
  const { t } = useI18n();
  return <Card className="state-card error"><AlertTriangle size={22}/><h2>{t(title)}</h2><p>{t(description)}</p></Card>;
}
