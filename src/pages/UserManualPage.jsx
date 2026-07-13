import { useState } from 'react';
import {
  FiPlayCircle,
  FiCamera,
  FiSearch,
  FiUpload,
  FiArchive,
  FiAlertTriangle,
  FiUsers,
  FiShield,
} from 'react-icons/fi';
import Banner from '../components/common/Banner';

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started', icon: FiPlayCircle },
  { id: 'scan-returns', label: 'Scan Returns', icon: FiCamera },
  { id: 'search-returns', label: 'Search Returns', icon: FiSearch },
  { id: 'import-data', label: 'Import Data', icon: FiUpload },
  { id: 'return-logs', label: 'Return Logs', icon: FiArchive },
  { id: 'unmatched-records', label: 'Unmatched Records', icon: FiAlertTriangle },
  { id: 'users', label: 'Users (Admin)', icon: FiUsers },
  { id: 'roles', label: 'Roles & Permissions', icon: FiShield },
];

const SectionHeading = ({ id, icon: Icon, children }) => (
  <div id={id} className="flex scroll-mt-24 items-center gap-2.5 pt-2">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <Icon aria-hidden="true" className="h-4 w-4" />
    </span>
    <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900">{children}</h2>
  </div>
);

const Step = ({ children }) => <li className="text-sm leading-relaxed text-slate-600">{children}</li>;

const SubHeading = ({ children }) => (
  <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</h3>
);

const UserManualPage = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  const handleNavClick = (id) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Table of contents */}
      <aside className="lg:col-span-1">
        <nav className="sticky top-24 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleNavClick(section.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                activeId === section.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <section.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="space-y-10 lg:col-span-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">User Manual</h1>
          <p className="mt-1 text-sm text-slate-500">
            A plain-language guide to every page in the Return Processing System — what it’s for, and how to use it.
          </p>
        </div>

        {/* Getting Started */}
        <section className="space-y-3">
          <SectionHeading id="getting-started" icon={FiPlayCircle}>
            Getting Started
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-600">
            You need an account to use this app. An admin creates your username and password and shares them with
            you (see <a href="#users" onClick={() => handleNavClick('users')} className="text-indigo-600 hover:underline">Users</a> below).
            Open the app, sign in on the login page, and you’ll land on the <strong>Scan Returns</strong> page.
          </p>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>Your session stays signed in on this browser until you click <strong>Logout</strong> or the session expires.</Step>
            <Step>
              There are two roles — <strong>Staff</strong> can do everyday work (scan, search, import, view logs).{' '}
              <strong>Admin</strong> can additionally delete logs/unmatched records and manage user accounts. See{' '}
              <a href="#roles" onClick={() => handleNavClick('roles')} className="text-indigo-600 hover:underline">
                Roles &amp; Permissions
              </a>{' '}
              for the full breakdown.
            </Step>
            <Step>
              The top navigation has two quick links (Scan Returns, Search Returns) and a <strong>Manage</strong>{' '}
              dropdown for the less-frequent pages (Import Data, Return Logs, Unmatched Records, and Users for
              admins).
            </Step>
          </ul>
        </section>

        {/* Scan Returns */}
        <section className="space-y-3">
          <SectionHeading id="scan-returns" icon={FiCamera}>
            Scan Returns
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-600">
            This is the main warehouse screen — where you scan a returned package and record what actually came
            back.
          </p>

          <SubHeading>Scanning an item</SubHeading>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>Type or scan any code into the box — order ID, invoice number, shipment tracker, return tracking ID, or channel sub-order ID.</Step>
            <Step>
              The code must <strong>exactly</strong> match — a barcode scanner’s output is treated as the whole
              value, not a partial search. This avoids accidentally matching the wrong record.
            </Step>
            <Step>If the same order has multiple items, every matching item shows up as its own card — no need to re-scan.</Step>
          </ul>

          <SubHeading>Accepting an item</SubHeading>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>Each card shows the SKU, product name, invoice number, and the sent quantity.</Step>
            <Step><strong>Good Qty</strong> and <strong>Bad Qty</strong> can never add up to more than the sent quantity, and never go negative — the boxes stop you automatically.</Step>
            <Step>
              Pick a <strong>Return Type</strong> — <em>RTO - Courier</em> (the courier returned it undelivered) or{' '}
              <em>RTV - Customer</em> (the customer sent it back). Nothing is pre-selected — you must choose one.
            </Step>
            <Step>The <strong>Accept</strong> button stays disabled until a return type is chosen and at least one quantity is entered.</Step>
            <Step>Once accepted, the card disappears and the item appears in the “Accepted this session” list below, with the scan box cleared and ready for the next scan.</Step>
            <Step>Product photos for the item(s) you scanned appear on the right — click any photo to view it full-screen.</Step>
          </ul>

          <SubHeading>When a scan doesn’t match anything</SubHeading>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>
              If the code you scanned isn’t in the system, it’s logged as an <strong>unmatched scan</strong> — nothing
              is lost, and you can look it up later on the{' '}
              <a href="#unmatched-records" onClick={() => handleNavClick('unmatched-records')} className="text-indigo-600 hover:underline">
                Unmatched Records
              </a>{' '}
              page.
            </Step>
            <Step>
              If the code’s prefix is already mapped to a channel (see{' '}
              <a href="#import-data" onClick={() => handleNavClick('import-data')} className="text-indigo-600 hover:underline">
                Channel Mapping
              </a>
              ), the channel is filled in automatically. Otherwise, pick one from the dropdown — or choose{' '}
              <strong>+ Add new channel</strong> if it’s not in the list yet.
            </Step>
          </ul>

          <SubHeading>Ending a session</SubHeading>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>Click <strong>End Session</strong> once you’re done scanning for the day (or batch).</Step>
            <Step>
              This closes out everything you’ve accepted into a single <strong>log</strong>, viewable from the{' '}
              <a href="#return-logs" onClick={() => handleNavClick('return-logs')} className="text-indigo-600 hover:underline">
                Return Logs
              </a>{' '}
              page, where it can be downloaded as a CSV.
            </Step>
          </ul>
        </section>

        {/* Search Returns */}
        <section className="space-y-3">
          <SectionHeading id="search-returns" icon={FiSearch}>
            Search Returns
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-600">
            Use this page to look up or browse return records — it’s for reference and reporting, not for the
            scan-and-accept workflow.
          </p>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>By default the page shows every return record, newest first, in pages of 20 — use Previous/Next to page through them.</Step>
            <Step>
              To search, pick a field (or leave it on <strong>All fields</strong>) and type a term. Unlike scanning,
              this search matches <strong>partial text</strong> anywhere in the field, so it’s forgiving if you only
              remember part of a code.
            </Step>
            <Step>Click <strong>View</strong> on any row to open a detail panel with every field for that record, plus its product photo(s).</Step>
            <Step>Click <strong>Clear</strong> to go back to browsing all records.</Step>
          </ul>
        </section>

        {/* Import Data */}
        <section className="space-y-3">
          <SectionHeading id="import-data" icon={FiUpload}>
            Import Data
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-600">
            This page has three tabs for loading data into the system.
          </p>

          <SubHeading>Bulk Import (CSV / Excel)</SubHeading>
          <Banner variant="warning">
            Importing a file <strong>replaces every existing return record</strong> in the system. There’s a
            confirmation step before anything is deleted — make sure you have the file you actually want before
            confirming.
          </Banner>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>Drop or select a CSV/Excel export from your marketplace/OMS. Column headers are matched automatically even if they don’t exactly match the system’s field names.</Step>
            <Step>You’ll see a preview of how many rows were recognized and which columns weren’t matched before you confirm.</Step>
            <Step>
              Rows with certain order statuses (<em>Cancelled Return Received</em>, <em>Packed</em>, <em>New</em>) are
              automatically skipped, since they aren’t real returns yet — the preview tells you how many were
              skipped.
            </Step>
          </ul>

          <SubHeading>Product Images</SubHeading>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>Upload a product export (e.g. a Shopify product CSV) containing a SKU column and an image URL column.</Step>
            <Step>
              Images are grouped by <strong>style number</strong> — the leading digits of the SKU shared across every
              size/color of the same design (e.g. <code className="rounded bg-slate-100 px-1">12290-Orange-XL</code>{' '}
              and <code className="rounded bg-slate-100 px-1">12290-Blue-M</code> are the same style, <code className="rounded bg-slate-100 px-1">12290</code>).
            </Step>
            <Step>Once synced, those photos automatically show up next to matching returns on the Scan and Search pages — no extra step needed.</Step>
          </ul>

          <SubHeading>Channel Mapping</SubHeading>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>Maps an order/tracking-id <strong>prefix</strong> to a sales channel — e.g. <code className="rounded bg-slate-100 px-1">MYSC</code> → <em>Myntra</em>.</Step>
            <Step>Download the template to see the expected format, fill it in, and upload it to sync many mappings at once.</Step>
            <Step>The table on the right lists every current mapping — click <strong>Edit</strong> to change a prefix or channel, or <strong>Remove</strong> to delete one.</Step>
            <Step>This is what powers automatic channel detection for unmatched scans (see Scan Returns above).</Step>
          </ul>
        </section>

        {/* Return Logs */}
        <section className="space-y-3">
          <SectionHeading id="return-logs" icon={FiArchive}>
            Return Logs
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-600">
            Every time a scanning session is ended, its accepted returns are saved here as a “log” — a permanent
            record of that batch.
          </p>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>The list shows when each session started/ended and how many records it contains.</Step>
            <Step>Click <strong>View</strong> to see every accepted record in that log.</Step>
            <Step>
              <strong>Download CSV</strong> gives you a file formatted for bulk-accepting returns and creating credit
              notes (filename <code className="rounded bg-slate-100 px-1">BulkAcceptReturns&amp;CreateCreditNotes.csv</code>) — ready to
              upload into your accounting/OMS system.
            </Step>
            <Step><strong>Delete</strong> is only available to admins, and permanently removes the log and its records.</Step>
          </ul>
        </section>

        {/* Unmatched Records */}
        <section className="space-y-3">
          <SectionHeading id="unmatched-records" icon={FiAlertTriangle}>
            Unmatched Records
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-600">
            A running list of everything scanned on the Scan Returns page that didn’t match a known return record.
          </p>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>Each row shows the scanned code, its channel (if known), and when it was scanned.</Step>
            <Step>Click <strong>Edit</strong> next to a channel to assign or change it.</Step>
            <Step><strong>Export All</strong> downloads every unmatched record as a CSV.</Step>
            <Step>
              <strong>Download Template</strong> gives you a blank file with the expected column, so you know what
              format to use for the next step.
            </Step>
            <Step>
              <strong>Upload IDs to Match</strong> lets you upload a list of scanned IDs (e.g. from an external
              system) — it shows a preview of how many were found before you download the enriched CSV, so nothing
              downloads by accident.
            </Step>
            <Step><strong>Delete</strong> is only available to admins.</Step>
          </ul>
        </section>

        {/* Users */}
        <section className="space-y-3">
          <SectionHeading id="users" icon={FiUsers}>
            Users (Admin Only)
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-600">
            Only admins can see this page. It controls who can log in and what they can do.
          </p>
          <ul className="ml-1 list-disc space-y-1.5 pl-4">
            <Step>Use the form at the top to create a new account — pick a username, password, and role (Staff or Admin), then share those credentials with that person.</Step>
            <Step>Click <strong>Edit</strong> on any row to change that user’s role or reset their password.</Step>
            <Step>Click <strong>Delete</strong> to remove an account.</Step>
            <Step>
              For safety, you can’t delete your own account while logged in, and the system won’t let the last
              remaining admin be deleted or demoted — there must always be at least one admin.
            </Step>
          </ul>
        </section>

        {/* Roles */}
        <section className="space-y-3 pb-10">
          <SectionHeading id="roles" icon={FiShield}>
            Roles &amp; Permissions
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-600">
            Every account is either <strong>Staff</strong> or <strong>Admin</strong>. Both can do everyday work; only
            Admin can manage users and delete records.
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Action', 'Staff', 'Admin'].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {[
                  ['Scan & accept returns', true, true],
                  ['Search / browse returns', true, true],
                  ['Import data (bulk, images, channel mapping)', true, true],
                  ['View return logs & unmatched records', true, true],
                  ['Download CSVs', true, true],
                  ['Delete a return log', false, true],
                  ['Delete an unmatched record', false, true],
                  ['Create / edit / delete user accounts', false, true],
                ].map(([action, staff, admin]) => (
                  <tr key={action} className="even:bg-slate-50/60">
                    <td className="px-4 py-2.5">{action}</td>
                    <td className="px-4 py-2.5">{staff ? '✅' : '—'}</td>
                    <td className="px-4 py-2.5">{admin ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserManualPage;
