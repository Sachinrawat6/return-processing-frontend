import { useEffect, useState } from 'react';
import { fetchChannels, createChannel } from '../../lib/api';
import Banner from '../common/Banner';

const ADD_NEW_VALUE = '__add_new__';

const UnmatchedScanPanel = ({ entry, onAssignChannel, saving, error }) => {
  const [channels, setChannels] = useState([]);
  const [selected, setSelected] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    fetchChannels()
      .then(setChannels)
      .catch((err) => setLocalError(err.message));
  }, []);

  const handleSelectChange = (value) => {
    if (value === ADD_NEW_VALUE) {
      setAddingNew(true);
      setSelected(value);
      return;
    }
    setSelected(value);
    if (value) onAssignChannel(value);
  };

  const handleAddNewChannel = async (event) => {
    event.preventDefault();
    const name = newChannelName.trim();
    if (!name) return;

    setCreatingChannel(true);
    setLocalError(null);
    try {
      const channel = await createChannel(name);
      setChannels((prev) => [...prev, channel].sort((a, b) => a.name.localeCompare(b.name)));
      setAddingNew(false);
      setNewChannelName('');
      setSelected(channel.name);
      await onAssignChannel(channel.name);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setCreatingChannel(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-800">No return found for this scan</p>
          <p className="text-xs text-amber-700">
            {entry.pending ? 'Select a channel to save it as unmatched: ' : 'Saved to Unmatched Records: '}
            <span className="font-mono">{entry.scanned_id}</span>
          </p>
        </div>

        {entry.channel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            Channel: {entry.channel}
          </span>
        ) : addingNew ? (
          <form onSubmit={handleAddNewChannel} className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={newChannelName}
              onChange={(event) => setNewChannelName(event.target.value)}
              placeholder="New channel name"
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              disabled={creatingChannel || saving || !newChannelName.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingNew(false);
                setSelected('');
              }}
              className="text-sm text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </form>
        ) : (
          <select
            value={selected}
            disabled={saving}
            onChange={(event) => handleSelectChange(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="" disabled>
              Select channel…
            </option>
            {channels.map((channel) => (
              <option key={channel._id} value={channel.name}>
                {channel.name}
              </option>
            ))}
            <option value={ADD_NEW_VALUE}>+ Add new channel</option>
          </select>
        )}
      </div>

      {(error || localError) && (
        <Banner variant="error" onDismiss={() => setLocalError(null)}>
          {error || localError}
        </Banner>
      )}
    </div>
  );
};

export default UnmatchedScanPanel;
