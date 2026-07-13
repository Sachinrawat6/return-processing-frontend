import { ALL_FIELDS } from './schema';

const FIELD_META_BY_KEY = new Map(ALL_FIELDS.map((field) => [field.key, field]));

// Marketplace export files use human-readable headers (e.g. "Channel Sub Order Id")
// rather than the backend's snake_case field names, so headers are matched fuzzily.
const normalizeHeader = (header) => String(header ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const HEADER_TO_KEY = new Map();
ALL_FIELDS.forEach((field) => {
  HEADER_TO_KEY.set(normalizeHeader(field.key), field.key);
  HEADER_TO_KEY.set(normalizeHeader(field.label), field.key);
  (field.aliases || []).forEach((alias) => HEADER_TO_KEY.set(normalizeHeader(alias), field.key));
});

const resolveSchemaKey = (header) => HEADER_TO_KEY.get(normalizeHeader(header)) || null;

// Excel's day-zero, adjusted for the well-known 1900 leap-year bug.
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);

const excelSerialToDate = (serial) => new Date(EXCEL_EPOCH_MS + serial * 86400000);

const parseFlexibleDate = (value) => {
  if (value instanceof Date) return value;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return excelSerialToDate(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // DD/MM/YYYY or DD-MM-YYYY, optionally with a HH:mm time — marketplace
    // exports use either separator depending on whether it's XLSX or CSV.
    const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (dmy) {
      const [, day, month, year, hour = '0', minute = '0'] = dmy;
      const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const native = new Date(trimmed);
    if (!Number.isNaN(native.getTime())) return native;
  }

  return null;
};

const stripTextForcingMark = (str) => (str.startsWith('`') ? str.slice(1).trim() : str);

// These order statuses aren't real, actionable returns yet, so imports skip them.
const EXCLUDED_ORDER_STATUSES = new Set(
  ['Cancelled Return Received', 'Packed', 'New'].map((status) => status.toLowerCase())
);

const isExcludedOrderStatus = (record) =>
  EXCLUDED_ORDER_STATUSES.has(String(record.order_status || '').trim().toLowerCase());

const coerceValue = (key, rawValue) => {
  if (rawValue === undefined || rawValue === null) return '';
  const type = FIELD_META_BY_KEY.get(key)?.type;

  if (type === 'number') {
    if (typeof rawValue === 'number') return rawValue;
    const cleaned = String(rawValue).trim().replace(/,/g, '');
    if (cleaned === '') return '';
    const num = Number(cleaned);
    return Number.isNaN(num) ? '' : num;
  }

  if (type === 'date') {
    const parsed = parseFlexibleDate(rawValue);
    if (parsed) return parsed.toISOString();
    return typeof rawValue === 'string' ? rawValue.trim() : '';
  }

  const str = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue).trim();
  return stripTextForcingMark(str);
};

export async function parseImportFile(file) {
  // Loaded lazily since xlsx is a large dependency only needed on the import flow.
  const XLSX = await import('xlsx');
  const sheetToRows = (sheet) => XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  // Pick whichever sheet's headers best match our schema — export files can
  // include a full marketplace dump alongside a slimmer sheet meant for this
  // system, so favor the sheet with the highest proportion of known columns.
  let best = null;
  workbook.SheetNames.forEach((sheetName) => {
    const rows = sheetToRows(workbook.Sheets[sheetName]);
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const recognizedCount = headers.filter((header) => resolveSchemaKey(header)).length;
    const matchRatio = recognizedCount / headers.length;
    if (!best || matchRatio > best.matchRatio || (matchRatio === best.matchRatio && recognizedCount > best.recognizedCount)) {
      best = { sheetName, rows, headers, recognizedCount, matchRatio };
    }
  });

  if (!best || best.recognizedCount === 0) {
    return { records: [], recognizedFields: [], unrecognizedColumns: best?.headers || [], sheetName: best?.sheetName || null };
  }

  const recognizedFields = [];
  const seenKeys = new Set();
  const unrecognizedColumns = [];
  const columnKeyByHeader = new Map();

  best.headers.forEach((header) => {
    const key = resolveSchemaKey(header);
    if (key) {
      columnKeyByHeader.set(header, key);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        const meta = FIELD_META_BY_KEY.get(key);
        recognizedFields.push({ key, label: meta.label, type: meta.type, sourceHeader: header });
      }
    } else {
      unrecognizedColumns.push(header);
    }
  });

  const allRecords = best.rows.map((row) => {
    const record = {};
    columnKeyByHeader.forEach((key, header) => {
      record[key] = coerceValue(key, row[header]);
    });
    return record;
  });

  const records = allRecords.filter((record) => !isExcludedOrderStatus(record));
  const skippedByStatus = allRecords.length - records.length;

  return { records, recognizedFields, unrecognizedColumns, sheetName: best.sheetName, skippedByStatus };
}
