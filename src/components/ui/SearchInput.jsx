import { Search } from 'lucide-react';
import { useI18n } from '../../i18n';

export function SearchInput({ value = '', onChange, placeholder = 'Search students, sessions, reports…', className = '' }) {
  const { t } = useI18n();
  return (
    <label className={`search-input ${className}`}>
      <Search size={16} />
      <input value={value} onChange={onChange} placeholder={t(placeholder)} aria-label={t(placeholder)} />
    </label>
  );
}
