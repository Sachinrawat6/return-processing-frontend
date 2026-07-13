// Product SKUs look like "12290-Orange-XL" — the leading numeric run is the
// style number shared across every color/size variant of the same design.
export const extractStyleNumber = (skuCode) => {
  if (!skuCode) return null;
  const match = String(skuCode).trim().match(/^(\d+)/);
  return match ? match[1] : null;
};
