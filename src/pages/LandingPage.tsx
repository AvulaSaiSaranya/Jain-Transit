import React from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { LiveCampusMap } from '../components/LiveCampusMap';
import { BayDepartureBoard } from '../components/BayDepartureBoard';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { buses, login, soundEnabled, setSoundEnabled, playChimeManually } = useTransit();

  const handleDemoLogin = async (email: string) => {
    const user = await login(email, 'Transit@123');
    if (user.role === 'STUDENT') onNavigate('/student');
    else if (user.role === 'DRIVER') onNavigate('/driver');
    else if (user.role === 'ADMIN') onNavigate('/admin');
  };

  return (
    <div className="min-h-screen">
      <header className="shell flex items-center justify-between gap-8 py-5 border-b border-slate-200/70">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="brand text-slate-900 no-underline shrink-0"
        >
          JAIN <span>TRANSIT</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <a href="#departures" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 no-underline text-slate-700">
            Departures
          </a>
          <a href="#tracking" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 no-underline text-slate-700">
            Live Map
          </a>
          <a href="#emergency" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 no-underline text-slate-700">
            Emergency SOS
          </a>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="text-slate-700 font-semibold hover:text-blue-600 bg-transparent border-0 cursor-pointer text-sm whitespace-nowrap shrink-0"
          >
            Sign in
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="btn btn-primary whitespace-nowrap shrink-0"
          >
            Hop in
          </button>
        </div>
      </header>

      <section className="shell grid grid-cols-1 lg:grid-cols-12 items-center gap-10 py-12 lg:py-16">
        <div className="lg:col-span-7">
          <div className="kicker">Campus rides, minus the guesswork</div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mt-2 mb-4 max-w-xl [text-wrap:balance]">
            Catch the next shuttle like a local.
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mb-6">
            Smarter journeys. Faster departures. Track college buses along Kanakapura Road toward Harohalli and Bengaluru, follow live driver stop checklists and bay departures, or ping the emergency desk for immediate campus dispatch.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate('/student')}
              className="btn btn-primary"
            >
              <span>Find a departure</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="btn btn-ghost"
            >
              Driver / Admin Login
            </button>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-white/75 border border-slate-200/80 backdrop-blur-md">
            <div className="text-xs font-bold text-slate-500 mb-2.5">
              One-Click Instant Demo Portals
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleDemoLogin('student@jaintransit.edu')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
              >
                Student Demo (Aarav)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('driver1@jaintransit.edu')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              >
                Driver Demo (JT-01 Cab)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@jaintransit.edu')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                Admin Control Center
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 flex-wrap text-xs font-medium text-slate-500">
            <span>JT-01 approaching Kanakapura Cross</span>
            <span aria-hidden="true">·</span>
            <span>JT-02 boarding at Bay 1</span>
            <span aria-hidden="true">·</span>
            <span>Emergency transport desk standing by</span>
            <span aria-hidden="true">·</span>
            <span>BMTC 211-C on schedule</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <LiveCampusMap buses={buses} compact onSelectBus={() => onNavigate('/student/map')} />
        </div>
      </section>

      <section id="departures" className="shell py-8">
        <BayDepartureBoard
          buses={buses}
          onTrackBus={() => onNavigate('/student/map')}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onPlayChime={playChimeManually}
        />
      </section>

      <section id="tracking" className="shell py-10">
        <div className="page-head">
          <div>
            <div className="kicker">Real-time GPS & Timetable</div>
            <h2>Corridor Map View</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/student/map')}
            className="btn btn-ghost text-xs"
          >
            Open in Student Portal
          </button>
        </div>

        <LiveCampusMap buses={buses} onSelectBus={() => onNavigate('/student/map')} />
      </section>

      <section id="emergency" className="shell pt-6 pb-16">
        <div className="emergency-banner">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-rose-100">
              <ShieldAlert size={18} className="text-white" />
              <span>Campus SOS Dispatch</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white m-0 [text-wrap:balance]">
              Late night or medical transit emergency?
            </h2>
            <p className="text-rose-100 text-sm md:text-base max-w-xl mt-2 mb-0">
              Alert the transport desk immediately with your live campus coordinates. Supervisors allocate an emergency vehicle on priority.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              handleDemoLogin('student@jaintransit.edu').then(() => {
                onNavigate('/student/emergency');
              });
            }}
            className="btn bg-white text-rose-600 font-extrabold hover:bg-rose-50 shadow-lg shrink-0"
          >
            Request Emergency Shuttle
          </button>
        </div>
      </section>

      <footer className="shell flex flex-col sm:flex-row items-center justify-between gap-2 py-8 border-t border-slate-200/70 text-xs text-slate-500">
        <div>© 2026 Jain Transit · Jain University Campus Transport System</div>
        <div>Smarter journeys. Faster departures.</div>
      </footer>
    </div>
  );
};
