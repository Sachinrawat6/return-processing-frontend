import { useEffect, useRef, useState } from 'react';
import Banner from '../components/common/Banner';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDateTime, formatValue } from '../lib/formatters';
import { parseIdListFile } from '../lib/parseIdListFile';
import { downloadTextFile } from '../lib/downloadTextFile';
import {
  fetchUnmatchedScans,
  fetchChannels,
  updateUnmatchedScanChannel,
  deleteUnmatchedScan,
  downloadUnmatchedScansCsv,
  matchScannedIds,
  downloadMatchedScanIdsCsv,
} from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 20;
const MATCH_TEMPLATE_CSV = 'Scanned ID';

const UnmatchedRecordsPage = () => {
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channels, setChannels] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchPreview, setMatchPreview] = useState(null);
  const [downloadingMatch, setDownloadingMatch] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const loadPage = (page) => {
    setLoading(true);
    setError(null);
    fetchUnmatchedScans(page, PAGE_SIZE)
      .then((result) => {
        setRecords(result.records);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPage(1);
    fetchChannels()
      .then(setChannels)
      .catch(() => {});
  }, []);

  const handleChannelChange = async (id, channel) => {
    try {
      const updated = await updateUnmatchedScanChannel(id, channel);
      setRecords((prev) => prev.map((record) => (record._id === id ? updated : record)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteUnmatchedScan(pendingDelete._id);
      setRecords((prev) => prev.filter((record) => record._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleMatchFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setMatching(true);
    setError(null);
    setMatchPreview(null);
    try {
      const ids = await parseIdListFile(file);
      if (ids.length === 0) {
        setError('No scanned ids were found in that file.');
        return;
      }
      const result = await matchScannedIds(ids);
      setMatchPreview({ ids, ...result });
    } catch (err) {
      setError(err.message);
    } finally {
      setMatching(false);
    }
  };

  const handleDownloadMatched = async () => {
    if (!matchPreview) return;
    setDownloadingMatch(true);
    setError(null);
    try {
      await downloadMatchedScanIdsCsv(matchPreview.ids);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingMatch(false);
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    setError(null);
    try {
      await downloadUnmatchedScansCsv();
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
            Unmatched Records
          </h2>
          <p className="text-sm text-slate-500">
            Scans that didn&apos;t match any return record, with their channel.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleMatchFile}
          />
          <button
            type="button"
            onClick={() => downloadTextFile('ScannedIdsTemplate.csv', MATCH_TEMPLATE_CSV)}
            className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
          >
            Download Template
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={matching}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {matching ? 'Matching…' : 'Upload IDs to Match'}
          </button>
          <button
            type="button"
            onClick={handleExportAll}
            disabled={exporting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {exporting ? 'Exporting…' : 'Export All'}
          </button>
        </div>
      </div>

      {error && (
        <Banner variant="error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      {matchPreview && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm text-indigo-800">
            <span className="font-semibold">{matchPreview.matchedCount}</span> of{' '}
            <span className="font-semibold">{matchPreview.total}</span> scanned ID
            {matchPreview.total > 1 ? 's' : ''} matched a channel.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMatchPreview(null)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleDownloadMatched}
              disabled={downloadingMatch}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {downloadingMatch ? 'Downloading…' : 'Download CSV'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Loading unmatched records…</span>
        </div>
      )}

      {!loading && records && records.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No unmatched scans"
          description="Every scan so far has matched a known return record."
        />
      )}

      {!loading && records && records.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Scanned ID', 'Channel', 'Scanned At', ''].map((heading) => (
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
                  <tr key={record._id} className="even:bg-slate-50/60">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {formatValue(record.scanned_id)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {editingId === record._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            autoFocus
                            defaultValue={record.channel || ''}
                            onChange={(event) =>
                              handleChannelChange(record._id, event.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          >
                            <option value="" disabled>
                              Select channel…
                            </option>
                            {channels.map((channel) => (
                              <option key={channel._id} value={channel.name}>
                                {channel.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-xs text-slate-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">{formatValue(record.channel)}</span>
                          <button
                            type="button"
                            onClick={() => setEditingId(record._id)}
                            className="rounded-md px-2 py-0.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {formatDateTime(record.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setPendingDelete(record)}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
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
              onPageChange={loadPage}
            />
          )}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this unmatched record?"
          description={`This will permanently remove the record for "${pendingDelete.scanned_id}". This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default UnmatchedRecordsPage;
