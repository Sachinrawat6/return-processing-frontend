const PALETTE = [
  'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'bg-teal-50 text-teal-700 ring-teal-200',
  'bg-amber-50 text-amber-800 ring-amber-200',
  'bg-rose-50 text-rose-700 ring-rose-200',
  'bg-violet-50 text-violet-700 ring-violet-200',
  'bg-slate-100 text-slate-700 ring-slate-200',
];

const hashToIndex = (value, length) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
};

const StatusBadge = ({ value }) => {
  if (!value) {
    return <span className="text-slate-400">—</span>;
  }
  const classes = PALETTE[hashToIndex(String(value), PALETTE.length)];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}>
      {value}
    </span>
  );
};

export default StatusBadge;
