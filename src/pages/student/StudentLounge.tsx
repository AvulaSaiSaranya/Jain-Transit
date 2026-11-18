import React, { useMemo, useState } from 'react';
import { ArrowRight, Bus, Clock, FileText, Search, ShieldAlert, X } from 'lucide-react';
import { useTransit } from '../../context/TransitContext';
import { BayDepartureBoard } from '../../components/BayDepartureBoard';
import { ProximityAlertBanner } from '../../components/ProximityAlertBanner';

interface StudentLoungeProps {
  onNavigate: (route: string) => void;
}

function parseMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  try {
    if (timeStr.includes(':')) {
      const [hm, period] = timeStr.split(' ');
      const [hRaw, mRaw] = (hm || '0:0').split(':').map((n) => Number(n) || 0);
      let h = hRaw;
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + mRaw;
    }
    if (timeStr.length === 4) {
      const h = parseInt(timeStr.slice(0, 2), 10) || 0;
      const m = parseInt(timeStr.slice(2, 4), 10) || 0;
      return h * 60 + m;
    }
  } catch {
    return 0;
  }
  return 0;
}

export const StudentLounge: React.FC<StudentLoungeProps> = ({ onNavigate }) => {
  const {
    currentUser,
    buses,
    cityBuses,
    activeAnnouncement,
    soundEnabled,
    setSoundEnabled,
    playChimeManually,
  } = useTransit();

  const [destination, setDestination] = useState<'Bengaluru' | 'Harohalli'>('Bengaluru');
  const [commuteMode, setCommuteMode] = useState<'NORMAL' | 'EMERGENCY'>('NORMAL');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [operatorFilter, setOperatorFilter] = useState<'ALL' | 'BMTC' | 'KSRTC'>('ALL');
  const [timeSlotFilter, setTimeSlotFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSheetModal, setShowSheetModal] = useState(false);

  const filteredFleet = useMemo(
    () => buses.filter((b) => b.destination.toLowerCase() === destination.toLowerCase()),
    [buses, destination]
  );

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sortedCityBuses = useMemo(() => {
    return [...cityBuses].sort(
      (a, b) =>
        parseMinutes(a.departureTimeRaw || a.departureTime) -
        parseMinutes(b.departureTimeRaw || b.departureTime)
    );
  }, [cityBuses]);

  const upcomingCityBus = useMemo(() => {
    return (
      sortedCityBuses.find(
        (b) => parseMinutes(b.departureTimeRaw || b.departureTime) >= currentMinutes
      ) || sortedCityBuses[0]
    );
  }, [sortedCityBuses, currentMinutes]);

  const visibleCityBuses = useMemo(() => {
    return sortedCityBuses.filter((bus) => {
      if (operatorFilter !== 'ALL' && bus.operator !== operatorFilter) return false;
      const mins = parseMinutes(bus.departureTimeRaw || bus.departureTime);
      if (timeSlotFilter === 'MORNING' && mins >= 720) return false;
      if (timeSlotFilter === 'AFTERNOON' && (mins < 720 || mins >= 990)) return false;
      if (timeSlotFilter === 'EVENING' && mins < 990) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hit =
          bus.routeNumber.toLowerCase().includes(q) ||
          bus.destination.toLowerCase().includes(q) ||
          bus.via.toLowerCase().includes(q) ||
          bus.departureTime.toLowerCase().includes(q) ||
          bus.departureTimeRaw.includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [sortedCityBuses, operatorFilter, timeSlotFilter, searchQuery]);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Student Lounge · Welcome {currentUser?.fullName}</div>
          <h2>Where to today?</h2>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/student/emergency')}
          className="btn btn-danger"
        >
          <ShieldAlert size={16} />
          <span>Emergency Transport</span>
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-5">
        <button
          type="button"
          onClick={() => setDestination('Bengaluru')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            destination === 'Bengaluru'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white/85 text-slate-700 border-slate-200 hover:bg-white'
          }`}
        >
          Bengaluru
        </button>
        <button
          type="button"
          onClick={() => setDestination('Harohalli')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            destination === 'Harohalli'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white/85 text-slate-700 border-slate-200 hover:bg-white'
          }`}
        >
          Harohalli
        </button>
        <button
          type="button"
          onClick={() => setCommuteMode('NORMAL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            commuteMode === 'NORMAL'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white/85 text-slate-700 border-slate-200 hover:bg-white'
          }`}
        >
          Normal Commute
        </button>
        <button
          type="button"
          onClick={() => {
            setCommuteMode('EMERGENCY');
            onNavigate('/student/emergency');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            commuteMode === 'EMERGENCY'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white/85 text-rose-700 border-rose-200 hover:bg-rose-50'
          }`}
        >
          Emergency Travel
        </button>
      </div>

      {!bannerDismissed && activeAnnouncement && (
        <ProximityAlertBanner
          announcement={activeAnnouncement}
          onDismiss={() => setBannerDismissed(true)}
          onPlayChime={playChimeManually}
        />
      )}

      <div className="mb-6">
        <BayDepartureBoard
          buses={buses}
          onTrackBus={(busId) => onNavigate(`/student/map?busId=${busId}`)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onPlayChime={playChimeManually}
        />
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-4 flex-wrap gap-2">
          <div>
            <div className="kicker" style={{ margin: 0 }}>Direct Campus Fleet</div>
            <h3 className="font-display text-lg font-extrabold text-slate-900 tracking-tight m-0">
              Shuttles to {destination}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/student/map')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-transparent border-0"
          >
            <span>View all on live map</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="bus-list">
          {filteredFleet.map((bus) => {
            const currentStop = bus.stops[bus.currentStopIndex]?.name || 'Campus Terminal';
            return (
              <div key={bus.id} className="bus-row">
                <div>
                  <div className="bus-num">{bus.number}</div>
                  <div className={`text-[11px] font-bold mt-0.5 ${bus.isSimulated ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {bus.isSimulated ? 'Scheduled Feed' : 'Live Driver GPS'}
                  </div>
                </div>

                <div>
                  <div className="font-extrabold text-slate-900 text-base">{bus.routeName}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Driver: <b className="text-slate-700">{bus.driverName}</b></span>
                    <span aria-hidden="true">·</span>
                    <span>Bay: <b className="text-slate-700">{bus.bayNumber}</b></span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">Departs: <b className="text-slate-700">{bus.departureTime}</b></span>
                    <span aria-hidden="true">·</span>
                    <span>Stop: <b className="text-blue-700">{currentStop}</b></span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/student/map?busId=${bus.id}`)}
                    className="btn btn-primary text-xs"
                  >
                    <span>Track Live</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="pb-4 border-b border-slate-200/70 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-blue-700">
              Official Gate Timetable · 14 Daily Departures
            </div>
            <h3 className="font-display text-xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2 mb-0">
              <Bus size={20} className="text-blue-600" />
              <span>Jain University Gate Departure Timings (BMTC / KSRTC)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl mb-0">
              Official departure slots from Jain University Gate along the Kanakapura highway corridor (NH-948 / Harohalli road).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSheetModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shrink-0 cursor-pointer"
          >
            <FileText size={14} className="text-blue-600" />
            <span>View Gate Timetable Sheet</span>
          </button>
        </div>

        {upcomingCityBus && (
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-sm mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                Next Gate Departure
              </div>
              <div className="font-display text-lg font-extrabold mt-0.5 tabular-nums">
                {upcomingCityBus.departureTime} · {upcomingCityBus.routeNumber} ({upcomingCityBus.operator})
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                To {upcomingCityBus.destination} · Via {upcomingCityBus.via}
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-300 tabular-nums">
              Timing Code: {upcomingCityBus.departureTimeRaw}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['ALL', 'BMTC', 'KSRTC'] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setOperatorFilter(op)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  operatorFilter === op
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {op === 'ALL' ? 'All Operators (14)' : op === 'BMTC' ? 'BMTC (12)' : 'KSRTC (2)'}
              </button>
            ))}

            {(['ALL', 'MORNING', 'AFTERNOON', 'EVENING'] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlotFilter(slot)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  timeSlotFilter === slot
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {slot === 'ALL'
                  ? 'Full Day'
                  : slot === 'MORNING'
                    ? 'Morning'
                    : slot === 'AFTERNOON'
                      ? 'Afternoon'
                      : 'Evening'}
              </button>
            ))}
          </div>

          <div className="relative min-w-[230px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route, time, stop..."
              className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:border-blue-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Clear filter"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/80">
          <table className="table w-full">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs">
                <th className="py-2.5 px-3 text-left">Gate Departure</th>
                <th className="py-2.5 px-3 text-left">Route #</th>
                <th className="py-2.5 px-3 text-left">Operator</th>
                <th className="py-2.5 px-3 text-left">Destination</th>
                <th className="py-2.5 px-3 text-left">Corridor Stops / Via</th>
                <th className="py-2.5 px-3 text-right">Timing Code</th>
              </tr>
            </thead>
            <tbody>
              {visibleCityBuses.map((bus) => {
                const isNext = upcomingCityBus?.id === bus.id;
                return (
                  <tr
                    key={bus.id}
                    className={`border-b border-slate-200/60 transition-colors ${
                      isNext ? 'bg-blue-50/90 font-semibold' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={isNext ? 'text-blue-600' : 'text-slate-400'} />
                        <div>
                          <span className={`text-sm font-bold tabular-nums ${isNext ? 'text-blue-900' : 'text-slate-800'}`}>
                            {bus.departureTime}
                          </span>
                          {isNext && (
                            <span className="block text-[11px] text-emerald-700 font-bold">
                              Upcoming next
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        {bus.routeNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-bold ${bus.operator === 'BMTC' ? 'text-blue-700' : 'text-rose-700'}`}>
                        {bus.operator}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 text-xs">{bus.destination}</td>
                    <td className="py-3 px-3 text-xs text-slate-600 max-w-xs">{bus.via}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-bold text-xs text-slate-700 tabular-nums">
                        {bus.departureTimeRaw || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {visibleCityBuses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    No scheduled gate departures match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
          <span>
            <b>Boarding Location:</b> Jain University Main Highway Gate (Kanakapura Road / NH-948)
          </span>
          <span className="font-mono text-slate-400">
            Source: Official Jain University Gate Departure Notice
          </span>
        </div>
      </div>

      {showSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setShowSheetModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              aria-label="Close timetable notice"
            >
              <X size={18} />
            </button>

            <h3 className="font-display text-lg font-black text-slate-900 tracking-tight mb-1">
              Official Gate Timetable Notice
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Departure timings for city buses operating directly from Jain University Main Gate (NH-948):
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 max-h-[380px] overflow-y-auto space-y-2">
              {sortedCityBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-200/70 last:border-0 text-xs"
                >
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    {bus.departureTime}
                  </div>
                  <div className="font-bold text-blue-700">{bus.routeNumber} · {bus.operator}</div>
                  <div className="text-slate-600 truncate max-w-[180px]">{bus.destination}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="btn btn-primary text-xs py-2 px-4"
              >
                Close Timetable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
