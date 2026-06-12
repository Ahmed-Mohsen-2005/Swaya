import { useI18n } from '../../i18n';

export function DataTable({ columns, rows, getKey }) {
  const { t } = useI18n();
  return (
    <div className="table-wrap">
      <table className="table data-table">
        <thead><tr>{columns.map(column => <th key={column.key}>{t(column.header)}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={getKey?.(row) || row.id || index}>{columns.map(column => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
