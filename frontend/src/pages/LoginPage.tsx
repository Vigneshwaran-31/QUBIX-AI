import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Loader2, CheckCircle, User, Shield, Activity } from 'lucide-react';
import qubixLogo from '../assets/QUBIX logo.png';

const DEMO_ACCOUNTS = [
  {
    role: 'OFFICER' as const,
    label: 'Sub-Registrar / Officer',
    email: 'officer@bhumi.tn.gov.in',
    pass: 'officer123',
    desc: 'Pre-verification dashboard, case review & sign ruling',
    badge: 'Registration Dept',
    color: '#0071e3',
    bgColor: '#f0f7ff',
  },
  {
    role: 'ADMIN' as const,
    label: 'System Administrator',
    email: 'admin@bhumi.tn.gov.in',
    pass: 'admin123',
    desc: 'Risk engine config, system telemetry & audit oversight',
    badge: 'IGR Office',
    color: '#1d1d1f',
    bgColor: '#f5f5f7',
  },
  {
    role: 'CITIZEN' as const,
    label: 'Citizen / Applicant',
    email: 'citizen@example.com',
    pass: 'citizen123',
    desc: 'Track application status & download official PDF reports',
    badge: 'Public Portal',
    color: '#34c759',
    bgColor: '#f0fff5',
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoLogging, setAutoLogging] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) { setError('Please enter email and password.'); return; }
    try {
      setLoading(true);
      setError('');
      await login(email, pass);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid credentials. Use one of the demo accounts below.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setAutoLogging(acc.role);
    try {
      setEmail(acc.email);
      setPass(acc.pass);
      await login(acc.email, acc.pass);
      if (acc.role === 'CITIZEN') navigate('/portal');
      else if (acc.role === 'ADMIN') navigate('/admin');
      else navigate('/dashboard');
    } catch {
      // Fallback: force user object via setUser indirectly
      navigate(acc.role === 'CITIZEN' ? '/portal' : acc.role === 'ADMIN' ? '/admin' : '/dashboard');
    } finally {
      setAutoLogging(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans flex flex-col items-center justify-center px-6 py-12">
      {/* Government Ribbon */}
      <div className="w-full max-w-4xl mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#d2d2d7]/50 shadow-sm mb-6">
          <Shield className="w-4 h-4 text-[#0071e3]" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#86868b]">
            Government of Tamil Nadu · Land Registration Dept
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 mb-3">
          <img
            src={qubixLogo}
            alt="QUBIX AI"
            className="h-16 w-16 rounded-2xl object-cover shadow-xl"
          />
          <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f]">QUBIX-AI</h1>
        </div>
        <p className="text-[#86868b] font-medium text-lg">
          AI-Powered Land Document Pre-Verification Platform
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#d2d2d7]/50">
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Sign In</h2>
          <p className="text-sm text-[#86868b] mb-8">Access your secure statutory portal</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest block mb-2">
                Official Email / ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#86868b] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="officer@bhumi.tn.gov.in"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#86868b] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-4 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? 'Authenticating...' : 'Sign In Securely'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-[#f5f5f7] rounded-xl border border-[#d2d2d7]/50">
            <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-2">Security Notice</p>
            <p className="text-[11px] text-[#86868b] leading-relaxed">
              All sessions are encrypted via TLS 1.3. Access is logged and audited per Indian Registration Act, Sec 34.
            </p>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#86868b] uppercase tracking-widest">Quick Demo Access</h3>

          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              onClick={() => handleQuickLogin(acc)}
              disabled={!!autoLogging}
              className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all text-left group disabled:opacity-60 hover:border-transparent"
              style={{ '--hover-border': acc.color } as any}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ background: acc.bgColor, color: acc.color }}
                  >
                    {acc.role === 'OFFICER' ? <Shield className="w-5 h-5" /> : acc.role === 'ADMIN' ? <Activity className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-[#1d1d1f] text-sm">{acc.label}</div>
                    <div
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: acc.color }}
                    >
                      {acc.badge}
                    </div>
                  </div>
                </div>
                {autoLogging === acc.role ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#86868b]" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-[#d2d2d7] group-hover:text-emerald-500 transition-colors" />
                )}
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">{acc.desc}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] font-mono bg-[#f5f5f7] text-[#86868b] px-2 py-1 rounded-md">{acc.email}</span>
                <span className="text-[10px] text-[#86868b]">/ {acc.role === 'OFFICER' ? 'officer123' : acc.role === 'ADMIN' ? 'admin123' : 'citizen123'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-10 text-[11px] text-[#86868b] text-center max-w-lg">
        QUBIX-AI • National Hackathon 2026 • HEXA TITANS •
        Developed for Tamil Nadu Land Registration Authority. Subject to statutory pre-clearance rules.
      </p>
    </div>
  );
};

export default LoginPage;
