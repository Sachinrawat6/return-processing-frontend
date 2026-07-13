import { useEffect, useState } from 'react';
import SearchBar from '../components/search/SearchBar';
import ReturnsTable from '../components/search/ReturnsTable';
import RecordDetailDrawer from '../components/search/RecordDetailDrawer';
import Banner from '../components/common/Banner';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import {
  fetchAllReturns,
  fetchReturnByField,
  fetchReturnsBySearchTerm,
  ApiRequestError,
} from '../lib/api';
import { SEARCHABLE_FIELDS } from '../lib/schema';

const PAGE_SIZE = 20;

const SearchPage = () => {
  const [field, setField] = useState('all');
  const [term, setTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [records, setRecords] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [lastSearchedTerm, setLastSearchedTerm] = useState('');

  const loadPage = async (page) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAllReturns(page, PAGE_SIZE);
      setRecords(result.records);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, []);

  const runSearch = async () => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setRecords(null);
    setPagination(null);
    setIsSearchMode(true);
    setLastSearchedTerm(trimmed);

    try {
      if (field === 'all') {
        const results = await fetchReturnsBySearchTerm(
          trimmed,
          SEARCHABLE_FIELDS.map((f) => f.key)
        );
        setRecords(results);
      } else {
        const record = await fetchReturnByField(field, trimmed);
        setRecords([record]);
      }
    } catch (err) {
      if (err instanceof ApiRequestError && err.statusCode === 404) {
        setRecords([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTerm('');
    setField('all');
    setError(null);
    setLastSearchedTerm('');
    setIsSearchMode(false);
    loadPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
            Return Records
          </h2>
          <p className="text-sm text-slate-500">
            Browse and search returns synced from every sales channel.
          </p>
        </div>
        {!isSearchMode && pagination && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-100">
            <span className="font-display font-semibold">{pagination.total}</span> total returns
          </span>
        )}
      </div>

      <SearchBar
        field={field}
        term={term}
        onFieldChange={setField}
        onTermChange={setTerm}
        onSubmit={runSearch}
        onClear={handleClear}
        loading={loading}
      />

      {error && (
        <Banner variant="error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">
            {isSearchMode ? 'Searching returns…' : 'Loading returns…'}
          </span>
        </div>
      )}

      {!loading && records !== null && records.length === 0 && (
        <EmptyState
          title={isSearchMode ? 'No matching return records' : 'No return records yet'}
          description={
            isSearchMode
              ? `We couldn't find anything for "${lastSearchedTerm}". Try a different field or term.`
              : 'Import a CSV or Excel file from the Import tab to get started.'
          }
        />
      )}

      {!loading && records !== null && records.length > 0 && (
        <>
          {isSearchMode && (
            <p className="text-sm text-slate-500">
              {records.length} record{records.length > 1 ? 's' : ''} found
            </p>
          )}
          <ReturnsTable
            records={records}
            onView={setSelectedRecord}
            pagination={!isSearchMode ? pagination : null}
            onPageChange={loadPage}
          />
        </>
      )}

      <RecordDetailDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
};

export default SearchPage;
