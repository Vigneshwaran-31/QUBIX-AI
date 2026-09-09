import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { Shield, ChevronDown, User, FlaskConical, LogOut, Settings, Users } from 'lucide-react';
import qubixLogo from '../../assets/QUBIX logo.png';

export const Navbar: React.FC = () => {
  const { user, role, logout, setRoleOverride } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSeedDemo = async (caseType: 'case_1' | 'case_2' | 'case_3') => {
    try {
      setDemoLoading(true);
      const app = await applicationService.seedDemoCase(caseType);
      navigate(`/cases/${app.id}`);
    } catch (err) {
      alert('Failed to load demo case.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileOpen(false);
  };

  const ROLE_COLOR: Record<string, string> = {
    OFFICER: '#0071e3',
    ADMIN: '#1d1d1f',
    CITIZEN: '#34c759',
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 font-sans">
      {/* Top Gov Ribbon */}
      <div className="bg-[#f5f5f7] text-[#1d1d1f] py-1.5 px-6 flex items-center justify-between border-b border-[#d2d2d7] text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#86868b]" />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#86868b]">
            GOVT OF TAMIL NADU • AI PRE-VERIFICATION PLATFORM
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-[#1d1d1f] tracking-widest uppercase font-semibold">Engine Online</span>
          </div>
          <span className="text-[#d2d2d7]">|</span>
          <span className="text-[10px] text-[#86868b] uppercase font-semibold tracking-widest">TNREGINET v4.8</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#d2d2d7]">
        <div className="h-[72px] w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <img
                src={qubixLogo}
                alt="QUBIX AI"
                className="h-10 w-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">QUBIX-AI</span>
                  <span className="bg-[#0071e3]/10 text-[#0071e3] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    TN Portal
                  </span>
                </div>
                <span className="text-[11px] text-[#86868b] font-medium tracking-wide">Land Records Intelligence</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Demo — Officers/Admin only */}
            {role !== 'CITIZEN' && (
              <div className="hidden lg:flex items-center gap-2 bg-[#f5f5f7] p-1 rounded-full border border-[#d2d2d7]/50">
                <div className="flex items-center gap-1.5 px-3 text-[#86868b]">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Demo</span>
                </div>
                <div className="h-4 w-px bg-[#d2d2d7]"></div>
                <button onClick={() => handleSeedDemo('case_1')} disabled={demoLoading} className="px-4 py-1.5 hover:bg-white text-[#1d1d1f] text-xs font-semibold rounded-full transition-all hover:shadow-sm">Clear Title</button>
                <button onClick={() => handleSeedDemo('case_2')} disabled={demoLoading} className="px-4 py-1.5 hover:bg-amber-50 hover:text-amber-700 text-[#1d1d1f] text-xs font-semibold rounded-full transition-all hover:shadow-sm">Survey Conflict</button>
                <button onClick={() => handleSeedDemo('case_3')} disabled={demoLoading} className="px-4 py-1.5 hover:bg-red-50 hover:text-red-700 text-[#1d1d1f] text-xs font-semibold rounded-full transition-all hover:shadow-sm mr-0.5">Critical Fraud</button>
              </div>
            )}

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 pl-4 border-l border-[#d2d2d7] cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex flex-col text-right hidden md:block">
                  <span className="text-sm text-[#1d1d1f] font-semibold tracking-tight block">
                    {user?.full_name?.split('(')[0]?.trim() || 'User'}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: ROLE_COLOR[role || 'OFFICER'] }}>
                    {role}
                  </span>
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                  style={{ background: ROLE_COLOR[role || 'OFFICER'] }}
                >
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 text-[#86868b] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-[#d2d2d7]/50 overflow-hidden z-50">
                  {/* User info */}
                  <div className="p-5 border-b border-[#f5f5f7]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: ROLE_COLOR[role || 'OFFICER'] }}>
                        {user?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-[#1d1d1f] text-sm">{user?.full_name || 'User'}</div>
                        <div className="text-[11px] text-[#86868b]">{user?.email}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: ROLE_COLOR[role || 'OFFICER'] }}>{role}</div>
                      </div>
                    </div>
                  </div>

                  {/* Role Switch */}
                  <div className="p-3 border-b border-[#f5f5f7]">
                    <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-2 px-2">Switch Role</div>
                    {(['OFFICER', 'ADMIN', 'CITIZEN'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => { setRoleOverride(r); setProfileOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left ${role === r ? 'bg-[#f5f5f7] text-[#1d1d1f]' : 'text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'}`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: role === r ? ROLE_COLOR[r] : '#d2d2d7' }}></div>
                        {r === 'OFFICER' ? 'Sub-Registrar Officer' : r === 'ADMIN' ? 'System Admin' : 'Citizen / Applicant'}
                      </button>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="p-3">
                    {role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] transition-colors">
                        <Settings className="w-4 h-4" /> Engine Configuration
                      </Link>
                    )}
                    <Link to="/portal" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] transition-colors">
                      <Users className="w-4 h-4" /> Citizen Portal
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
