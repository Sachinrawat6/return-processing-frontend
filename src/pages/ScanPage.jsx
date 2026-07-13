import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScanResultsTable from '../components/scan/ScanResultsTable';
import ScanImagePanel from '../components/scan/ScanImagePanel';
import ScannedRecordsList from '../components/scan/ScannedRecordsList';
import UnmatchedScanPanel from '../components/scan/UnmatchedScanPanel';
import Banner from '../components/common/Banner';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  fetchActiveSession,
  endActiveSession,
  acceptReturn,
  scanReturnExact,
  createUnmatchedScan,
  updateUnmatchedScanChannel,
  ApiRequestError,
} from '../lib/api';

const buildRow = (record) => ({
  record,
  goodQty: 0,
  badQty: 0,
  returnType: '',
  accepting: false,
  error: null,
});

const ScanPage = () => {
  const navigate = useNavigate();
  const scanInputRef = useRef(null);

  const [scanValue, setScanValue] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [rows, setRows] = useState([]);
  const [unmatchedEntry, setUnmatchedEntry] = useState(null);
  const [unmatchedSaving, setUnmatchedSaving] = useState(false);
  const [unmatchedError, setUnmatchedError] = useState(null);

  const [acceptances, setAcceptances] = useState([]);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    fetchActiveSession()
      .then((result) => setAcceptances(result.acceptances))
      .catch((err) => setScanError(err.message))
      .finally(() => setLoadingSession(false));

    scanInputRef.current?.focus();
  }, []);

  const handleScanSubmit = async (event) => {
    event.preventDefault();
    const term = scanValue.trim();
    if (!term) return;

    setScanning(true);
    setScanError(null);
    setUnmatchedEntry(null);
    setUnmatchedError(null);

    try {
      const results = await scanReturnExact(term);
      setRows(results.map(buildRow));
    } catch (err) {
      setRows([]);
      if (err instanceof ApiRequestError && err.statusCode === 404) {
        try {
          const entry = await createUnmatchedScan(term);
          setUnmatchedEntry(entry);
        } catch (unmatchedErr) {
          setScanError(unmatchedErr.message);
        }
      } else {
        setScanError(err.message);
      }
    } finally {
      setScanning(false);
      scanInputRef.current?.focus();
    }
  };

  const handleAssignUnmatchedChannel = async (channel) => {
    if (!unmatchedEntry) return;
    setUnmatchedSaving(true);
    setUnmatchedError(null);

    try {
      const updated = unmatchedEntry._id
        ? await updateUnmatchedScanChannel(unmatchedEntry._id, channel)
        : await createUnmatchedScan(unmatchedEntry.scanned_id, channel);
      setUnmatchedEntry(updated);
    } catch (err) {
      setUnmatchedError(err.message);
    } finally {
      setUnmatchedSaving(false);
    }
  };

  const updateRow = (rowId, patch) => {
    setRows((prev) => prev.map((row) => (row.record._id === rowId ? { ...row, ...patch } : row)));
  };

  const handleAcceptRow = async (rowId) => {
    const row = rows.find((r) => r.record._id === rowId);
    if (!row) return;

    updateRow(rowId, { accepting: true, error: null });

    try {
      const acceptance = await acceptReturn({
        return_record_id: row.record._id,
        good_qty: row.goodQty,
        bad_qty: row.badQty,
        return_type: row.returnType,
      });
      setAcceptances((prev) => [acceptance, ...prev]);
      setRows((prev) => prev.filter((r) => r.record._id !== rowId));
      setScanValue('');
      scanInputRef.current?.focus();
    } catch (err) {
      updateRow(rowId, { accepting: false, error: err.message });
    }
  };

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await endActiveSession();
      setShowEndConfirm(false);
      navigate('/logs');
    } catch (err) {
      setScanError(err.message);
      setShowEndConfirm(false);
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
            Scan Returns
          </h2>
          <p className="text-sm text-slate-500">
            Scan a return by any field — every matching item shows up below so you can accept them
            all at once.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowEndConfirm(true)}
          disabled={acceptances.length === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          End Session
        </button>
      </div>

      <form
        onSubmit={handleScanSubmit}
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            📷
          </span>
          <input
            ref={scanInputRef}
            type="text"
            value={scanValue}
            onChange={(event) => setScanValue(event.target.value)}
            placeholder="Scan or type order ID, invoice number, tracking ID…"
            autoFocus
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button
          type="submit"
          disabled={scanning || !scanValue.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {scanning ? 'Scanning…' : 'Scan'}
        </button>
      </form>

      {scanError && (
        <Banner variant="error" onDismiss={() => setScanError(null)}>
          {scanError}
        </Banner>
      )}

      {unmatchedEntry && (
        <UnmatchedScanPanel
          entry={unmatchedEntry}
          onAssignChannel={handleAssignUnmatchedChannel}
          saving={unmatchedSaving}
          error={unmatchedError}
        />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScanImagePanel rows={rows} />
        </div>

        <div className="space-y-2 lg:col-span-1">
          {rows.length > 0 && (
            <>
              <p className="text-sm text-slate-500">
                {rows.length} item{rows.length > 1 ? 's' : ''} found — fill in quantities and accept
                each one.
              </p>
              <ScanResultsTable rows={rows} onUpdateRow={updateRow} onAcceptRow={handleAcceptRow} />
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-slate-700">
          Accepted this session {acceptances.length > 0 && `(${acceptances.length})`}
        </h3>

        {loadingSession && (
          <div className="flex items-center justify-center  gap-2 py-10 text-slate-500">
            <Spinner className="h-5 w-5" />
            <span className="text-sm">Loading session…</span>
          </div>
        )}

        {!loadingSession && acceptances.length === 0 && (
          <EmptyState
            icon="📦"
            title="No returns accepted yet"
            description="Scan a return above to get started."
          />
        )}

        {!loadingSession && acceptances.length > 0 && (
          <ScannedRecordsList acceptances={acceptances} />
        )}
      </div>

      {showEndConfirm && (
        <ConfirmDialog
          title="End this session?"
          description={`This will close the current session and create a log with ${acceptances.length} accepted record${
            acceptances.length > 1 ? 's' : ''
          }. You can download it as a CSV from the Return Logs page afterwards.`}
          confirmLabel="End Session"
          onConfirm={handleEndSession}
          onCancel={() => setShowEndConfirm(false)}
          loading={ending}
        />
      )}
    </div>
  );
};

export default ScanPage;
