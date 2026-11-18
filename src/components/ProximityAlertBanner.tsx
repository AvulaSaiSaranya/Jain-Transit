import React from 'react';
import { Bell, Clock, MapPin, Volume2, X } from 'lucide-react';
import type { Announcement } from '../context/TransitContext';

interface ProximityAlertBannerProps {
  announcement: Announcement | null;
  onDismiss: () => void;
  onPlayChime: () => void;
}

export const ProximityAlertBanner: React.FC<ProximityAlertBannerProps> = ({
  announcement,
  onDismiss,
  onPlayChime,
}) => {
  if (!announcement) return null;
  const isBoarding = announcement.severity === 'BOARDING';

  return (
    <div
      className={`rounded-2xl p-4 shadow-lg border border-white/20 mb-6 text-white transition-all duration-200 ${
        isBoarding
          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
          : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800'
      }`}
    >
      <div className="flex items-start md:items-center justify-between gap-4 flex-wrap md:flex-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
              <span className="uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-md">
                {isBoarding ? 'Boarding Gate Open' : 'Shuttle Approach Alert'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock size={12} />
                {announcement.etaMinutes === 0 ? 'Now at Stop' : `ETA ~${announcement.etaMinutes} mins`}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {announcement.bayNumber}
              </span>
            </div>
            <p className="font-bold text-sm md:text-base mt-1 text-white/95">
              {announcement.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            onClick={onPlayChime}
            className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
            title="Replay station chime"
          >
            <Volume2 size={14} />
            <span>Chime</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Dismiss announcement"
            aria-label="Dismiss announcement"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
