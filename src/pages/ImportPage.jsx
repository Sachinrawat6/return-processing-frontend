import { useState } from 'react';
import FileDropzone from '../components/import/FileDropzone';
import PreviewTable from '../components/import/PreviewTable';
import ProductImagesImport from '../components/import/ProductImagesImport';
import ChannelMappingImport from '../components/import/ChannelMappingImport';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Banner from '../components/common/Banner';
import { parseImportFile } from '../lib/parseImportFile';
import { bulkCreateReturns } from '../lib/api';

const SUB_TABS = [
  { key: 'bulk', label: 'Bulk Import (CSV / Excel)' },
  { key: 'images', label: 'Product Images' },
  { key: 'channels', label: 'Channel Mapping' },
];

const ImportPage = () => {
  const [subTab, setSubTab] = useState('bulk');
  const [fileName, setFileName] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);

  const handleFile = async (file) => {
    setFileName(file.name);
    setParsed(null);
    setParseError(null);
    setImportSuccess(null);
    setImportError(null);

    try {
      const result = await parseImportFile(file);
      if (result.records.length === 0) {
        setParseError(
          result.skippedByStatus > 0
            ? `All ${result.skippedByStatus} row(s) in this file have an excluded order status (Cancelled Return Received / Packed / New) and were skipped.`
            : 'The file has no data rows.'
        );
        return;
      }
      setParsed(result);
    } catch (err) {
      setParseError(`Could not read file: ${err.message}`);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsed) return;
    setImporting(true);
    setImportError(null);

    try {
      const records = await bulkCreateReturns(parsed.records);
      setImportSuccess(`Imported ${records.length} return record${records.length > 1 ? 's' : ''}. Previous records were replaced.`);
      setShowConfirm(false);
      setParsed(null);
      setFileName(null);
    } catch (err) {
      setImportError(err.message);
      setShowConfirm(false);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">Import Data</h2>
        <p className="text-sm text-slate-500">Bulk-load returns from a marketplace export.</p>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 sm:w-fit">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSubTab(tab.key)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
              subTab === tab.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'bulk' && (
        <div className="space-y-5">
          <Banner variant="warning">
            Importing a file <strong>replaces every existing return record</strong> in the database. Export or back up
            current data first if you need to keep it.
          </Banner>

          {importSuccess && (
            <Banner variant="success" onDismiss={() => setImportSuccess(null)}>
              {importSuccess}
            </Banner>
          )}
          {importError && (
            <Banner variant="error" onDismiss={() => setImportError(null)}>
              {importError}
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
                  <strong>{parsed.records.length}</strong> row{parsed.records.length > 1 ? 's' : ''} ready to import from sheet{' '}
                  <strong>&ldquo;{parsed.sheetName}&rdquo;</strong> ·{' '}
                  <strong>{parsed.recognizedFields.length}</strong> column{parsed.recognizedFields.length !== 1 ? 's' : ''} recognized
                </p>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Import {parsed.records.length} record{parsed.records.length > 1 ? 's' : ''}
                </button>
              </div>

              {parsed.unrecognizedColumns.length > 0 && (
                <Banner variant="info">
                  Ignoring unrecognized column{parsed.unrecognizedColumns.length > 1 ? 's' : ''}:{' '}
                  {parsed.unrecognizedColumns.join(', ')}
                </Banner>
              )}

              {parsed.skippedByStatus > 0 && (
                <Banner variant="info">
                  Skipped {parsed.skippedByStatus} row{parsed.skippedByStatus > 1 ? 's' : ''} with an excluded order
                  status (Cancelled Return Received / Packed / New).
                </Banner>
              )}

              <PreviewTable records={parsed.records} fields={parsed.recognizedFields} />
            </div>
          )}
        </div>
      )}

      {subTab === 'images' && <ProductImagesImport />}

      {subTab === 'channels' && <ChannelMappingImport />}

      {showConfirm && (
        <ConfirmDialog
          title="Replace all return records?"
          description={`This will permanently delete existing return records and insert ${parsed?.records.length} new record${
            parsed?.records.length > 1 ? 's' : ''
          } from "${fileName}". This action cannot be undone.`}
          confirmLabel="Yes, replace and import"
          onConfirm={handleConfirmImport}
          onCancel={() => setShowConfirm(false)}
          loading={importing}
        />
      )}
    </div>
  );
};

export default ImportPage;
