const ConfirmDialog = ({ title, description, confirmLabel, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
    <button
      type="button"
      aria-label="Cancel"
      onClick={onCancel}
      className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
    />
    <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Importing…' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
