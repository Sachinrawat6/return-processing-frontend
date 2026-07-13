import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/common/Banner';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { fetchSessionLogs, deleteSessionLog, downloadSessionCsv } from '../lib/api';
import { formatDateTime } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';

const LogsPage = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchSessionLogs()
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteSessionLog(pendingDelete._id);
      setLogs((prev) => prev.filter((log) => log._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (id) => {
    setDownloadingId(id);
    try {
      await downloadSessionCsv(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">Return Logs</h2>
        <p className="text-sm text-slate-500">Every completed scanning session, with its accepted returns.</p>
      </div>

      {error && (
        <Banner variant="error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Loading logs…</span>
        </div>
      )}

      {!loading && logs && logs.length === 0 && (
        <EmptyState
          icon="🗂️"
          title="No logs yet"
          description="End a scan session from the Scan Returns page to create your first log."
        />
      )}

      {!loading && logs && logs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Started', 'Ended', 'Records', ''].map((heading) => (
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
                {logs.map((log) => (
                  <tr key={log._id} className="even:bg-slate-50/60">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(log.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(log.endedAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-slate-800">
                      {log.recordCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/logs/${log._id}`}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDownload(log._id)}
                          disabled={downloadingId === log._id}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
                        >
                          {downloadingId === log._id ? 'Downloading…' : 'Download CSV'}
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setPendingDelete(log)}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this log?"
          description={`This will permanently delete this session log and its ${pendingDelete.recordCount} accepted record${
            pendingDelete.recordCount > 1 ? 's' : ''
          }. This cannot be undone.`}
          confirmLabel="Delete Log"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default LogsPage;
