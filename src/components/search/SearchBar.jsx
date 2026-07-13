import { SEARCHABLE_FIELDS } from '../../lib/schema';

const SearchBar = ({ field, term, onFieldChange, onTermChange, onSubmit, onClear, loading }) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
  >
    <select
      value={field}
      onChange={(event) => onFieldChange(event.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 sm:w-56"
    >
      <option value="all">All fields</option>
      {SEARCHABLE_FIELDS.map((f) => (
        <option key={f.key} value={f.key}>
          {f.label}
        </option>
      ))}
    </select>

    <div className="relative flex-1">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        🔍
      </span>
      <input
        type="text"
        value={term}
        onChange={(event) => onTermChange(event.target.value)}
        placeholder="Search by order ID, invoice number, tracking ID…"
        className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </div>

    <div className="flex gap-2">
      <button
        type="submit"
        disabled={loading || !term.trim()}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Searching…' : 'Search'}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        Clear
      </button>
    </div>
  </form>
);

export default SearchBar;
