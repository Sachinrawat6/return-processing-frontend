const normalizeHeader = (header) => String(header ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const ID_HEADER_ALIASES = new Set(
  ['scannedid', 'id', 'orderid', 'scannedidid', 'trackingid', 'value'].map(normalizeHeader)
);

// Accepts a CSV/XLSX with a recognizable id column, or falls back to the
// first column if no header matches — keeps this forgiving for ad-hoc lists.
export async function parseIdListFile(file) {
  const XLSX = await import('xlsx');

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true, header: 1 });

  if (rows.length === 0) return [];

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header) => String(header ?? ''));
  const matchedIndex = headers.findIndex((header) => ID_HEADER_ALIASES.has(normalizeHeader(header)));
  const columnIndex = matchedIndex >= 0 ? matchedIndex : 0;
  const hasHeaderRow = matchedIndex >= 0;

  const rowsToRead = hasHeaderRow ? dataRows : rows;

  const seen = new Set();
  const ids = [];
  rowsToRead.forEach((row) => {
    const value = String(row[columnIndex] ?? '').trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    ids.push(value);
  });

  return ids;
}
