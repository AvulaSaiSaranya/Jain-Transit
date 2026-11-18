import React, { useEffect, useState } from 'react';
import { Bus, Home, LayoutDashboard, LogOut, Map as MapIcon, ShieldAlert } from 'lucide-react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LiveCampusMap } from './components/LiveCampusMap';
import { TransitChatbot } from './components/TransitChatbot';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentLounge } from './pages/student/StudentLounge';
import { StudentEmergencyPage } from './pages/student/StudentEmergencyPage';
import { DriverConsolePage } from './pages/driver/DriverConsolePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminFleetPage } from './pages/admin/AdminFleetPage';
import { AdminEmergencyPage } from './pages/admin/AdminEmergencyPage';

const AppRouter: React.FC = () => {
  const { currentUser, logout, buses } = useTransit();
  const [route, setRoute] = useState<string>(
    () => window.location.hash.replace('#', '') || '/'
  );

  const navigate = (nextRoute: string) => {
    setRoute(nextRoute);
    window.location.hash = nextRoute;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash.replace('#', '');
      setRoute(next || '/');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (route === 'emergency' || route === 'departures' || route === 'tracking') {
      const target = document.getElementById(route);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [route]);

  const [path, queryString] = route.split('?');
  const params = new URLSearchParams(queryString || '');
  const focusBusId = params.get('busId') ? Number(params.get('busId')) : undefined;
  const focusBusNumber = focusBusId
    ? buses.find((b) => b.id === focusBusId)?.number || null
    : null;

  if (path === '/' || path === '' || path === 'emergency' || path === 'departures' || path === 'tracking') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (path === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (path === '/register') {
    return <RegisterPage onNavigate={navigate} />;
  }

  if (!currentUser) {
    return <LoginPage onNavigate={navigate} />;
  }

  if (path.startsWith('/student')) {
    return (
      <div className="app-frame">
        <aside className="sidebar">
          <button
            type="button"
            className="brand cursor-pointer bg-transparent border-0 text-white"
            onClick={() => navigate('/')}
          >
            JAIN <span>TRANSIT</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/student')}
            className={`link ${path === '/student' ? 'active' : ''}`}
          >
            <Home size={18} />
            <span>Student Lounge</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/student/map')}
            className={`link ${path === '/student/map' ? 'active' : ''}`}
          >
            <MapIcon size={18} />
            <span>Live Campus Map</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/student/emergency')}
            className={`link ${path === '/student/emergency' ? 'active text-rose-300' : ''}`}
          >
            <ShieldAlert size={18} />
            <span>Emergency SOS</span>
          </button>

          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="px-3 py-2 text-xs text-slate-400">
              Signed in as <b className="text-white block truncate">{currentUser.fullName}</b>
              <span className="text-[11px] text-emerald-400 font-bold">Student Rider</span>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="link w-full text-rose-300 hover:text-rose-200"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <main className="main">
          {path === '/student' && <StudentLounge onNavigate={navigate} />}
          {path === '/student/map' && (
            <div>
              <div className="page-head">
                <div>
                  <div className="kicker">Real-time GPS Telemetry</div>
                  <h2>Live Campus & Corridor Map</h2>
                </div>
              </div>
              <LiveCampusMap buses={buses} focusBus={focusBusNumber} />
            </div>
          )}
          {path === '/student/emergency' && <StudentEmergencyPage onNavigate={navigate} />}
        </main>
      </div>
    );
  }

  if (path.startsWith('/driver')) {
    return (
      <div className="min-h-screen pb-12">
        <header className="shell flex items-center justify-between py-4 border-b border-slate-200/70">
          <button
            type="button"
            className="brand cursor-pointer bg-transparent border-0 text-slate-900"
            onClick={() => navigate('/')}
          >
            JAIN <span>TRANSIT</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white/80 hover:bg-white border border-slate-200 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </header>
        <DriverConsolePage onNavigate={navigate} />
      </div>
    );
  }

  if (path.startsWith('/admin')) {
    return (
      <div className="app-frame">
        <aside className="sidebar">
          <button
            type="button"
            className="brand cursor-pointer bg-transparent border-0 text-white"
            onClick={() => navigate('/')}
          >
            JAIN <span>TRANSIT</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin')}
            className={`link ${path === '/admin' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Control Center</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/fleet')}
            className={`link ${path === '/admin/fleet' ? 'active' : ''}`}
          >
            <Bus size={18} />
            <span>Fleet & Bays</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/emergency')}
            className={`link ${path === '/admin/emergency' ? 'active text-rose-300' : ''}`}
          >
            <ShieldAlert size={18} />
            <span>Emergency Triage</span>
          </button>

          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="px-3 py-2 text-xs text-slate-400">
              Logged in as <b className="text-white block truncate">{currentUser.fullName}</b>
              <span className="text-[11px] text-indigo-300 font-bold">Transport Admin</span>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="link w-full text-rose-300 hover:text-rose-200"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <main className="main">
          {path === '/admin' && <AdminDashboard onNavigate={navigate} />}
          {path === '/admin/fleet' && <AdminFleetPage />}
          {path === '/admin/emergency' && <AdminEmergencyPage />}
        </main>
      </div>
    );
  }

  return <LandingPage onNavigate={navigate} />;
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Jain University Campus Transit">
      <TransitProvider>
        <AppRouter />
        <ErrorBoundary fallbackTitle="Transit Guide">
          <TransitChatbot />
        </ErrorBoundary>
      </TransitProvider>
    </ErrorBoundary>
  );
}
