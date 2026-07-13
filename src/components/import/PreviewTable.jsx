import { formatDate, formatNumber, formatValue } from '../../lib/formatters';

const MAX_PREVIEW_ROWS = 8;

const renderCell = (field, record) => {
  const raw = record[field.key];
  if (field.type === 'date') return formatDate(raw);
  if (field.type === 'number') return formatNumber(raw);
  return formatValue(raw);
};

const PreviewTable = ({ records, fields }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {fields.map((field) => (
              <th
                key={field.key}
                className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.slice(0, MAX_PREVIEW_ROWS).map((record, index) => (
            <tr key={index}>
              {fields.map((field) => (
                <td
                  key={field.key}
                  className={`whitespace-nowrap px-4 py-2.5 text-slate-600 ${field.type === 'number' ? 'tabular-nums' : ''}`}
                >
                  {renderCell(field, record)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {records.length > MAX_PREVIEW_ROWS && (
      <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
        Showing {MAX_PREVIEW_ROWS} of {records.length} rows
      </p>
    )}
  </div>
);

export default PreviewTable;
