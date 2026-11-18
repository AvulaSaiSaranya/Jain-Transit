import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, Trash2, X } from 'lucide-react';
import { useTransit, type Bus } from '../../context/TransitContext';

export const AdminFleetPage: React.FC = () => {
  const { buses, adminAddBus, adminRemoveBus } = useTransit();
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>(() =>
    window.location.hash.includes('tab=remove') ? 'remove' : 'add'
  );

  const [number, setNumber] = useState('');
  const [destination, setDestination] = useState('Bengaluru');
  const [driverName, setDriverName] = useState('');
  const [bayNumber, setBayNumber] = useState('Bay 2 (South Gate)');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const [selectedRemoveId, setSelectedRemoveId] = useState<string>('');
  const [confirmBus, setConfirmBus] = useState<Bus | null>(null);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash.includes('tab=remove')) setActiveTab('remove');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (buses.length > 0 && !selectedRemoveId) {
      setSelectedRemoveId(String(buses[0].id));
    }
  }, [buses, selectedRemoveId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      await adminAddBus({
        number: number.toUpperCase(),
        destination,
        routeName: `Jain University → ${destination} Shuttle`,
        driverName: driverName || 'Standby Driver',
        bayNumber,
      });
      setMessage(`Shuttle ${number.toUpperCase()} added to active fleet list.`);
      setNumber('');
      setDriverName('');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveConfirmed = async (bus: Bus) => {
    setBusy(true);
    try {
      await adminRemoveBus(bus.id);
      setMessage(`Shuttle ${bus.number} has been removed from active service.`);
      setConfirmBus(null);
      if (Number(selectedRemoveId) === bus.id) {
        const remaining = buses.filter((b) => b.id !== bus.id);
        setSelectedRemoveId(remaining.length > 0 ? String(remaining[0].id) : '');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSelectRemoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = buses.find((b) => b.id === Number(selectedRemoveId));
    if (target) setConfirmBus(target);
  };

  const selectedBusPreview = buses.find((b) => b.id === Number(selectedRemoveId));

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Fleet Management</div>
          <h2>Fleet & Bay Allocation</h2>
        </div>

        <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'add' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Add Shuttle
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remove')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'remove' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Remove Shuttle
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 card form-field">
          {activeTab === 'add' ? (
            <>
              <h3 className="font-display text-lg font-extrabold text-slate-900 m-0 pb-3 border-b border-slate-200/70">
                Add University Shuttle
              </h3>
              <form onSubmit={handleAdd}>
                <label htmlFor="fleet-number">Bus Number</label>
                <input
                  id="fleet-number"
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="e.g. JT-06"
                  required
                />

                <label htmlFor="fleet-dest">Destination Corridor</label>
                <select
                  id="fleet-dest"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Harohalli">Harohalli</option>
                </select>

                <label htmlFor="fleet-bay">Assigned Terminal Bay</label>
                <select
                  id="fleet-bay"
                  value={bayNumber}
                  onChange={(e) => setBayNumber(e.target.value)}
                >
                  <option value="Bay 1 (North Gate)">Bay 1 (North Gate)</option>
                  <option value="Bay 2 (South Gate)">Bay 2 (South Gate)</option>
                  <option value="Bay 3 (West Bay)">Bay 3 (West Bay)</option>
                  <option value="Bay 4 (Express Lane)">Bay 4 (Express Lane)</option>
                </select>

                <label htmlFor="fleet-driver">Assigned Driver Name</label>
                <input
                  id="fleet-driver"
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Prakash Rao"
                  required
                />

                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-primary w-full mt-5"
                >
                  <Plus size={16} />
                  <span>{busy ? 'Adding...' : 'Register Shuttle'}</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 className="font-display text-lg font-extrabold text-slate-900 m-0 pb-3 border-b border-slate-200/70">
                Decommission Shuttle
              </h3>
              <form onSubmit={handleSelectRemoveSubmit}>
                <label htmlFor="remove-bus-select">Select Active Shuttle</label>
                <select
                  id="remove-bus-select"
                  value={selectedRemoveId}
                  onChange={(e) => setSelectedRemoveId(e.target.value)}
                  required
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.number} — {b.destination} ({b.bayNumber})
                    </option>
                  ))}
                </select>

                {selectedBusPreview && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <div><b>Driver:</b> {selectedBusPreview.driverName}</div>
                    <div><b>Bay:</b> {selectedBusPreview.bayNumber}</div>
                    <div><b>Status:</b> {selectedBusPreview.status}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedRemoveId || busy}
                  className="btn btn-danger w-full mt-5"
                >
                  <Trash2 size={15} />
                  <span>Remove Selected Shuttle</span>
                </button>
              </form>
            </>
          )}
        </div>

        <div className="lg:col-span-8 card">
          <div className="pb-3 border-b border-slate-200/70 mb-4">
            <h3 className="font-display text-lg font-extrabold text-slate-900 tracking-tight m-0">
              Active University Shuttles ({buses.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-0">
              Live GPS telemetry, bay assignments, and quick decommission controls.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-xs text-slate-600">
                  <th>Bus #</th>
                  <th>Destination</th>
                  <th>Bay Gate</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-white/60 transition-colors">
                    <td className="font-mono font-bold text-slate-900">{bus.number}</td>
                    <td className="font-bold text-slate-800 text-xs">{bus.destination}</td>
                    <td className="text-xs text-blue-700 font-semibold">{bus.bayNumber}</td>
                    <td className="text-xs text-slate-600 font-medium">{bus.driverName}</td>
                    <td>
                      <span
                        className={`text-xs font-bold uppercase ${
                          bus.status === 'EN_ROUTE'
                            ? 'text-emerald-700'
                            : bus.status === 'BOARDING'
                              ? 'text-amber-700'
                              : 'text-slate-600'
                        }`}
                      >
                        {bus.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => setConfirmBus(bus)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title={`Remove shuttle ${bus.number}`}
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {buses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                      No shuttles in fleet. Use "+ Add Shuttle" to register one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setConfirmBus(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              aria-label="Cancel removal"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-slate-900 tracking-tight m-0">
                  Confirm Shuttle Removal
                </h3>
                <span className="text-xs text-slate-500">Decommissioning from active operations</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to remove shuttle <b className="text-slate-900 font-mono">{confirmBus.number}</b> ({confirmBus.destination}) from service? This will unassign its bay slot ({confirmBus.bayNumber}) and stop live GPS tracking.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-5 text-xs text-slate-600 space-y-1">
              <div><b>Driver:</b> {confirmBus.driverName}</div>
              <div><b>Bay:</b> {confirmBus.bayNumber}</div>
              <div><b>Current Status:</b> {confirmBus.status}</div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmBus(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleRemoveConfirmed(confirmBus)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>{busy ? 'Removing...' : 'Yes, Remove Shuttle'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
