import React from 'react';
import { ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { LiveCampusMap } from '../components/LiveCampusMap';
import { BayDepartureBoard } from '../components/BayDepartureBoard';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

const HERO_TICKER_ITEMS = [
  'JT-01 approaching Kanakapura Cross',
  'JT-02 boarding at Bay 1',
  'Driver in-cab stop checklists active',
  'Emergency transport desk standing by',
  'City buses (BMTC 211-C) on schedule',
];

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
      <header className="shell flex items-center justify-between gap-6 py-7">
        <div className="flex items-baseline gap-2.5 min-w-0">
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
          <span className="hidden sm:inline text-xs font-medium text-slate-500 whitespace-nowrap">
            Smarter journeys. Faster departures.
          </span>
        </div>

        <div className="flex items-center gap-7 shrink-0">
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-800">
            <a href="#departures" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 no-underline text-slate-800">
              Departures
            </a>
            <a href="#tracking" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 no-underline text-slate-800">
              Live Map
            </a>
            <a href="#emergency" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 no-underline text-slate-800">
              Emergency SOS
            </a>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="text-slate-800 font-semibold hover:text-blue-600 bg-transparent border-0 cursor-pointer text-sm whitespace-nowrap shrink-0"
            >
              Sign in
            </button>
          </nav>

          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="btn btn-primary rounded-full px-6 py-2.5 whitespace-nowrap shrink-0"
          >
            Hop in
          </button>
        </div>
      </header>

      <section className="shell pt-12 pb-16 lg:pt-[68px] lg:pb-16">
        <div className="kicker uppercase tracking-[0.08em] mb-2.5">Campus rides, minus the guesswork</div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.06] mt-0 mb-5">
          Catch the next shuttle like a local.
        </h1>
        <p className="text-slate-500 text-lg sm:text-[18px] leading-[1.6] max-w-[560px] mb-3 font-normal">
          Smarter journeys. Faster departures.
        </p>
        <p className="text-slate-500 text-base sm:text-[18px] leading-[1.6] max-w-[560px] mb-8 font-normal">
          See college buses moving along Kanakapura road toward Harohalli and Bengaluru, track in-cab stop checklists and bay departures, or ping the emergency desk if you need immediate campus dispatch.
        </p>

        <div className="flex items-center gap-3.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('/student')}
            className="btn btn-primary rounded-full px-6 py-3 min-h-[46px]"
          >
            <span>Find a departure</span>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="btn btn-ghost rounded-full px-6 py-3 min-h-[46px]"
          >
            Driver / Admin Login
          </button>
        </div>

        <div className="mt-10 px-6 py-5 rounded-[20px] bg-white/78 border border-white/90 shadow-[0_14px_40px_rgba(37,99,235,0.08)] backdrop-blur-md">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 mb-3">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            <span>One-Click Instant Demo Portals:</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleDemoLogin('student@jaintransit.edu')}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer"
            >
              Student Demo (Aarav)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('driver1@jaintransit.edu')}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer"
            >
              Driver Demo (JT-01 Cab)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@jaintransit.edu')}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 transition-colors cursor-pointer"
            >
              Admin Control Center
            </button>
          </div>
        </div>

        <div className="mt-8 ticker-wrap rounded-full bg-white/82 border border-white/90 shadow-[0_10px_28px_rgba(37,99,235,0.06)] backdrop-blur-md py-3.5 px-6">
          <div className="ticker-track text-xs font-semibold text-slate-600">
            {[...HERO_TICKER_ITEMS, ...HERO_TICKER_ITEMS].map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="departures" className="shell pt-10 pb-8 lg:pt-12">
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
