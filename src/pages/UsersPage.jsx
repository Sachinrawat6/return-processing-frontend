import { useEffect, useState } from 'react';
import Banner from '../components/common/Banner';
import Spinner from '../components/common/Spinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { fetchUsers, createUser, updateUser, deleteUser } from '../lib/api';
import { formatDateTime } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { username: '', password: '', role: 'staff' };

const CreateUserForm = ({ onCreated }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const user = await createUser(form);
      onCreated(user);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Create User</h3>

      {error && (
        <Banner variant="error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Username</span>
          <input
            type="text"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Role</span>
          <select
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !form.username.trim() || !form.password}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

const EditUserRow = ({ user, onSaved, onCancel }) => {
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = { role };
      if (password) payload.password = password;
      const updated = await updateUser(user._id, payload);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="bg-indigo-50/40">
      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{user.username}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password (optional)"
          className="w-48 rounded-lg border border-slate-300 px-2 py-1.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetchUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteUser(pendingDelete._id);
      setUsers((prev) => prev.filter((user) => user._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">Users</h2>
        <p className="text-sm text-slate-500">Create, update, and remove accounts that can access this system.</p>
      </div>

      {error && (
        <Banner variant="error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      <CreateUserForm
        onCreated={(user) => {
          setUsers((prev) => [...(prev || []), user]);
        }}
      />

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Loading users…</span>
        </div>
      )}

      {!loading && users && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Username', 'Role', 'Created', ''].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) =>
                  editingId === user._id ? (
                    <EditUserRow
                      key={user._id}
                      user={user}
                      onCancel={() => setEditingId(null)}
                      onSaved={(updated) => {
                        setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
                        setEditingId(null);
                      }}
                    />
                  ) : (
                    <tr key={user._id} className="even:bg-slate-50/60">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {user.username}
                        {currentUser?.id === user._id && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                            you
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            user.role === 'admin'
                              ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                              : 'bg-slate-100 text-slate-600 ring-slate-200'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(user._id)}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                          >
                            Edit
                          </button>
                          {currentUser?.id !== user._id && (
                            <button
                              type="button"
                              onClick={() => setPendingDelete(user)}
                              className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this user?"
          description={`This will permanently remove "${pendingDelete.username}"'s access to this system.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default UsersPage;
