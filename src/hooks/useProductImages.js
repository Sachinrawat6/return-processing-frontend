import { useEffect, useState } from 'react';
import { fetchProductStylesByCodes } from '../lib/api';
import { extractStyleNumber } from '../lib/styleNumber';

// Module-level cache so paging back and forth doesn't re-fetch known styles.
// `pendingCodes` (separate from the cache) dedupes concurrent requests without
// ever writing a placeholder into the cache before the real result is known —
// otherwise React StrictMode's dev-only double-invoked effect cancels the
// first fetch before it resolves, and the replay sees the codes as "already
// cached" and skips fetching them for good.
const styleImageCache = new Map();
const pendingCodes = new Set();

export const useProductImages = (records) => {
  const [, forceRender] = useState(0);

  const styleNumbers = [
    ...new Set((records || []).map((record) => extractStyleNumber(record.porduct_sku_code)).filter(Boolean)),
  ];
  const missing = styleNumbers.filter((code) => !styleImageCache.has(code) && !pendingCodes.has(code));

  useEffect(() => {
    if (missing.length === 0) return undefined;

    missing.forEach((code) => pendingCodes.add(code));
    let cancelled = false;

    fetchProductStylesByCodes(missing)
      .then((styles) => {
        const imageByCode = new Map(styles.map((style) => [style.style_number, style.images?.[0] || null]));
        missing.forEach((code) => {
          pendingCodes.delete(code);
          styleImageCache.set(code, imageByCode.get(code) ?? null);
        });
        if (!cancelled) forceRender((n) => n + 1);
      })
      .catch(() => {
        missing.forEach((code) => pendingCodes.delete(code));
        if (!cancelled) forceRender((n) => n + 1);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missing.join(',')]);

  const imageFor = (skuCode) => {
    const styleNumber = extractStyleNumber(skuCode);
    return styleNumber ? styleImageCache.get(styleNumber) ?? null : null;
  };

  return { imageFor };
};
