import { useEffect, useState } from 'react';
import { FIELD_GROUPS } from '../../lib/schema';
import { formatDate, formatDateTime, formatNumber, formatValue } from '../../lib/formatters';
import { fetchProductStylesByCodes } from '../../lib/api';
import { extractStyleNumber } from '../../lib/styleNumber';

const renderFieldValue = (field, record) => {
  const raw = record[field.key];
  if (field.type === 'date') return formatDate(raw);
  if (field.type === 'number') return formatNumber(raw);
  return formatValue(raw);
};

const RecordDetailDrawer = ({ record, onClose }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const styleNumber = extractStyleNumber(record?.porduct_sku_code);
    if (!styleNumber) {
      setImages([]);
      return;
    }

    let cancelled = false;
    fetchProductStylesByCodes([styleNumber])
      .then((styles) => {
        if (!cancelled) setImages(styles[0]?.images || []);
      })
      .catch(() => {
        if (!cancelled) setImages([]);
      });

    return () => {
      cancelled = true;
    };
  }, [record?.porduct_sku_code]);

  if (!record) return null;

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight text-slate-900">Return Record</h2>
            <p className="text-xs text-slate-500">
              Invoice {formatValue(record.invoice_number || record.order_id)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-6 px-6 py-5">
          {images.length > 0 && (
            <section>
              <img
                src={images[0]}
                alt={record.product_name}
                className="aspect-square w-full rounded-lg object-cover ring-1 ring-slate-200"
              />
              {images.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {images.slice(1).map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt={record.product_name}
                      className="h-14 w-14 shrink-0 rounded-md object-cover ring-1 ring-slate-200"
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {FIELD_GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group.title}
              </h3>
              <dl className="space-y-2">
                {group.fields.map((field) => (
                  <div key={field.key} className="flex items-start justify-between gap-4 text-sm">
                    <dt className="text-slate-500">{field.label}</dt>
                    <dd
                      className={`text-right font-medium text-slate-800 ${field.type === 'number' ? 'tabular-nums' : ''}`}
                    >
                      {renderFieldValue(field, record)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Timestamps
            </h3>
            <dl className="space-y-2">
              <div className="flex items-start justify-between gap-4 text-sm">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-right font-medium text-slate-800">{formatDateTime(record.createdAt)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 text-sm">
                <dt className="text-slate-500">Updated</dt>
                <dd className="text-right font-medium text-slate-800">{formatDateTime(record.updatedAt)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailDrawer;
