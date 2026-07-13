import { useEffect, useState } from 'react';
import { useProductImages } from '../../hooks/useProductImages';
import { formatValue } from '../../lib/formatters';
import EmptyState from '../common/EmptyState';

const ScanImagePanel = ({ rows }) => {
  const { imageFor } = useProductImages(rows.map((row) => row.record));
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!preview) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preview]);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="🖼️"
        title="No item scanned"
        description="Scan a return to preview its product photo here."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {rows.map((row) => {
          const src = imageFor(row.record.porduct_sku_code);
          return (
            <div
              key={row.record._id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {src ? (
                <button
                  type="button"
                  onClick={() => setPreview({ src, alt: row.record.product_name })}
                  className="block w-full cursor-zoom-in"
                >
                  <img
                    src={src}
                    alt={row.record.product_name}
                    className="aspect-square w-full object-cover transition hover:opacity-90"
                  />
                </button>
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-sm text-slate-300">
                  No image
                </div>
              )}
              <div className="px-3 py-2.5">
                <p className="truncate text-sm font-medium text-slate-800" title={row.record.product_name}>
                  {formatValue(row.record.product_name)}
                </p>
                <p className="text-xs text-slate-400">{formatValue(row.record.porduct_sku_code)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-6">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreview(null)}
            className="absolute inset-0 h-full w-full cursor-zoom-out"
          />
          <img
            src={preview.src}
            alt={preview.alt}
            className="relative max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setPreview(null)}
            aria-label="Close"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default ScanImagePanel;
