export const RETURN_TYPES = [
  { value: 'courier', label: 'RTO - Courier' },
  { value: 'customer', label: 'RTV - Customer' },
];

export const returnTypeLabel = (value) => RETURN_TYPES.find((type) => type.value === value)?.label || value;
