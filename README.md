# Return Processing System — Frontend

React + Vite SPA for Qurvii's returns and reverse-logistics workflow: a warehouse scan-and-accept flow, return search/import, channel mapping, unmatched-scan triage, and user management — all behind a login screen.

## Tech Stack

- React 18 + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- `react-router-dom` v7
- `react-icons` (Feather set) for nav/action icons
- `xlsx` (lazy-loaded) for parsing CSV/Excel uploads

## Getting Started

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build
npm run lint      # ESLint
```

### Environment

`.env`:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

Point this at wherever the backend is running. The backend must be up and reachable, and `INITIAL_ADMIN_USERNAME`/`INITIAL_ADMIN_PASSWORD` from its `.env` are the credentials for the first login (see backend README).

## Authentication

`/login` is a standalone page outside the app shell. Every other route is wrapped in `RequireAuth` (see `src/components/auth/RequireAuth.jsx`), which redirects to `/login` if there's no valid session, and a separate `adminOnly` guard for `/users`. The session token lives in `localStorage`; `src/lib/api.js` attaches it to every request automatically and force-logs-out on a `401`.

## Pages

| Route | Page | Notes |
|---|---|---|
| `/login` | `LoginPage` | no header/nav; redirects to `/` (or the page you were headed to) once authenticated |
| `/` | `ScanPage` | scan any field to find a return; matches render as a card each with Good/Bad qty, return type, and an Accept button; a scan miss is recorded as an "unmatched" entry with channel auto-resolution or manual selection; product photos shown alongside via `ScanImagePanel` |
| `/search` | `SearchPage` | paginated browse of all returns by default, or search (exact match) by any field |
| `/import` | `ImportPage` | four sub-tabs: **Bulk Import** (CSV/Excel → replaces the returns collection), **Product Images** (Shopify-style export → style-number-keyed image sync), **Channel Mapping** (prefix→channel CSV upload + inline edit/delete table) |
| `/logs` , `/logs/:id` | `LogsPage` / `LogDetailPage` | closed scan sessions ("logs"); view records, download the credit-note CSV, delete (admin only) |
| `/unmatched` | `UnmatchedRecordsPage` | paginated unmatched scans; assign/edit channel inline, export all, or upload a plain ID list to preview match counts before downloading an enriched CSV |
| `/users` | `UsersPage` | admin-only — create/edit/delete accounts |

## Project Structure

```
frontend/src/
├── components/
│   ├── auth/          # RequireAuth route guard
│   ├── common/         # Banner, ConfirmDialog, Pagination, Spinner, EmptyState, StatusBadge
│   ├── import/         # bulk import, product-image sync, channel-mapping UI
│   ├── scan/            # scan results table, image panel, unmatched-scan panel, accepted-list
│   ├── search/          # search bar, returns table, record detail drawer
│   ├── Header.jsx        # top nav (grouped into a "Manage" dropdown) + session/logout
│   └── NavDropdown.jsx   # reusable nav dropdown used by Header
├── context/
│   └── AuthContext.jsx  # token/user state, backed by localStorage
├── hooks/
│   └── useProductImages.js
├── lib/
│   ├── api.js                     # all backend calls; attaches auth header, handles session expiry
│   ├── authStorage.js              # localStorage read/write for token + user
│   ├── schema.js                   # return-record field definitions shared across pages
│   ├── parseImportFile.js          # bulk-return CSV/Excel parsing + header aliasing
│   ├── parseProductStyleFile.js    # Shopify product export → style-number image groups
│   ├── parseChannelMappingFile.js  # prefix/channel CSV parsing
│   ├── parseIdListFile.js          # plain scanned-id list parsing (Unmatched Records upload)
│   ├── downloadTextFile.js         # client-side CSV template downloads
│   └── formatters.js, returnTypes.js, styleNumber.js
└── pages/               # one component per route, listed above
```

## Notable Behavior

- **Bulk return import is destructive**: uploading a file on the Import page replaces the entire returns collection (confirmed via a dialog first). Rows with an excluded order status are filtered out client-side before the count shown to the user.
- **Scanning uses exact match** (`/returns/scan/:value`), not the fuzzy substring search used on the Search page — this avoids a short code accidentally matching an unrelated record.
- **Unmatched scans aren't saved until a channel is known** — either auto-resolved from a Channel Mapping prefix, or picked manually (with an inline "add new channel" option).
- **CSV downloads are authenticated fetch-and-blob**, not plain `<a href>` links, since the API requires a bearer token that a normal navigation can't carry.
