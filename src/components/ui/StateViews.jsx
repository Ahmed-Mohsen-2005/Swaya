import { AlertTriangle, Inbox } from 'lucide-react';
import { Card } from './Card';
import { useI18n } from '../../i18n';

export function EmptyState({ title='No data yet', description='Content will appear here when available.' }) {
  const { t } = useI18n();
  return <Card className="state-card"><Inbox size={22}/><h2>{t(title)}</h2><p>{t(description)}</p></Card>;
}

export function LoadingState() {
  return (
    <Card className="state-card state-card-skeleton" aria-busy="true" aria-label="Loading">
      <span className="skeleton-line skeleton-line-short" />
      <span className="skeleton-line" />
      <span className="skeleton-line skeleton-line-mid" />
    </Card>
  );
}

export function ErrorState({ title='Something went wrong', description='Please try again.' }) {
  const { t } = useI18n();
  return <Card className="state-card error"><AlertTriangle size={22}/><h2>{t(title)}</h2><p>{t(description)}</p></Card>;
}
