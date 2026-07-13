const normalizeHeader = (header) => String(header ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const PREFIX_HEADER_ALIASES = new Set(
  ['prefix', 'orderprefix', 'orderidprefix', 'channelprefix'].map(normalizeHeader)
);
const CHANNEL_HEADER_ALIASES = new Set(['channel', 'channelname'].map(normalizeHeader));

export async function parseChannelMappingFile(file) {
  // Loaded lazily since xlsx is a large dependency only needed on the import flow.
  const XLSX = await import('xlsx');

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });

  if (rows.length === 0) {
    return { records: [], rowCount: 0 };
  }

  const headers = Object.keys(rows[0]);
  const prefixColumn = headers.find((header) => PREFIX_HEADER_ALIASES.has(normalizeHeader(header)));
  const channelColumn = headers.find((header) => CHANNEL_HEADER_ALIASES.has(normalizeHeader(header)));

  if (!prefixColumn || !channelColumn) {
    throw new Error('Could not find "Prefix" and "Channel" columns in this file.');
  }

  const seen = new Set();
  const records = [];

  rows.forEach((row) => {
    const prefix = String(row[prefixColumn] ?? '').trim().toUpperCase();
    const channel = String(row[channelColumn] ?? '').trim();
    if (!prefix || !channel || seen.has(prefix)) return;
    seen.add(prefix);
    records.push({ prefix, channel });
  });

  return { records, rowCount: rows.length };
}
