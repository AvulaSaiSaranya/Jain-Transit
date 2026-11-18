import React, { useState } from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useTransit } from '../context/TransitContext';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useTransit();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'STUDENT') onNavigate('/student');
      else if (user.role === 'DRIVER') onNavigate('/driver');
      else if (user.role === 'ADMIN') onNavigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Transit@123');
  };

  return (
    <div className="auth-wrap">
      <div className="auth-visual">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="brand cursor-pointer bg-transparent border-0 text-white"
          style={{ position: 'absolute', top: 32, left: 40 }}
        >
          JAIN <span style={{ color: '#93c5fd' }}>TRANSIT</span>
        </button>

        <div>
          <div className="kicker" style={{ color: '#fdba74' }}>
            Role-Based Campus Portal
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight my-2 text-white [text-wrap:balance]">
            Smarter journeys. Faster departures.
          </h2>
          <p className="text-white/85 max-w-md text-sm sm:text-base leading-relaxed">
            Track university shuttles along the Kanakapura corridor, view in-cab driver stop progression, check live bay departures, and access emergency dispatch services.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card form-field">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4 bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to homepage
          </button>

          <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight m-0">
            Sign in
          </h2>
          <p className="text-slate-500 text-xs mt-1 mb-4">
            Sign in with your campus credentials or select a demo role.
          </p>

          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 mb-4">
            <div className="text-[11px] font-bold text-blue-900 mb-2">
              Tap to autofill demo credentials
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => autofill('student@jaintransit.edu')}
                className="py-2 px-2 rounded-lg text-xs font-bold bg-white text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => autofill('driver1@jaintransit.edu')}
                className="py-2 px-2 rounded-lg text-xs font-bold bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              >
                Driver (JT-01)
              </button>
              <button
                type="button"
                onClick={() => autofill('admin@jaintransit.edu')}
                className="py-2 px-2 rounded-lg text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Campus Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@jaintransit.edu"
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Transit@123"
              required
            />

            {error && (
              <div className="mt-3 flex items-center gap-1.5 bg-rose-50 text-rose-700 p-2.5 rounded-xl border border-rose-200 text-xs font-semibold">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-5 py-3"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          <div className="text-center mt-5 text-xs text-slate-500">
            Need student registration?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="font-bold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
