import StatusBadge from '../common/StatusBadge';
import Pagination from '../common/Pagination';
import { useProductImages } from '../../hooks/useProductImages';
import { formatDate, formatNumber, formatValue } from '../../lib/formatters';

const ProductThumbnail = ({ src, alt }) =>
  src ? (
    <img
      src={src}
      alt={alt}
      className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
      loading="lazy"
    />
  ) : (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-300 ring-1 ring-slate-200">
      —
    </div>
  );

const ReturnsTable = ({ records, onView, pagination, onPageChange }) => {
  const { imageFor } = useProductImages(records);

  return (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {[
              'Invoice No.',
              'Product',
              'Qty',
              'Total',
              'Channel',
              'Status',
              'Return Date',
              '',
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
          {records.map((record) => (
            <tr key={record._id} className="transition even:bg-slate-50/60 hover:bg-indigo-50/40">
              <td className="whitespace-nowrap px-4 py-3">
                <div className="font-medium text-slate-900">
                  {formatValue(record.invoice_number)}
                </div>
                <div className="text-xs text-slate-400">{formatValue(record.channel_order_id)}</div>
              </td>
              <td className="px-4 py-3 text-slate-600">
                <div className="flex items-center gap-3">
                  <ProductThumbnail src={imageFor(record.porduct_sku_code)} alt={record.product_name} />
                  <div className="min-w-0">
                    <div className="max-w-[18rem] truncate" title={record.product_name}>
                      {formatValue(record.product_name)}
                    </div>
                    <div className="text-xs text-slate-400">{formatValue(record.porduct_sku_code)}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">
                {formatValue(record.qty)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums font-medium text-slate-700">
                {formatNumber(record.total)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {formatValue(record.channel_name)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge value={record.order_status} />
              </td>

              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {formatDate(record.return_date)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onView(record)}
                  className="rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {pagination && (
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={onPageChange}
      />
    )}
  </div>
  );
};

export default ReturnsTable;
