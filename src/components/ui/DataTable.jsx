import { useI18n } from '../../i18n';
import { EmptyState } from './StateViews';

export function DataTable({ columns, rows, getKey, onRowClick, getRowClassName, emptyTitle, emptyDescription }) {
  const { t } = useI18n();

  if (!rows.length) {
    return <EmptyState title={emptyTitle || 'No data yet'} description={emptyDescription || 'Content will appear here when available.'} />;
  }

  return (
    <div className="table-wrap">
      <table className="table data-table">
        <thead>
          <tr>{columns.map(column => <th key={column.key}>{t(column.header)}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={getKey?.(row) || row.id || index}
              className={`${onRowClick ? 'table-row-clickable' : ''} ${getRowClassName?.(row) || ''}`.trim()}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map(column => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
