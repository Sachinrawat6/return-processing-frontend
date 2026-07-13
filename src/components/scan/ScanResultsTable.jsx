import { RETURN_TYPES } from '../../lib/returnTypes';
import { formatValue } from '../../lib/formatters';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ScanResultsTable = ({ rows, onUpdateRow, onAcceptRow }) => (
  <div className="space-y-3">
    {rows.map((row) => {
      const rowId = row.record._id;
      const sentQty = row.record.qty || 0;

      const handleGoodQtyChange = (raw) => {
        const parsed = Number(raw);
        const safe = Number.isFinite(parsed) ? parsed : 0;
        onUpdateRow(rowId, { goodQty: clamp(safe, 0, sentQty - row.badQty) });
      };

      const handleBadQtyChange = (raw) => {
        const parsed = Number(raw);
        const safe = Number.isFinite(parsed) ? parsed : 0;
        onUpdateRow(rowId, { badQty: clamp(safe, 0, sentQty - row.goodQty) });
      };

      return (
        <div
          key={rowId}
          className="space-y-3 rounded-xl border border-slate-200 w-xl p-4 shadow-sm"
        >
          {/* Row 1: identity + quantities */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-slate-900">
                {formatValue(row.record.porduct_sku_code)}
              </p>
              <p
                className="max-w-[16rem] truncate text-xs text-slate-400"
                title={row.record.product_name}
              >
                {formatValue(row.record.product_name)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="text-slate-600">
                <span className="text-xs text-slate-400">Invoice</span>
                <p>{formatValue(row.record.invoice_number)}</p>
              </div>
              <div className="tabular-nums text-slate-600">
                <span className="text-xs text-slate-400">Sent Qty</span>
                <p>{sentQty}</p>
              </div>
              <label className="text-slate-600">
                <span className="mb-1 block text-xs text-slate-400">Good Qty</span>
                <input
                  type="number"
                  min={0}
                  max={sentQty - row.badQty}
                  value={row.goodQty}
                  onChange={(event) => handleGoodQtyChange(event.target.value)}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm tabular-nums focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="text-slate-600">
                <span className="mb-1 block text-xs text-slate-400">Bad Qty</span>
                <input
                  type="number"
                  min={0}
                  max={sentQty - row.goodQty}
                  value={row.badQty}
                  onChange={(event) => handleBadQtyChange(event.target.value)}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm tabular-nums focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>
          </div>

          {/* Row 2: return type */}
          <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-500">Return Type</span>
              <select
                value={row.returnType}
                onChange={(event) => onUpdateRow(rowId, { returnType: event.target.value })}
                className="rounded-lg border border-slate-300 bg-white w-lg px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  Select return type…
                </option>
                {RETURN_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Row 3: accept action */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
            {row.error && <p className="text-xs text-red-600">{row.error}</p>}
            <button
              type="button"
              onClick={() => onAcceptRow(rowId)}
              disabled={row.accepting || !row.returnType || row.goodQty + row.badQty === 0}
              className=" w-full rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {row.accepting ? 'Accepting…' : 'Accept'}
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

export default ScanResultsTable;
