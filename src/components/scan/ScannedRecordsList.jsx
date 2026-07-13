import { returnTypeLabel } from '../../lib/returnTypes';
import { formatDateTime, formatValue } from '../../lib/formatters';

const ScannedRecordsList = ({ acceptances }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {[
              'SKU Code',
              'Invoice No.',
              'Good Qty',
              'Bad Qty',
              'Return Type',
              'Comments',
              'Accepted At',
            ].map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {acceptances.map((acceptance) => (
            <tr key={acceptance._id} className="even:bg-slate-50/60">
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                {formatValue(acceptance.porduct_sku_code)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {formatValue(acceptance.invoice_number)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">
                {acceptance.good_qty}
              </td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">
                {acceptance.bad_qty}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {returnTypeLabel(acceptance.return_type)}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {formatValue(acceptance.return_comments)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {formatDateTime(acceptance.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ScannedRecordsList;
