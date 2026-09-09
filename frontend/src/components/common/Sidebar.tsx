import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';

import {
  LayoutDashboard, FolderCheck, FilePlus, Users,
  History, Library, MapPin, Settings2, LogOut,
  Activity, ShieldCheck, AlertTriangle, Loader2,
  RefreshCw, TrendingUp, Clock
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [liveStats, setLiveStats] = useState<{ total: number; verified: number; critical: number; pending: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch live stats for sidebar widget
  const fetchLiveStats = async () => {
    try {
      const s = await applicationService.getDashboardStats();
      setLiveStats({
        total: s.total_applications,
        verified: s.verified,
        critical: s.critical_risk,
        pending: s.pending_verification,
      });
    } catch {}
    finally { setStatsLoading(false); }
  };

  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based navigation
  const officerNav = [
    {
      title: 'Operational',
      items: [
        { label: 'Officer Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'All Cases', path: '/cases', icon: FolderCheck },
        { label: 'New Case Entry', path: '/new-case', icon: FilePlus },
      ]
    },
    {
      title: 'Compliance & Audit',
      items: [
        { label: 'Audit Ledger', path: '/audit', icon: History },
        { label: 'Patta Repository', path: '/repository', icon: Library },
      ]
    },
  ];

  const adminNav = [
    {
      title: 'Administration',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Risk Engine Config', path: '/admin', icon: Settings2 },
        { label: 'All Cases', path: '/cases', icon: FolderCheck },
        { label: 'Audit Ledger', path: '/audit', icon: History },
        { label: 'Patta Repository', path: '/repository', icon: Library },
        { label: 'Citizen Portal', path: '/portal', icon: Users },
      ]
    },
  ];

  const citizenNav = [
    {
      title: 'My Applications',
      items: [
        { label: 'Application Status', path: '/portal', icon: FolderCheck },
        { label: 'Submit Application', path: '/new-case', icon: FilePlus },
      ]
    },
  ];

  const navSections = role === 'ADMIN' ? adminNav : role === 'CITIZEN' ? citizenNav : officerNav;

  return (
    <aside className="fixed left-0 top-[102px] h-[calc(100vh-102px)] w-64 bg-[#f5f5f7] border-r border-[#d2d2d7] flex flex-col z-40 font-sans">
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] text-[#86868b] uppercase tracking-widest font-bold mb-2">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path)) ||
                (item.path === '/cases' && location.pathname.startsWith('/cases/'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all rounded-xl font-medium ${
                    isActive
                      ? 'bg-[#0071e3] text-white shadow-sm'
                      : 'text-[#1d1d1f] hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#86868b]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Real-time Stats Widget */}
      <div className="px-4 pb-2">
        <div className="bg-white rounded-2xl p-4 border border-[#d2d2d7]/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest flex items-center gap-1">
              <Activity className="w-3 h-3" /> Live Stats
            </span>
            <button onClick={fetchLiveStats} className="text-[#86868b] hover:text-[#0071e3] transition-colors">
              <RefreshCw className={`w-3 h-3 ${statsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {statsLoading ? (
            <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-[#86868b]" /></div>
          ) : liveStats ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#f5f5f7] rounded-xl p-2.5 text-center">
                <div className="text-xl font-bold text-[#1d1d1f]">{liveStats.total}</div>
                <div className="text-[9px] font-bold text-[#86868b] uppercase tracking-wide flex items-center justify-center gap-1 mt-0.5"><TrendingUp className="w-2.5 h-2.5" /> Total</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
                <div className="text-xl font-bold text-emerald-600">{liveStats.verified}</div>
                <div className="text-[9px] font-bold text-emerald-600/80 uppercase tracking-wide flex items-center justify-center gap-1 mt-0.5"><ShieldCheck className="w-2.5 h-2.5" /> Verified</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-2.5 text-center border border-amber-100">
                <div className="text-xl font-bold text-amber-600">{liveStats.pending}</div>
                <div className="text-[9px] font-bold text-amber-600/80 uppercase tracking-wide flex items-center justify-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" /> Pending</div>
              </div>
              <div className="bg-red-50 rounded-xl p-2.5 text-center border border-red-100">
                <div className="text-xl font-bold text-red-600">{liveStats.critical}</div>
                <div className="text-[9px] font-bold text-red-600/80 uppercase tracking-wide flex items-center justify-center gap-1 mt-0.5"><AlertTriangle className="w-2.5 h-2.5" /> Critical</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* User & Logout Footer */}
      <div className="p-4">
        <div className="bg-white rounded-2xl p-3 border border-[#d2d2d7]/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
              role === 'ADMIN' ? 'bg-[#1d1d1f]' : role === 'CITIZEN' ? 'bg-emerald-500' : 'bg-[#0071e3]'
            }`}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1d1d1f] truncate">{user?.full_name?.split(' ')[0] || 'User'}</div>
              <div className="text-[10px] text-[#86868b] uppercase tracking-wider font-bold">{role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 hover:text-red-600 text-[#86868b] rounded-xl transition-colors flex-shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
