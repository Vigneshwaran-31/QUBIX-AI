import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/applicationService';
import { ApplicationSummary } from '../types';
import { Library, Search, RefreshCw, MapPin, Hash, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PattaRepositoryPage: React.FC = () => {
  const [cases, setCases] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getApplications('ALL', search, districtFilter);
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [districtFilter]);

  const districts = ['ALL', 'Madurai', 'Chengalpattu', 'Kancheepuram', 'Chennai', 'Coimbatore'];

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] pb-24">
      <div className="bg-white px-8 py-8 border-b border-[#d2d2d7]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">Revenue Dept</span>
              <span className="text-[#86868b] text-[10px] font-bold uppercase tracking-widest">TN Land Records</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Patta & Land Record Repository</h1>
          </div>
          <button onClick={fetchData} className="p-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#d2d2d7]/50 flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={e => { e.preventDefault(); fetchData(); }} className="flex items-center gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Survey No., Applicant, Patta No..."
                className="pl-9 pr-4 py-2.5 bg-[#f5f5f7] rounded-full text-sm outline-none w-full focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
              />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold rounded-full transition-colors">
              Search
            </button>
          </form>
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="py-2.5 px-4 bg-[#f5f5f7] rounded-full text-sm font-medium outline-none border-transparent"
          >
            {districts.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : d}</option>)}
          </select>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Records', value: cases.length },
            { label: 'Verified', value: cases.filter(c => c.status === 'VERIFIED').length },
            { label: 'Pending', value: cases.filter(c => c.status === 'SUBMITTED').length },
            { label: 'Flagged', value: cases.filter(c => c.status === 'ESCALATED' || c.risk_score > 60).length },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="text-3xl font-bold text-[#1d1d1f]">{s.value}</div>
              <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/50 animate-pulse">
                <div className="h-4 bg-[#f5f5f7] rounded-full w-1/2 mb-4"></div>
                <div className="h-3 bg-[#f5f5f7] rounded-full w-3/4 mb-2"></div>
                <div className="h-3 bg-[#f5f5f7] rounded-full w-1/2"></div>
              </div>
            ))
          ) : cases.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl p-12 text-center text-[#86868b] border border-[#d2d2d7]/50">
              No records found matching your search.
            </div>
          ) : (
            cases.map(c => (
              <div key={c.id} className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:border-[#0071e3]/30 transition-colors flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono font-bold text-[#0071e3] text-sm">{c.application_number}</div>
                    <div className="font-bold text-[#1d1d1f] text-lg mt-1">{c.applicant_name}</div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                    c.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    c.status === 'ESCALATED' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-[#f5f5f7] text-[#86868b] border-[#d2d2d7]/50'
                  }`}>{c.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f5f5f7] rounded-xl p-3">
                    <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Survey No.</div>
                    <div className="font-mono font-bold text-[#1d1d1f] text-sm">{c.primary_survey_no}</div>
                  </div>
                  <div className="bg-[#f5f5f7] rounded-xl p-3">
                    <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> District</div>
                    <div className="font-semibold text-[#1d1d1f] text-sm">{c.district}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f5f5f7]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#86868b]" />
                    <span className="text-xs text-[#86868b] font-medium">{c.documents_count} / 4 Docs</span>
                    <span className={`text-xs font-bold ${c.risk_score >= 60 ? 'text-red-600' : c.risk_score >= 25 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      Risk: {c.risk_score.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={applicationService.getReportPdfUrl(c.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full transition-colors"
                      title="Download PDF"
                    >
                      <FileText className="w-4 h-4 text-[#86868b]" />
                    </a>
                    <Link
                      to={`/cases/${c.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#f5f5f7] hover:bg-[#1d1d1f] text-[#1d1d1f] hover:text-white text-xs font-semibold rounded-full transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PattaRepositoryPage;
