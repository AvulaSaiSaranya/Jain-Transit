import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTransit } from '../context/TransitContext';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useTransit();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ email, pass: password, fullName, phone });
      onNavigate('/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
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
            Student Access
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight my-2 text-white [text-wrap:balance]">
            Track campus shuttles in real time.
          </h2>
          <p className="text-white/85 max-w-md text-sm sm:text-base leading-relaxed">
            Register once, then monitor college shuttles on the live corridor map, check bay departures, and reach the emergency dispatch desk whenever needed.
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
            Student registration
          </h2>
          <p className="text-slate-500 text-xs mt-1 mb-4">
            Create your campus commuter account.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              required
            />

            <label htmlFor="reg-email">Campus Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aarav@jaintransit.edu"
              required
            />

            <label htmlFor="reg-phone">Phone Number (optional)</label>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98450 00000"
            />

            <label htmlFor="reg-pass">Password (min 6 characters)</label>
            <input
              id="reg-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              minLength={6}
              required
            />

            {error && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-5 py-3"
            >
              {loading ? 'Creating account...' : 'Create student account'}
            </button>
          </form>

          <div className="text-center mt-5 text-xs text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="font-bold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
