import { badgeClass } from '../../utils/formatters';
import { useI18n } from '../../i18n';
export function StatusBadge({status, children}){ const {t}=useI18n(); return <span className={`badge ${badgeClass(status)}`}>{children ? t(String(children)) : t(status)}</span> }
