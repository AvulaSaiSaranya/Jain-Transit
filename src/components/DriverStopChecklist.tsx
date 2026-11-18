import React, { useState } from 'react';
import { CheckCircle2, CircleDot, MapPin, Navigation } from 'lucide-react';
import type { RouteStop } from '../context/TransitContext';

interface DriverStopChecklistProps {
  stops: RouteStop[];
  currentStopIndex: number;
  onAdvanceStop: (stopIndex: number, action: 'ARRIVE' | 'DEPART') => Promise<void>;
  busNumber: string;
}

export const DriverStopChecklist: React.FC<DriverStopChecklistProps> = ({
  stops,
  currentStopIndex,
  onAdvanceStop,
  busNumber,
}) => {
  const [busy, setBusy] = useState(false);

  const handleAction = async (idx: number, action: 'ARRIVE' | 'DEPART') => {
    setBusy(true);
    try {
      await onAdvanceStop(idx, action);
    } finally {
      setBusy(false);
    }
  };

  const activeStop = stops[currentStopIndex];
  const hasArrivedCurrent = Boolean(activeStop?.actualArrival && !activeStop?.actualDeparture);

  return (
    <div className="card mb-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 mb-4">
        <div>
          <div className="kicker" style={{ margin: 0 }}>
            Driver Route Telemetry
          </div>
          <h3 className="font-display text-xl font-extrabold text-slate-900 tracking-tight mt-1 mb-0">
            Stop-by-Stop Checklist
          </h3>
        </div>
        <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
          {busNumber}
        </span>
      </div>

      {activeStop && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 mb-5">
          <div className="text-xs font-bold text-blue-700 mb-1 tabular-nums">
            Active Corridor Milestone ({activeStop.order} of {stops.length})
          </div>
          <div className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin size={18} className="text-blue-600 shrink-0" />
            <span>{activeStop.name}</span>
          </div>
          <div className="text-xs text-slate-600 mt-1 tabular-nums">
            Landmark: <b>{activeStop.landmark}</b> · Scheduled: <b>{activeStop.scheduledTime}</b>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            <button
              type="button"
              disabled={busy || hasArrivedCurrent}
              onClick={() => handleAction(currentStopIndex, 'ARRIVE')}
              className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] ${
                hasArrivedCurrent
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
              }`}
            >
              <CircleDot size={15} />
              <span>
                {hasArrivedCurrent ? `Arrived (${activeStop.actualArrival})` : 'Mark Arrived at Stop'}
              </span>
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => handleAction(currentStopIndex, 'DEPART')}
              className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <Navigation size={15} />
              <span>Depart for Next Stop</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {stops.map((stop, idx) => {
          const isCompleted = stop.status === 'COMPLETED';
          const isCurrent = idx === currentStopIndex;

          return (
            <div
              key={stop.id}
              className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                isCurrent
                  ? 'bg-white border-blue-500 shadow-xs'
                  : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-white/60 border-slate-200/80 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-100 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-slate-100" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{stop.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">#{stop.order}</span>
                  </div>
                  <div className="text-xs text-slate-500 tabular-nums">
                    {stop.landmark} · <span className="font-semibold">{stop.scheduledTime}</span>
                  </div>
                  {(stop.actualArrival || stop.actualDeparture) && (
                    <div className="text-[11px] text-emerald-700 font-semibold mt-1 tabular-nums">
                      {stop.actualArrival && <span>Arr: {stop.actualArrival} </span>}
                      {stop.actualDeparture && <span>· Dep: {stop.actualDeparture}</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0 text-xs font-bold">
                <span
                  className={
                    isCompleted
                      ? 'text-emerald-700'
                      : isCurrent
                        ? 'text-blue-700'
                        : 'text-slate-500'
                  }
                >
                  {isCompleted ? 'Passed' : isCurrent ? 'Active' : 'Upcoming'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
