import { useState } from 'react';
import FileDropzone from './FileDropzone';
import Banner from '../common/Banner';
import { parseProductStyleFile } from '../../lib/parseProductStyleFile';
import { bulkUpsertProductStyles } from '../../lib/api';

const MAX_PREVIEW_STYLES = 6;

const ProductImagesImport = () => {
  const [fileName, setFileName] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(null);

  const handleFile = async (file) => {
    setFileName(file.name);
    setParsed(null);
    setParseError(null);
    setSyncSuccess(null);
    setSyncError(null);

    try {
      const result = await parseProductStyleFile(file);
      if (result.records.length === 0) {
        setParseError('No matching "Variant SKU" / "Image Src" rows were found in this file.');
        return;
      }
      setParsed(result);
    } catch (err) {
      setParseError(err.message);
    }
  };

  const handleSync = async () => {
    if (!parsed) return;
    setSyncing(true);
    setSyncError(null);

    try {
      const result = await bulkUpsertProductStyles(parsed.records);
      setSyncSuccess(
        `Synced images for ${result.styleCount} style${result.styleCount > 1 ? 's' : ''} (${result.upserted} new).`
      );
      setParsed(null);
      setFileName(null);
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-5">
      <Banner variant="info">
        Upload a product export with <strong>Variant SKU</strong> and <strong>Image Src</strong> columns (e.g. a Shopify
        product CSV). Images are grouped by the style number — the leading digits of the SKU shared across every
        color and size — and matched against returns by the same style number in their SKU code.
      </Banner>

      {syncSuccess && (
        <Banner variant="success" onDismiss={() => setSyncSuccess(null)}>
          {syncSuccess}
        </Banner>
      )}
      {syncError && (
        <Banner variant="error" onDismiss={() => setSyncError(null)}>
          {syncError}
        </Banner>
      )}
      {parseError && (
        <Banner variant="error" onDismiss={() => setParseError(null)}>
          {parseError}
        </Banner>
      )}

      <FileDropzone onFile={handleFile} fileName={fileName} />

      {parsed && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              <strong>{parsed.records.length}</strong> style{parsed.records.length > 1 ? 's' : ''} ·{' '}
              <strong>{parsed.imageCount}</strong> image{parsed.imageCount !== 1 ? 's' : ''} from{' '}
              <strong>{parsed.rowCount}</strong> row{parsed.rowCount > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : `Sync ${parsed.records.length} style${parsed.records.length > 1 ? 's' : ''}`}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {parsed.records.slice(0, MAX_PREVIEW_STYLES).map((style) => (
              <div
                key={style.style_number}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <img src={style.images[0]} alt={style.style_number} className="h-24 w-full object-cover" />
                <div className="px-2 py-1.5 text-center text-xs font-medium text-slate-600">
                  {style.style_number}
                  <span className="block text-[11px] text-slate-400">
                    {style.images.length} image{style.images.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {parsed.records.length > MAX_PREVIEW_STYLES && (
            <p className="text-xs text-slate-400">
              +{parsed.records.length - MAX_PREVIEW_STYLES} more style{parsed.records.length - MAX_PREVIEW_STYLES > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImagesImport;
