import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bus, CheckCircle2, Pause, Play, Radio, Square, X } from 'lucide-react';
import { useTransit } from '../../context/TransitContext';
import { DriverStopChecklist } from '../../components/DriverStopChecklist';

interface DriverConsolePageProps {
  onNavigate?: (route: string) => void;
}

export const DriverConsolePage: React.FC<DriverConsolePageProps> = () => {
  const {
    currentUser,
    buses,
    driverAdvanceStop,
    driverSetTripStatus,
    driverBroadcastGps,
  } = useTransit();

  const assignedBus =
    buses.find((b) =>
      b.driverName.toLowerCase().includes(currentUser?.fullName?.toLowerCase() || '')
    ) || buses[0];

  const [gpsStatus, setGpsStatus] = useState('GPS broadcasting idle');
  const [gpsActive, setGpsActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemNote, setProblemNote] = useState('');
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (!assignedBus) {
    return (
      <div className="driver-shell">
        <div className="card text-center py-12">
          <Bus size={40} className="mx-auto text-slate-400 mb-2" />
          <h3 className="font-bold text-slate-900">No Assigned Shuttle Found</h3>
          <p className="text-slate-500 text-sm">
            Please ask the campus transport officer to assign a vehicle.
          </p>
        </div>
      </div>
    );
  }

  const handleStartTrip = async () => {
    await driverSetTripStatus(assignedBus.id, 'EN_ROUTE');
    setFeedback(`Trip started on ${assignedBus.number}. Real-time tracking broadcast active.`);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setGpsActive(true);
      setGpsStatus('Live driver GPS transmitting...');
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          driverBroadcastGps(
            assignedBus.id,
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.heading || 0
          );
          setGpsStatus(
            `GPS Active (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          );
        },
        () => {
          setGpsStatus('GPS permission denied. Using simulated corridor telemetry.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
      );
    }
  };

  const handlePauseTrip = async () => {
    await driverSetTripStatus(assignedBus.id, 'BOARDING');
    setFeedback(
      `Trip paused for station boarding at ${assignedBus.stops[assignedBus.currentStopIndex]?.name}.`
    );
  };

  const handleEndTrip = async () => {
    await driverSetTripStatus(assignedBus.id, 'COMPLETED');
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
    setGpsStatus('Trip ended. Location broadcasting stopped.');
    setFeedback(`Trip completed for ${assignedBus.number}. Log saved to transport records.`);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemNote.trim()) return;
    await driverSetTripStatus(assignedBus.id, 'PROBLEM', problemNote.trim());
    setFeedback(`Issue reported to Transport Control Desk: "${problemNote.trim()}"`);
    setProblemNote('');
    setShowProblemModal(false);
  };

  const isEnRoute = assignedBus.status === 'EN_ROUTE';

  return (
    <div className="driver-shell">
      <div className="mb-4">
        <div className="kicker" style={{ margin: 0 }}>Driver In-Cab Console</div>
      </div>

      <div className="card mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-500">Driver Profile</div>
            <h2 className="font-display text-2xl font-black text-slate-900 my-0.5">
              {currentUser?.fullName || 'Campus Driver'}
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              Assigned Shuttle: <b className="text-slate-900 font-mono">{assignedBus.number}</b> ({assignedBus.destination})
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Bay Allocation: <b className="text-blue-700">{assignedBus.bayNumber}</b>
            </div>
          </div>

          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isEnRoute
                ? 'text-emerald-700'
                : assignedBus.status === 'BOARDING'
                  ? 'text-amber-700'
                  : assignedBus.status === 'PROBLEM'
                    ? 'text-rose-700'
                    : 'text-slate-600'
            }`}
          >
            {assignedBus.status}
          </span>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center gap-2 min-w-0">
            <Radio size={16} className={gpsActive ? 'text-emerald-400 shrink-0' : 'text-slate-400 shrink-0'} />
            <span className="truncate">{gpsStatus}</span>
          </div>
          <span className="text-slate-400 text-[11px] font-mono shrink-0">
            {assignedBus.isSimulated ? 'AUTO-FEED' : 'HARDWARE-GPS'}
          </span>
        </div>

        {feedback && (
          <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="driver-actions">
          {isEnRoute ? (
            <button type="button" onClick={handlePauseTrip} className="btn btn-ghost">
              <Pause size={16} />
              <span>Boarding Pause</span>
            </button>
          ) : (
            <button type="button" onClick={handleStartTrip} className="btn btn-primary">
              <Play size={16} />
              <span>Start Trip</span>
            </button>
          )}
          <button type="button" onClick={handleEndTrip} className="btn btn-ghost">
            <Square size={16} />
            <span>End Trip</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowProblemModal(true)}
          className="w-full mt-2.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <AlertTriangle size={14} />
          <span>Report Breakdown / Road Obstacle</span>
        </button>
      </div>

      <DriverStopChecklist
        stops={assignedBus.stops}
        currentStopIndex={assignedBus.currentStopIndex}
        onAdvanceStop={(idx, action) => driverAdvanceStop(assignedBus.id, idx, action)}
        busNumber={assignedBus.number}
      />

      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 form-field">
            <button
              type="button"
              onClick={() => setShowProblemModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              aria-label="Close issue modal"
            >
              <X size={16} />
            </button>

            <h3 className="font-display text-lg font-black text-slate-900 m-0">
              Report Vehicle or Road Issue
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Notify the Campus Transport Control Desk immediately.
            </p>

            <form onSubmit={handleReportSubmit}>
              <label htmlFor="driver-issue-note">Issue Description</label>
              <textarea
                id="driver-issue-note"
                rows={3}
                value={problemNote}
                onChange={(e) => setProblemNote(e.target.value)}
                placeholder="e.g. Heavy traffic delay at Kaggalipura, tire puncture, mechanical inspection needed..."
                required
              />
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowProblemModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger text-xs py-2 px-4">
                  Send Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
