const EmptyState = ({ title, description, icon = '📭' }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center">
    <span className="text-4xl">{icon}</span>
    <p className="font-display mt-3 text-sm font-semibold text-slate-700">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
  </div>
);

export default EmptyState;
