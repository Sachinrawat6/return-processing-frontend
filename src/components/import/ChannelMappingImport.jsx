import { useEffect, useState } from 'react';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import FileDropzone from './FileDropzone';
import Banner from '../common/Banner';
import Spinner from '../common/Spinner';
import EmptyState from '../common/EmptyState';
import { parseChannelMappingFile } from '../../lib/parseChannelMappingFile';
import { downloadTextFile } from '../../lib/downloadTextFile';
import {
  bulkUpsertChannelMappings,
  fetchChannelMappings,
  updateChannelMapping,
  deleteChannelMapping,
} from '../../lib/api';

const TEMPLATE_CSV = 'Prefix,Channel\nMYSC,Myntra\nNYK,Nykaa\n345,Shopify\n';

const MappingEditRow = ({ mapping, onSaved, onCancel }) => {
  const [prefix, setPrefix] = useState(mapping.prefix);
  const [channel, setChannel] = useState(mapping.channel);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateChannelMapping(mapping._id, { prefix, channel });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="bg-indigo-50/40">
      <td className="px-4 py-2.5">
        <input
          type="text"
          value={prefix}
          onChange={(event) => setPrefix(event.target.value.toUpperCase())}
          className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-medium uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          type="text"
          value={channel}
          onChange={(event) => setChannel(event.target.value)}
          className="w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </td>
      <td className="px-4 py-2.5 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !prefix.trim() || !channel.trim()}
            className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
};

const ChannelMappingImport = () => {
  const [fileName, setFileName] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(null);

  const [mappings, setMappings] = useState(null);
  const [loadingMappings, setLoadingMappings] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadMappings = () => {
    setLoadingMappings(true);
    fetchChannelMappings()
      .then(setMappings)
      .catch((err) => setSyncError(err.message))
      .finally(() => setLoadingMappings(false));
  };

  useEffect(() => {
    loadMappings();
  }, []);

  const handleFile = async (file) => {
    setFileName(file.name);
    setParsed(null);
    setParseError(null);
    setSyncSuccess(null);
    setSyncError(null);

    try {
      const result = await parseChannelMappingFile(file);
      if (result.records.length === 0) {
        setParseError('No matching "Prefix" / "Channel" rows were found in this file.');
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
      const result = await bulkUpsertChannelMappings(parsed.records);
      setSyncSuccess(`Synced ${result.mappingCount} mapping${result.mappingCount > 1 ? 's' : ''} (${result.upserted} new).`);
      setParsed(null);
      setFileName(null);
      loadMappings();
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteChannelMapping(id);
      setMappings((prev) => prev.filter((mapping) => mapping._id !== id));
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Left: upload */}
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm text-sky-800">
            Upload a CSV/Excel file with <strong>Prefix</strong> and <strong>Channel</strong> columns — e.g. row{' '}
            <code className="rounded bg-white/70 px-1 py-0.5">MYSC, Myntra</code>. Any order/tracking id starting with
            that prefix auto-resolves to the channel when scanned.
          </p>
          <button
            type="button"
            onClick={() => downloadTextFile('ChannelMappingTemplate.csv', TEMPLATE_CSV)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
          >
            <FiDownload aria-hidden="true" className="h-3.5 w-3.5" />
            Download Template
          </button>
        </div>

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
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">
              <strong>{parsed.records.length}</strong> mapping{parsed.records.length > 1 ? 's' : ''} ready from{' '}
              <strong>{parsed.rowCount}</strong> row{parsed.rowCount > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : `Sync ${parsed.records.length} mapping${parsed.records.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>

      {/* Right: mapping records */}
      <div className="space-y-3 lg:col-span-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-slate-800">Current Mappings</h3>
          <button
            type="button"
            onClick={loadMappings}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
          >
            <FiRefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {loadingMappings && (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
            <Spinner className="h-5 w-5" />
            <span className="text-sm">Loading mappings…</span>
          </div>
        )}

        {!loadingMappings && mappings && mappings.length === 0 && (
          <EmptyState
            icon="🔗"
            title="No channel mappings yet"
            description="Upload a file on the left to map order-id prefixes to channels."
          />
        )}

        {!loadingMappings && mappings && mappings.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Prefix', 'Channel', ''].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mappings.map((mapping) =>
                    editingId === mapping._id ? (
                      <MappingEditRow
                        key={mapping._id}
                        mapping={mapping}
                        onCancel={() => setEditingId(null)}
                        onSaved={(updated) => {
                          setMappings((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
                          setEditingId(null);
                        }}
                      />
                    ) : (
                      <tr key={mapping._id} className="even:bg-slate-50/60">
                        <td className="whitespace-nowrap px-4 py-2.5">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                            {mapping.prefix}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">
                          {mapping.channel}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(mapping._id)}
                              className="rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(mapping._id)}
                              disabled={deletingId === mapping._id}
                              className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === mapping._id ? 'Removing…' : 'Remove'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelMappingImport;
