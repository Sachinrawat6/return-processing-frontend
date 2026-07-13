// Mirrors backend/models/returnModel.js — field keys must match exactly
// since bulk import rows are posted straight through to Mongoose.

export const SEARCHABLE_FIELDS = [
  { key: 'order_id', label: 'Order ID' },
  { key: 'invoice_id', label: 'Invoice ID' },
  { key: 'invoice_number', label: 'Invoice Number' },
  { key: 'shipment_tracker', label: 'Shipment Tracker' },
  { key: 'return_tracking_id', label: 'Return Tracking ID' },
  { key: 'channel_sub_order_id', label: 'Channel Sub Order ID' },
];

export const FIELD_GROUPS = [
  {
    title: 'Order & Invoice',
    fields: [
      { key: 'order_id', label: 'Order ID', type: 'string' },
      { key: 'order_type', label: 'Order Type', type: 'string' },
      { key: 'order_status', label: 'Order Status', type: 'string' },
      { key: 'invoice_id', label: 'Invoice ID', type: 'string' },
      { key: 'invoice_number', label: 'Invoice Number', type: 'string' },
    ],
  },
  {
    title: 'Buyer & Product',
    fields: [
      { key: 'buyer_name', label: 'Buyer Name', type: 'string' },
      { key: 'product_name', label: 'Product Name', type: 'string' },
      {
        key: 'porduct_sku_code',
        label: 'SKU Code',
        type: 'string',
        // backend field name has a typo ("porduct") — the source files spell it correctly
        aliases: ['Product Sku Code', 'SKU Code', 'SKU'],
      },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'total', label: 'Total', type: 'number' },
    ],
  },
  {
    title: 'Channel',
    fields: [
      { key: 'channel_id', label: 'Channel ID', type: 'string' },
      { key: 'channel_name', label: 'Channel Name', type: 'string' },
      { key: 'channel_order_id', label: 'Channel Order ID', type: 'string' },
      { key: 'channel_sub_order_id', label: 'Channel Sub Order ID', type: 'string' },
    ],
  },
  {
    title: 'Shipment & Return',
    fields: [
      { key: 'shipment_tracker', label: 'Shipment Tracker', type: 'string' },
      { key: 'shipping_company', label: 'Shipping Company', type: 'string' },
      { key: 'return_tracking_id', label: 'Return Tracking ID', type: 'string' },
      { key: 'return_reason', label: 'Return Reason', type: 'string' },
      { key: 'return_date', label: 'Return Date', type: 'date' },
      { key: 'return_delivered_date', label: 'Return Delivered Date', type: 'date' },
    ],
  },
];

export const ALL_FIELDS = FIELD_GROUPS.flatMap((group) => group.fields);

export const IMPORT_COLUMNS = ALL_FIELDS.map((field) => field.key);

export const EMPTY_RECORD = ALL_FIELDS.reduce((acc, field) => {
  acc[field.key] = '';
  return acc;
}, {});
