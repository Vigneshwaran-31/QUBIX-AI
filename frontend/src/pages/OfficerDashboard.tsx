import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { ApplicationSummary, DashboardStats } from '../types';
import { 
  FolderSearch, ShieldCheck, AlertTriangle, Gavel, 
  Gauge, RefreshCw, PlusCircle, Search, FileText, 
  MapPin, CheckCircle, Clock 
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sData, aData] = await Promise.all([
        applicationService.getDashboardStats(),
        applicationService.getApplications(statusFilter, search, district)
      ]);
      setStats(sData);
      setApplications(aData);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, district]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleRunDemo = async (caseType: 'case_1' | 'case_2' | 'case_3') => {
    try {
      setDemoLoading(true);
      const app = await applicationService.seedDemoCase(caseType);
      navigate(`/cases/${app.id}`);
    } catch (err) {
      console.error('Failed to seed demo', err);
      alert('Error launching demo scenario.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans pb-24 text-[#1d1d1f]">
      {/* Header Area */}
      <div className="bg-white border-b border-[#d2d2d7] px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#f5f5f7] text-[#1d1d1f] font-semibold text-[10px] px-2 py-1 rounded-md tracking-widest uppercase">
                Zone: Madurai / Chengalpattu
              </span>
              <span className="text-[#86868b] font-medium text-xs uppercase tracking-wider">
                Ref: SRO-TN-3382
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
              Pre-Verification Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-[#f5f5f7] rounded-full border border-[#d2d2d7]/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Engine Live</span>
             </div>
             <Link
                to="/new-case"
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Case</span>
              </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* Statistical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div onClick={() => setStatusFilter('ALL')} className="bg-white p-6 rounded-3xl border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] cursor-pointer hover:border-[#0071e3] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-[#86868b] font-bold">Total Cases</span>
              <div className="p-2 bg-[#f5f5f7] rounded-xl group-hover:bg-[#0071e3]/10 transition-colors">
                <FolderSearch className="w-5 h-5 text-[#86868b] group-hover:text-[#0071e3]" />
              </div>
            </div>
            <div className="text-4xl font-bold tracking-tight">{stats?.total_applications ?? 14}</div>
            <div className="mt-2 text-xs text-[#86868b] font-medium">+14 today</div>
          </div>

          <div onClick={() => setStatusFilter('VERIFIED')} className="bg-white p-6 rounded-3xl border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] cursor-pointer hover:border-emerald-500 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-[#86868b] font-bold">Clear Title</span>
              <div className="p-2 bg-[#f5f5f7] rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                <ShieldCheck className="w-5 h-5 text-[#86868b] group-hover:text-emerald-500" />
              </div>
            </div>
            <div className="text-4xl font-bold tracking-tight text-emerald-600">{stats?.verified ?? 6}</div>
            <div className="mt-2 text-xs text-[#86868b] font-medium">Fully Verified</div>
          </div>

          <div onClick={() => setStatusFilter('NEEDS_CORRECTION')} className="bg-white p-6 rounded-3xl border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] cursor-pointer hover:border-amber-500 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-[#86868b] font-bold">Discrepancy</span>
              <div className="p-2 bg-[#f5f5f7] rounded-xl group-hover:bg-amber-500/10 transition-colors">
                <AlertTriangle className="w-5 h-5 text-[#86868b] group-hover:text-amber-500" />
              </div>
            </div>
            <div className="text-4xl font-bold tracking-tight text-amber-600">{stats?.needs_correction ?? 3}</div>
            <div className="mt-2 text-xs text-[#86868b] font-medium">Requires Review</div>
          </div>

          <div onClick={() => setStatusFilter('ESCALATED')} className="bg-white p-6 rounded-3xl border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] cursor-pointer hover:border-red-500 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-[#86868b] font-bold">Critical Fraud</span>
              <div className="p-2 bg-[#f5f5f7] rounded-xl group-hover:bg-red-500/10 transition-colors">
                <Gavel className="w-5 h-5 text-[#86868b] group-hover:text-red-500" />
              </div>
            </div>
            <div className="text-4xl font-bold tracking-tight text-red-600">{stats?.critical_risk ?? 4}</div>
            <div className="mt-2 text-xs text-[#86868b] font-medium">Sec 22-A Risk</div>
          </div>

          <div className="bg-[#1d1d1f] text-white p-6 rounded-3xl shadow-lg border border-[#1d1d1f]">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-[#86868b] font-bold">Avg AI Speed</span>
              <div className="p-2 bg-white/10 rounded-xl">
                <Gauge className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold tracking-tight">18.4s</div>
            <div className="mt-2 text-xs text-[#86868b] font-medium">per dossier</div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-3xl border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-6 border-b border-[#d2d2d7] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
             <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
                {[
                  { label: 'All Cases', val: 'ALL' },
                  { label: 'Pending', val: 'SUBMITTED' },
                  { label: 'Verified', val: 'VERIFIED' },
                  { label: 'Discrepancy', val: 'NEEDS_CORRECTION' },
                  { label: 'Fraud', val: 'ESCALATED' }
                ].map((tab) => (
                  <button
                    key={tab.val}
                    onClick={() => setStatusFilter(tab.val)}
                    className={`px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-full transition-all ${
                      statusFilter === tab.val
                        ? 'bg-[#1d1d1f] text-white shadow-sm'
                        : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-3">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search ID or Applicant..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white text-sm rounded-full w-48 sm:w-64 outline-none transition-all"
                    />
                  </div>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="py-2 px-4 bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white text-sm font-medium rounded-full outline-none transition-all"
                  >
                    <option value="ALL">All Districts</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Chengalpattu">Chengalpattu</option>
                    <option value="Kancheepuram">Kancheepuram</option>
                  </select>
                </form>
                <button
                  onClick={fetchData}
                  className="p-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-full transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
             </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f5f5f7]/50 text-[#86868b] text-[10px] uppercase font-bold tracking-widest border-b border-[#d2d2d7]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Case ID</th>
                  <th className="px-6 py-4 font-semibold">Applicant</th>
                  <th className="px-6 py-4 font-semibold">Survey No.</th>
                  <th className="px-6 py-4 font-semibold">Risk Score</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {applications.length > 0 ? (
                  applications.map((app) => {
                    const isCritical = app.risk_level === 'CRITICAL' || app.risk_score > 70;
                    const isMedium = app.risk_level === 'HIGH' || app.risk_score > 30;

                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-[#f5f5f7]/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <Link to={`/cases/${app.id}`} className="font-mono font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors block">
                            {app.application_number}
                          </Link>
                          <span className="text-[11px] text-[#86868b] flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <strong className="text-[#1d1d1f] text-sm font-semibold block">{app.applicant_name}</strong>
                          <span className="text-[11px] text-[#86868b] flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {app.district}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-mono font-medium text-[#1d1d1f] text-xs bg-[#f5f5f7] px-2 py-1 rounded-md border border-[#d2d2d7]/50">
                            {app.primary_survey_no}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <span
                                className={`text-sm font-bold tabular-nums ${
                                  isCritical ? 'text-red-600' : isMedium ? 'text-amber-600' : 'text-emerald-600'
                                }`}
                              >
                                {app.risk_score.toFixed(0)} <span className="text-[#86868b] text-xs">/ 100</span>
                              </span>
                              <div className="w-full bg-[#f5f5f7] rounded-full h-1.5 overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                    style={{ width: `${app.risk_score}%` }}>
                                 </div>
                              </div>
                           </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              app.status === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : app.status === 'ESCALATED'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : app.status === 'NEEDS_CORRECTION'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#d2d2d7]'
                            }`}
                          >
                            {app.status === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
                            {app.status === 'ESCALATED' && <Gavel className="w-3 h-3" />}
                            {app.status === 'NEEDS_CORRECTION' && <AlertTriangle className="w-3 h-3" />}
                            {app.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                             <Link
                               to={`/cases/${app.id}`}
                               className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold rounded-full transition-colors"
                             >
                               Review
                             </Link>
                             <a
                               href={applicationService.getReportPdfUrl(app.id)}
                               target="_blank"
                               rel="noreferrer"
                               className="p-2 bg-[#f5f5f7] hover:bg-[#0071e3] hover:text-white text-[#1d1d1f] rounded-full transition-colors"
                               title="Download PDF"
                             >
                               <FileText className="w-4 h-4" />
                             </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[#86868b]">
                      <div className="flex flex-col items-center gap-3">
                         <FolderSearch className="w-8 h-8 opacity-20" />
                         {loading ? 'Consulting verification ledger...' : 'No cases match your filters.'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
