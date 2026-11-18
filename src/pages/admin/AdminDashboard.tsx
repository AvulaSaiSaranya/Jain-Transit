import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTransit } from '../../context/TransitContext';
import { LiveCampusMap } from '../../components/LiveCampusMap';

interface AdminDashboardProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { buses, cityBuses, emergencies } = useTransit();

  const enRouteCount = buses.filter((b) => b.status === 'EN_ROUTE').length;
  const boardingOrStandbyCount = buses.filter(
    (b) => b.status === 'BOARDING' || b.status === 'IDLE'
  ).length;
  const pendingSosCount = emergencies.filter(
    (e) => e.status === 'PENDING' || e.status === 'ACKNOWLEDGED'
  ).length;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Transport Operations</div>
          <h2>Control Center</h2>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/admin/fleet')}
          className="btn btn-primary text-xs"
        >
          Manage Fleet & Bays
        </button>
      </div>

      <div className="stat-row mb-6">
        <div className="stat">
          <b>{buses.length}</b>
          <span>Total Fleet Shuttles</span>
        </div>
        <div className="stat">
          <b>{enRouteCount}</b>
          <span>Active En Route</span>
        </div>
        <div className="stat">
          <b>{boardingOrStandbyCount}</b>
          <span>Boarding / Standby</span>
        </div>
        <div className="stat">
          <b>{cityBuses.length}</b>
          <span>Daily Gate Trips</span>
        </div>
        <div className="stat">
          <b className={pendingSosCount > 0 ? 'text-rose-600' : ''}>{pendingSosCount}</b>
          <span>Pending SOS Alerts</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-black text-slate-900 tracking-tight m-0">
            Corridor Live Map & Vehicle Positions
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Real-time driver telemetry</span>
        </div>
        <LiveCampusMap buses={buses} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-4">
          <div>
            <div className="kicker" style={{ margin: 0 }}>Fleet Telemetry</div>
            <h3 className="font-display text-xl font-extrabold text-slate-900 tracking-tight m-0">
              Fleet Status & Stop Progression
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/admin/fleet')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-transparent border-0"
          >
            <span>Manage fleet</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="space-y-3">
          {buses.map((bus) => {
            const currentStop = bus.stops[bus.currentStopIndex];
            const completedStops = bus.stops.filter((s) => s.status === 'COMPLETED').length;

            return (
              <div
                key={bus.id}
                className="p-4 rounded-2xl bg-white/85 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0">
                    {bus.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-base">
                        {bus.destination}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs text-blue-700 font-bold">{bus.bayNumber}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span
                        className={`text-xs font-bold uppercase ${
                          bus.status === 'EN_ROUTE'
                            ? 'text-emerald-700'
                            : bus.status === 'PROBLEM'
                              ? 'text-rose-700'
                              : 'text-slate-600'
                        }`}
                      >
                        {bus.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Driver: <b>{bus.driverName}</b> · Current Stop:{' '}
                      <b className="text-slate-700">{currentStop?.name || 'Terminal'}</b>
                    </div>
                  </div>
                </div>

                <div className="text-right tabular-nums text-xs">
                  <div className="font-bold text-slate-800">
                    Departs {bus.departureTime}
                  </div>
                  <div className="text-slate-500 mt-0.5 font-mono">
                    Milestone {completedStops + 1} / {bus.stops.length}
                    {bus.status === 'EN_ROUTE' ? ` · ${bus.speedKmH} km/h` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
