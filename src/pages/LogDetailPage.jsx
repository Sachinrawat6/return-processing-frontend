import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Banner from '../components/common/Banner';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ScannedRecordsList from '../components/scan/ScannedRecordsList';
import { fetchSessionDetail, deleteSessionLog, downloadSessionCsv } from '../lib/api';
import { formatDateTime } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';

const LogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSessionDetail(id)
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSessionLog(id);
      navigate('/logs');
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadSessionCsv(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Link to="/logs" className="text-sm font-medium text-indigo-600 hover:underline">
          ← Back to Return Logs
        </Link>
      </div>

      {error && (
        <Banner variant="error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Loading log…</span>
        </div>
      )}

      {!loading && detail && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">Session Log</h2>
              <p className="text-sm text-slate-500">
                Started {formatDateTime(detail.session.createdAt)} · Ended {formatDateTime(detail.session.endedAt)} ·{' '}
                <span className="font-medium text-slate-700">{detail.acceptances.length}</span> record
                {detail.acceptances.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {downloading ? 'Downloading…' : 'Download CSV'}
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete Log
                </button>
              )}
            </div>
          </div>

          {detail.acceptances.length === 0 ? (
            <EmptyState icon="📦" title="No records in this log" />
          ) : (
            <ScannedRecordsList acceptances={detail.acceptances} />
          )}
        </>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete this log?"
          description="This will permanently delete this session log and all of its accepted records. This cannot be undone."
          confirmLabel="Delete Log"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default LogDetailPage;
