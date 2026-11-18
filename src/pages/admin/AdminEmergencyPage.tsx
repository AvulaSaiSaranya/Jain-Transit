import React from 'react';
import { useTransit } from '../../context/TransitContext';

export const AdminEmergencyPage: React.FC = () => {
  const { emergencies, buses, adminTriageEmergency } = useTransit();

  const handleAction = async (
    id: string,
    action: 'ACKNOWLEDGE' | 'ASSIGN' | 'START' | 'COMPLETE' | 'CANCEL',
    busId?: number
  ) => {
    await adminTriageEmergency(id, action, busId);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Triage Desk</div>
          <h2>Emergency Transport Requests ({emergencies.length})</h2>
        </div>
      </div>

      <div className="card mb-6">
        <p className="text-xs text-slate-600 font-medium m-0">
          Review emergency requests from stranded or injured students. Assign an active campus shuttle after verifying vehicle status and location.
        </p>
      </div>

      <div className="space-y-4">
        {emergencies.map((req) => {
          const statusTone =
            req.status === 'ASSIGNED' || req.status === 'IN_PROGRESS'
              ? 'text-blue-700'
              : req.status === 'COMPLETED'
                ? 'text-emerald-700'
                : req.status === 'CANCELLED'
                  ? 'text-slate-500'
                  : 'text-amber-700';

          return (
            <div key={req.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                      #{req.id}
                    </span>
                    <strong className="text-slate-900 text-base">
                      {req.studentName} → {req.destination}
                    </strong>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className={`text-xs font-bold uppercase ${statusTone}`}>{req.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 tabular-nums">
                    Logged: {req.createdAt}{' '}
                    {req.latitude && req.longitude && `· GPS: (${req.latitude.toFixed(3)}, ${req.longitude.toFixed(3)})`}
                  </div>
                </div>

                {req.assignedBusNumber && (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                    Allocated: {req.assignedBusNumber}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700 bg-white/80 p-3 rounded-xl border border-slate-200/70 my-3">
                {req.reason || 'No detailed reason specified.'}
              </p>

              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200/70">
                {req.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleAction(req.id, 'ACKNOWLEDGE')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}

                {(['PENDING', 'ACKNOWLEDGED'] as string[]).includes(req.status) &&
                  buses.map((bus) => (
                    <button
                      key={bus.id}
                      type="button"
                      onClick={() => handleAction(req.id, 'ASSIGN', bus.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Assign {bus.number}
                    </button>
                  ))}

                {req.status === 'ASSIGNED' && (
                  <button
                    type="button"
                    onClick={() => handleAction(req.id, 'START')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    Mark In Progress
                  </button>
                )}

                {(['ASSIGNED', 'IN_PROGRESS'] as string[]).includes(req.status) && (
                  <button
                    type="button"
                    onClick={() => handleAction(req.id, 'COMPLETE')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Complete
                  </button>
                )}

                {!(['COMPLETED', 'CANCELLED'] as string[]).includes(req.status) && (
                  <button
                    type="button"
                    onClick={() => handleAction(req.id, 'CANCEL')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                  >
                    Cancel
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
