import { useI18n } from '../../i18n';

export function FilterTabs({ items, active, onChange }) {
  const { t } = useI18n();
  return <div className="filter-tabs" role="tablist">{items.map(item => {
    const id = Array.isArray(item) ? item[0] : item;
    const label = Array.isArray(item) ? item[1] : item;
    return <button key={id} role="tab" aria-selected={active===id} className={active===id?'active':''} onClick={() => onChange?.(id)}>{t(label)}</button>;
  })}</div>;
}
