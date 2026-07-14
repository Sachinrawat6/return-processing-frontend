import { getStoredToken, clearStoredAuth } from './authStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiRequestError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
  }
}

const authHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleSessionExpiry = (status) => {
  if (status === 401 && getStoredToken()) {
    // The token is missing/invalid/expired — clear it and force back to the
    // login screen rather than leaving the app in a half-authenticated state.
    clearStoredAuth();
    window.location.assign('/login');
  }
};

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    });
  } catch {
    throw new ApiRequestError('Could not reach the server. Is the backend running?', 0);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    handleSessionExpiry(response.status);
    throw new ApiRequestError(
      body?.message || `Request failed (${response.status})`,
      response.status
    );
  }

  return body;
}

export const login = async (username, password) => {
  const body = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return body.data;
};

export const fetchCurrentUser = async () => {
  const body = await request('/auth/me');
  return body.data;
};

export const fetchUsers = async () => {
  const body = await request('/users');
  return body.data;
};

export const createUser = async (payload) => {
  const body = await request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return body.data;
};

export const updateUser = async (id, payload) => {
  const body = await request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return body.data;
};

export const deleteUser = async (id) => {
  const body = await request(`/users/${id}`, { method: 'DELETE' });
  return body.data;
};

export const fetchAllReturns = async (page = 1, limit = 20) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const body = await request(`/returns/all?${params.toString()}`);
  return body.data;
};

export const fetchReturnsBySearchTerm = async (searchTerm, fields) => {
  const params = new URLSearchParams();
  fields.forEach((field) => params.set(field, searchTerm));
  const body = await request(`/returns?${params.toString()}`);
  return body.data;
};

export const scanReturnExact = async (value) => {
  const body = await request(`/returns/scan/${encodeURIComponent(value)}`);
  return body.data;
};

export const fetchReturnByField = async (field, value) => {
  const body = await request(`/returns/search/${field}/${encodeURIComponent(value)}`);
  return body.data;
};

export const bulkCreateReturns = async (records) => {
  const body = await request('/returns/bulk', {
    method: 'POST',
    body: JSON.stringify(records),
  });
  return body.data;
};

export const fetchProductStylesByCodes = async (codes) => {
  if (!codes || codes.length === 0) return [];
  const params = new URLSearchParams({ codes: codes.join(',') });
  const body = await request(`/product-styles?${params.toString()}`);
  return body.data;
};

export const bulkUpsertProductStyles = async (records) => {
  const body = await request('/product-styles/bulk', {
    method: 'POST',
    body: JSON.stringify(records),
  });
  return body.data;
};

export const fetchActiveSession = async () => {
  const body = await request('/return-sessions/active');
  return body.data;
};

export const endActiveSession = async () => {
  const body = await request('/return-sessions/active/end', { method: 'POST' });
  return body.data;
};

export const acceptReturn = async (payload) => {
  const body = await request('/return-sessions/active/accept', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return body.data;
};

export const fetchSessionLogs = async () => {
  const body = await request('/return-sessions');
  return body.data;
};

export const fetchSessionDetail = async (id) => {
  const body = await request(`/return-sessions/${id}`);
  return body.data;
};

export const deleteSessionLog = async (id) => {
  const body = await request(`/return-sessions/${id}`, { method: 'DELETE' });
  return body.data;
};

export const downloadSessionCsv = async (id) => {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/return-sessions/${id}/csv`, {
      headers: { ...authHeaders() },
    });
  } catch {
    throw new ApiRequestError('Could not reach the server. Is the backend running?', 0);
  }
  await downloadCsvResponse(response, `BulkAcceptReturns&CreateCreditNotes.csv`);
};

export const fetchChannels = async () => {
  const body = await request('/channels');
  return body.data;
};

export const createChannel = async (name) => {
  const body = await request('/channels', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return body.data;
};

export const fetchChannelMappings = async () => {
  const body = await request('/channel-mappings');
  return body.data;
};

export const bulkUpsertChannelMappings = async (records) => {
  const body = await request('/channel-mappings/bulk', {
    method: 'POST',
    body: JSON.stringify(records),
  });
  return body.data;
};

export const updateChannelMapping = async (id, payload) => {
  const body = await request(`/channel-mappings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return body.data;
};

export const deleteChannelMapping = async (id) => {
  const body = await request(`/channel-mappings/${id}`, { method: 'DELETE' });
  return body.data;
};

export const createUnmatchedScan = async (scannedId, channel) => {
  const body = await request('/unmatched-scans', {
    method: 'POST',
    body: JSON.stringify(channel ? { scanned_id: scannedId, channel } : { scanned_id: scannedId }),
  });
  return body.data;
};

export const fetchUnmatchedScans = async (page = 1, limit = 20) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const body = await request(`/unmatched-scans?${params.toString()}`);
  return body.data;
};

export const updateUnmatchedScanChannel = async (id, channel) => {
  const body = await request(`/unmatched-scans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ channel }),
  });
  return body.data;
};

export const deleteUnmatchedScan = async (id) => {
  const body = await request(`/unmatched-scans/${id}`, { method: 'DELETE' });
  return body.data;
};

const downloadCsvResponse = async (response, fallbackName) => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    handleSessionExpiry(response.status);
    throw new ApiRequestError(
      body?.message || `Request failed (${response.status})`,
      response.status
    );
  }

  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : fallbackName;

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadUnmatchedScansCsv = async () => {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/unmatched-scans/export`, {
      headers: { ...authHeaders() },
    });
  } catch {
    throw new ApiRequestError('Could not reach the server. Is the backend running?', 0);
  }
  await downloadCsvResponse(response, 'UnmatchedScans.csv');
};

export const matchScannedIds = async (scannedIds) => {
  const body = await request('/unmatched-scans/match', {
    method: 'POST',
    body: JSON.stringify({ scanned_ids: scannedIds }),
  });
  return body.data;
};

export const downloadMatchedScanIdsCsv = async (scannedIds) => {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/unmatched-scans/match/csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ scanned_ids: scannedIds }),
    });
  } catch {
    throw new ApiRequestError('Could not reach the server. Is the backend running?', 0);
  }

  await downloadCsvResponse(response, 'MatchedScanChannels.csv');
};

export { ApiRequestError };
