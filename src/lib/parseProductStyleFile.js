import { extractStyleNumber } from './styleNumber';

const normalizeHeader = (header) => String(header ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const SKU_HEADER_ALIASES = new Set(['variantsku', 'sku', 'variantskucode'].map(normalizeHeader));
const IMAGE_HEADER_ALIASES = new Set(['imagesrc', 'image', 'imageurl'].map(normalizeHeader));

export async function parseProductStyleFile(file) {
  // Loaded lazily since xlsx is a large dependency only needed on the import flow.
  const XLSX = await import('xlsx');

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });

  if (rows.length === 0) {
    return { records: [], rowCount: 0, imageCount: 0, skuColumn: null, imageColumn: null };
  }

  const headers = Object.keys(rows[0]);
  const skuColumn = headers.find((header) => SKU_HEADER_ALIASES.has(normalizeHeader(header)));
  const imageColumn = headers.find((header) => IMAGE_HEADER_ALIASES.has(normalizeHeader(header)));

  if (!skuColumn || !imageColumn) {
    throw new Error('Could not find "Variant SKU" and "Image Src" columns in this file.');
  }

  const imagesByStyle = new Map();
  let imageCount = 0;

  rows.forEach((row) => {
    const sku = String(row[skuColumn] ?? '').trim();
    const imageSrc = String(row[imageColumn] ?? '').trim();
    if (!sku || !imageSrc) return;

    const styleNumber = extractStyleNumber(sku);
    if (!styleNumber) return;

    if (!imagesByStyle.has(styleNumber)) imagesByStyle.set(styleNumber, new Set());
    const set = imagesByStyle.get(styleNumber);
    if (!set.has(imageSrc)) {
      set.add(imageSrc);
      imageCount += 1;
    }
  });

  const records = Array.from(imagesByStyle.entries()).map(([styleNumber, images]) => ({
    style_number: styleNumber,
    images: Array.from(images),
  }));

  return { records, rowCount: rows.length, imageCount, skuColumn, imageColumn };
}
