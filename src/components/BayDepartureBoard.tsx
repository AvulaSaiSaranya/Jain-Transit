import React, { useMemo, useState } from 'react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import type { Bus, BusStatus } from '../context/TransitContext';

interface BayDepartureBoardProps {
  buses: Bus[];
  onTrackBus?: (busId: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPlayChime: () => void;
}

const STATUS_DISPLAY: Record<BusStatus, { label: string; tone: string }> = {
  EN_ROUTE: { label: 'En Route', tone: 'text-emerald-700' },
  BOARDING: { label: 'Boarding at Bay', tone: 'text-blue-700' },
  IDLE: { label: 'Scheduled Standby', tone: 'text-slate-600' },
  COMPLETED: { label: 'Completed', tone: 'text-slate-500' },
  PROBLEM: { label: 'Delayed / Alert', tone: 'text-rose-700' },
};

export const BayDepartureBoard: React.FC<BayDepartureBoardProps> = ({
  buses,
  onTrackBus,
  soundEnabled,
  onToggleSound,
  onPlayChime,
}) => {
  const [selectedBay, setSelectedBay] = useState<string>('ALL');

  const bays = useMemo(() => {
    const names = Array.from(new Set(buses.map((b) => b.bayNumber.split(' (')[0])));
    return names.sort();
  }, [buses]);

  const filteredBuses = useMemo(() => {
    if (selectedBay === 'ALL') return buses;
    return buses.filter((b) => b.bayNumber.startsWith(selectedBay));
  }, [buses, selectedBay]);

  return (
    <div className="card">
      <div className="flex items-start md:items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-200/70">
        <div>
          <div className="kicker" style={{ margin: 0 }}>
            Campus Terminal Departures
          </div>
          <h3 className="font-display text-xl font-extrabold text-slate-900 tracking-tight mt-1 mb-0">
            Live Bay Departure Board
          </h3>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setSelectedBay('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedBay === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Bays
            </button>
            {bays.map((bay) => (
              <button
                key={bay}
                type="button"
                onClick={() => setSelectedBay(bay)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedBay === bay
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bay}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute departure chime' : 'Enable departure chime'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            {soundEnabled ? (
              <Volume2 size={15} className="text-blue-600" />
            ) : (
              <VolumeX size={15} className="text-slate-400" />
            )}
            <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={onPlayChime}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            Test Chime
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
        {filteredBuses.map((bus) => {
          const statusMeta = STATUS_DISPLAY[bus.status] || STATUS_DISPLAY.IDLE;
          const nextStop = bus.stops?.[bus.currentStopIndex]?.name || bus.routeName;

          return (
            <div
              key={bus.id}
              className="p-5 rounded-2xl bg-white/85 border border-slate-200/80 shadow-xs hover:shadow-md hover:bg-white transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-baseline justify-between gap-2 mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-extrabold text-lg text-slate-900">
                      {bus.number}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs font-bold text-blue-700">
                      {bus.bayNumber}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${statusMeta.tone}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-slate-500 font-semibold">Destination</div>
                  <div className="font-extrabold text-slate-900 text-base flex items-center gap-1.5 mt-0.5">
                    <span>{bus.destination}</span>
                    <ArrowRight size={14} className="text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Driver: <span className="font-semibold text-slate-700">{bus.driverName}</span>
                    {bus.status === 'EN_ROUTE' && (
                      <>
                        {' · '}
                        <span className="font-mono tabular-nums text-slate-700">{bus.speedKmH} km/h</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-bold">Next Milestone</div>
                  <div className="font-bold text-slate-800 truncate mt-0.5">{nextStop}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium tabular-nums">
                  Departs: <b className="text-slate-900">{bus.departureTime}</b>
                </span>
                {onTrackBus && (
                  <button
                    type="button"
                    onClick={() => onTrackBus(bus.id)}
                    className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50"
                  >
                    <span>Track Live</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
