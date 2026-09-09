import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/applicationService';
import { ApplicationSummary } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, SearchCheck, FileText, ArrowRight, MapPin, Clock } from 'lucide-react';

export const CitizenPortalPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitizenData = async () => {
      try {
        setLoading(true);
        const data = await applicationService.getApplications();
        setApplications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCitizenData();
  }, []);

  const filtered = applications.filter(a =>
    a.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.primary_survey_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] pb-24">
      {/* Top Header */}
      <div className="bg-white px-8 py-8 border-b border-[#d2d2d7]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#0071e3]/10 text-[#0071e3] px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                Public Portal
              </span>
              <span className="text-[#86868b] text-[10px] font-bold uppercase tracking-widest">
                Land Document Transparency
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
              Citizen Pre-Verification Tracker
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/new-case"
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              New Application
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Banner Notice */}
        <div className="bg-[#1d1d1f] rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="w-16 h-16 bg-[#0071e3] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative z-10">
            <SearchCheck className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white tracking-tight mb-2">
              Transparent Automated Inspection
            </h2>
            <p className="text-sm text-[#86868b] leading-relaxed max-w-2xl">
              Verify registration compliance, inspect cross-document survey concordance, and track statutory rulings in real time securely under Indian Registration Act Sec 34.
            </p>
          </div>
        </div>

        {/* Tracking Search Box */}
        <div className="bg-white rounded-full shadow-sm border border-[#d2d2d7]/50 p-2 flex items-center">
          <div className="pl-4 pr-2 text-[#86868b]">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search Application (e.g. TN-2025-SPB), Applicant, or Survey No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-transparent focus:ring-0 focus:outline-none text-sm py-3 px-2 text-[#1d1d1f] placeholder:text-[#86868b]"
          />
        </div>

        {/* Application List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#86868b] px-4">
            <span>Submitted Dossiers ({filtered.length})</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#86868b] font-medium flex flex-col items-center gap-4">
              <span className="w-8 h-8 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin"></span>
              Loading registry items...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-[#86868b] border border-[#d2d2d7]/50 font-medium">
              No matching records found. Try adjusting your search query.
            </div>
          ) : (
            filtered.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:border-[#0071e3]/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-lg text-[#1d1d1f]">
                      {app.application_number}
                    </span>
                    <StatusBadge status={app.status} />
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                      app.risk_score >= 60 ? 'bg-red-50 text-red-700 border border-red-200' : app.risk_score >= 25 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      Score: {app.risk_score.toFixed(0)} / 100
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#86868b]">
                    <span className="flex items-center gap-1.5"><strong className="text-[#1d1d1f] font-semibold">{app.applicant_name}</strong></span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <strong className="text-[#1d1d1f] font-semibold">{app.district}</strong></span>
                    <span className="flex items-center gap-1.5">Survey: <strong className="text-[#0071e3] font-mono">{app.primary_survey_no}</strong></span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[11px] text-[#86868b] uppercase tracking-widest font-semibold mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(app.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{app.documents_count} Mandated Docs</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={applicationService.getReportPdfUrl(app.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-full transition-colors group flex items-center justify-center"
                    title="Download Official PDF"
                  >
                    <FileText className="w-5 h-5 text-[#86868b] group-hover:text-[#0071e3]" />
                  </a>

                  <Link
                    to={`/cases/${app.id}`}
                    className="bg-[#f5f5f7] hover:bg-[#1d1d1f] text-[#1d1d1f] hover:text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 transition-all"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenPortalPage;
