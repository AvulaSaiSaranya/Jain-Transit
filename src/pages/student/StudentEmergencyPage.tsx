import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, MapPin, Send, ShieldAlert } from 'lucide-react';
import { useTransit } from '../../context/TransitContext';

interface StudentEmergencyPageProps {
  onNavigate: (route: string) => void;
}

export const StudentEmergencyPage: React.FC<StudentEmergencyPageProps> = ({ onNavigate }) => {
  const { currentUser, emergencies, createEmergencyRequest } = useTransit();
  const [destination, setDestination] = useState('Bengaluru (Fortis / Apollo Hospital Bannerghatta)');
  const [reason, setReason] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState('Campus Terminal / Hostel Block');
  const [acquiring, setAcquiring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const myEmergencies = emergencies.filter(
    (e) => e.studentId === currentUser?.id || e.studentId === 'u_student_1'
  );

  const handleAttachLocation = () => {
    setAcquiring(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationLabel(
            `GPS Attached (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          );
          setAcquiring(false);
        },
        () => {
          setCoords({ lat: 12.6521, lng: 77.4412 });
          setLocationLabel('Campus Terminal Default (12.6521, 77.4412)');
          setAcquiring(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setCoords({ lat: 12.6521, lng: 77.4412 });
      setLocationLabel('Campus Terminal Default (12.6521, 77.4412)');
      setAcquiring(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      const created = await createEmergencyRequest(destination, reason.trim(), coords?.lat, coords?.lng);
      setConfirmation(
        `SOS Request #${created.id} broadcasted to the Transport Supervisor Desk. Stay at your pinned location until a shuttle is assigned.`
      );
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('/student')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to lounge
          </button>
          <h2>Emergency Transport (SOS)</h2>
        </div>
      </div>

      <div className="emergency-banner mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-wider text-rose-100">
            <ShieldAlert size={18} className="text-white" />
            <span>High Priority Dispatch Desk</span>
          </div>
          <h2 className="font-display text-xl md:text-2xl font-black text-white my-1">
            Direct Transport Supervisor Hotline
          </h2>
          <p className="text-rose-100 text-xs md:text-sm max-w-xl m-0">
            This alerts the campus fleet desk immediately. Do not assume vehicle departure until your status changes to <b>ASSIGNED</b> or <b>IN PROGRESS</b>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card form-field">
          <h3 className="font-display text-xl font-extrabold text-slate-900 tracking-tight pb-3 border-b border-slate-200/70 mb-4 mt-0">
            Broadcast SOS Request
          </h3>

          {confirmation && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-start gap-2 mb-4">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{confirmation}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="sos-dest">Destination Hospital / Transit Center</label>
            <select
              id="sos-dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            >
              <option value="Bengaluru (Fortis / Apollo Hospital Bannerghatta)">
                Bengaluru (Medical Clinic / Hospital)
              </option>
              <option value="Bengaluru (Banashankari Metro Hub)">
                Bengaluru (Metro Transit Connection)
              </option>
              <option value="Harohalli (Government Hospital & Town Center)">
                Harohalli (Local Clinic / Stand)
              </option>
              <option value="Bengaluru (Kempegowda Central Railway Station)">
                Bengaluru (Railway / Airport Shuttle)
              </option>
            </select>

            <label htmlFor="sos-reason">Emergency Reason / Details</label>
            <textarea
              id="sos-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your situation (e.g. severe injury, urgent medical appointment, missed last scheduled city transit with no safe return options)..."
              required
            />

            <label>Your Live Campus Location</label>
            <div className="flex items-center gap-3 mt-1 p-3 rounded-xl bg-white border border-slate-200">
              <button
                type="button"
                disabled={acquiring}
                onClick={handleAttachLocation}
                className="btn btn-ghost text-xs py-2 px-3 shrink-0"
              >
                <MapPin size={14} className="text-rose-600" />
                <span>{acquiring ? 'Acquiring...' : 'Attach GPS Location'}</span>
              </button>
              <span className="text-xs text-slate-600 font-medium truncate">{locationLabel}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-danger w-full mt-6 py-3"
            >
              <Send size={16} />
              <span>{submitting ? 'Broadcasting...' : 'Broadcast Emergency Request'}</span>
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="font-display text-xl font-extrabold text-slate-900 tracking-tight pb-3 border-b border-slate-200/70 mb-4 mt-0">
            Recent Emergency Requests
          </h3>

          {myEmergencies.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <Clock size={32} className="mx-auto mb-2 text-slate-400 opacity-60" />
              <p>No active emergency dispatch requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myEmergencies.map((req) => {
                const statusColor =
                  req.status === 'ASSIGNED' || req.status === 'IN_PROGRESS'
                    ? 'text-blue-700'
                    : req.status === 'COMPLETED'
                      ? 'text-emerald-700'
                      : 'text-amber-700';

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        #{req.id}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{req.destination}</div>
                    <p className="text-xs text-slate-600 mt-1 mb-0">{req.reason}</p>
                    {req.assignedBusNumber && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs font-semibold text-blue-700">
                        Assigned Shuttle: <b>{req.assignedBusNumber}</b>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
