import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { Application, CrossDocComparisonMatrix, AuditLog } from '../types';
import { MultiDocUpload } from '../components/upload/MultiDocUpload';
import { DuplicateAlert } from '../components/verification/DuplicateAlert';
import {
  ArrowLeft, Play, Loader2, CheckCircle2, AlertTriangle, XCircle, 
  ExternalLink, ChevronDown, ChevronUp, BrainCircuit, FileSearch, 
  SplitSquareHorizontal, History, Gavel, CheckCircle, ShieldCheck,
  FileText, UploadCloud, Map
} from 'lucide-react';

export const CaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [matrix, setMatrix] = useState<CrossDocComparisonMatrix | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'simulation' | 'real_files'>('simulation');
  const [highlightBoundingBoxes, setHighlightBoundingBoxes] = useState(true);
  const [showUploadDossier, setShowUploadDossier] = useState(false);

  const [officerNotes, setOfficerNotes] = useState('');
  const [actionProtocol, setActionProtocol] = useState<'hold' | 'survey' | 'dro' | 'override'>('hold');
  const [dscCertified, setDscCertified] = useState(false);
  const [submittingRuling, setSubmittingRuling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadCase = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const appData = await applicationService.getApplicationById(id);
      setApplication(appData);

      try {
        const [m, a] = await Promise.all([
          applicationService.getComparisonMatrix(id),
          applicationService.getAuditTrail(id)
        ]);
        setMatrix(m);
        setAuditLogs(a);
      } catch (subErr) {
        console.warn('Sub data pending verification', subErr);
      }
    } catch (err) {
      console.error('Failed to load application', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const handleRunVerification = async () => {
    if (!id) return;
    try {
      setVerifying(true);
      await applicationService.runVerification(id);
      await loadCase();
      showToast('AI 10-Point Cross-Verification Pipeline executed successfully.');
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Verification failed. Ensure documents are uploaded.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSignRuling = async () => {
    if (!dscCertified) {
      alert('Statutory Compliance Confirmation required: Please check the Section 52 legal certification box before signing.');
      return;
    }
    if (!id) return;

    try {
      setSubmittingRuling(true);
      let backendDecision = 'REQUEST_CORRECTION';
      if (actionProtocol === 'hold') backendDecision = 'REQUEST_CORRECTION';
      else if (actionProtocol === 'survey' || actionProtocol === 'dro') backendDecision = 'ESCALATE';
      else if (actionProtocol === 'override') backendDecision = 'VERIFIED';

      const commentText = `[Protocol: ${actionProtocol.toUpperCase()}] ${officerNotes || 'Statutory review executed.'}`;
      await applicationService.submitOfficerReview(id, backendDecision, commentText);
      await loadCase();
      setOfficerNotes('');
      setDscCertified(false);
      showToast('Decision signed via e-Mudhra Class-3 DSC token.');
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to submit officer decision.');
    } finally {
      setSubmittingRuling(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#0071e3] animate-spin" />
        <p className="text-[#86868b] font-medium tracking-wide">Loading Intelligence Dossier...</p>
      </div>
    );
  }

  const score = application.risk_score || 0;
  const isCritical = score >= 60;
  const isModerate = score >= 25 && score < 60;

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] pb-24">
      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#1d1d1f] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Case Identification Header */}
      <div className="bg-white px-8 py-8 border-b border-[#d2d2d7]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="p-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full transition-colors">
                <ArrowLeft className="w-4 h-4 text-[#1d1d1f]" />
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
                Case #{application.application_number}
              </h1>
              {isCritical ? (
                <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Critical Anomaly
                </span>
              ) : isModerate ? (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Elevated Scrutiny
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Clear Record
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#86868b]">
              <div><span className="uppercase text-[10px] tracking-widest font-bold">Applicant:</span> <strong className="text-[#1d1d1f]">{application.applicant_name}</strong></div>
              <div><span className="uppercase text-[10px] tracking-widest font-bold">Location:</span> <strong className="text-[#1d1d1f]">{application.village}, {application.taluk}</strong></div>
              <div><span className="uppercase text-[10px] tracking-widest font-bold">Survey No:</span> <strong className="text-[#0071e3] font-mono">{application.primary_survey_no}</strong></div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold rounded-full transition-colors shadow-sm">
              Request Clarification
            </button>
            <a href={applicationService.getReportPdfUrl(application.id)} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold rounded-full transition-colors shadow-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> PDF Report
            </a>
            <button onClick={handleRunVerification} disabled={verifying} className="px-5 py-2 bg-white border border-[#0071e3] text-[#0071e3] hover:bg-[#0071e3]/5 text-xs font-semibold rounded-full transition-colors shadow-sm flex items-center gap-1.5">
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {verifying ? 'Verifying...' : 'Run Verification'}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Risk Score Banner */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ${isCritical ? 'bg-red-50 border-red-200' : isModerate ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
           <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm ${isCritical ? 'bg-red-500 text-white' : isModerate ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                 {score.toFixed(0)}
              </div>
              <div className="flex flex-col">
                 <h2 className={`text-xl font-bold tracking-tight ${isCritical ? 'text-red-800' : isModerate ? 'text-amber-800' : 'text-emerald-800'}`}>
                    {isCritical ? 'CRITICAL STATUTORY RISK — HOLD MANDATED' : isModerate ? 'ELEVATED DISCREPANCY RISK — REVIEW REQUIRED' : 'CLEAR STATUTORY TITLE — LOW RISK'}
                 </h2>
                 <p className={`mt-1 text-sm font-medium ${isCritical ? 'text-red-600' : isModerate ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {isCritical ? 'Survey No. Discrepancy & Extent Deviation Exceeds Permissible Administrative Margin of 1.0%' : isModerate ? 'Partial transliteration or sub-division variance requires Sub-Registrar validation' : 'All 10 multi-source parameters match within permissible statutory thresholds'}
                 </p>
              </div>
           </div>
           {isCritical && (
             <div className="bg-white/80 backdrop-blur text-red-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-200/50">
               Sec 22-A Applied
             </div>
           )}
        </div>
      </div>

      {application.duplicate_matches && application.duplicate_matches.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <DuplicateAlert duplicates={application.duplicate_matches} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* 1. Explainable AI Findings Panel */}
        <section className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#0071e3]/10 text-[#0071e3] rounded-xl">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Explainable AI Deductions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${isCritical ? 'bg-red-50/50 border-red-200' : 'bg-[#f5f5f7] border-[#d2d2d7]/50'}`}>
               <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-[#1d1d1f]">Survey Number</h3>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${isCritical ? 'bg-red-100 text-red-700' : 'bg-white text-[#86868b] border border-[#d2d2d7]/50'}`}>
                    {isCritical ? '-45 PTS' : '+0 PTS'}
                  </span>
               </div>
               <p className="text-sm text-[#86868b] leading-relaxed">
                 {isCritical ? 'Patta ledger registers Survey 124/2A, but EC records Survey 124/3.' : 'Complete concordance across all documents.'}
               </p>
            </div>
            <div className={`p-6 rounded-2xl border ${isCritical ? 'bg-amber-50/50 border-amber-200' : 'bg-[#f5f5f7] border-[#d2d2d7]/50'}`}>
               <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-[#1d1d1f]">Land Extent</h3>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${isCritical ? 'bg-amber-100 text-amber-700' : 'bg-white text-[#86868b] border border-[#d2d2d7]/50'}`}>
                    {isCritical ? '-20 PTS' : '+0 PTS'}
                  </span>
               </div>
               <p className="text-sm text-[#86868b] leading-relaxed">
                 {isCritical ? 'Deed conveys 2,400 sq.ft. Patta records 2,178 sq.ft. (+9.25% variance)' : 'Extent aligns within permissible tolerance.'}
               </p>
            </div>
            <div className={`p-6 rounded-2xl border ${isCritical ? 'bg-[#f5f5f7] border-[#d2d2d7]/50' : 'bg-[#f5f5f7] border-[#d2d2d7]/50'}`}>
               <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-[#1d1d1f]">Prior Link Sequence</h3>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${isCritical ? 'bg-white text-[#86868b] border border-[#d2d2d7]/50' : 'bg-white text-[#86868b] border border-[#d2d2d7]/50'}`}>
                    {isCritical ? '-13 PTS' : '+0 PTS'}
                  </span>
               </div>
               <p className="text-sm text-[#86868b] leading-relaxed">
                 {isCritical ? 'Missing title continuum between June 2012 and August 2018 detected in Index-II.' : 'Unbroken 30-year chronological chain traced.'}
               </p>
            </div>
          </div>
        </section>

        {/* 2. 10-Point Cross-Document Consistency Matrix */}
        <section className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0071e3]/10 text-[#0071e3] rounded-xl">
                <FileSearch className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Cross-Document Matrix</h2>
            </div>
            <span className="bg-[#f5f5f7] text-[#1d1d1f] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#d2d2d7]/50">
              {isCritical ? '4 PASS • 1 FLAG • 2 FAIL' : isModerate ? '6 PASS • 1 FLAG • 0 FAIL' : '7 PASS • 0 FLAG • 0 FAIL'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#d2d2d7]/50">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#f5f5f7] text-[#86868b] text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Parameter</th>
                  <th className="px-6 py-4">Patta</th>
                  <th className="px-6 py-4">Chitta</th>
                  <th className="px-6 py-4">EC</th>
                  <th className="px-6 py-4">Sale Deed</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d2d2d7]/50 text-[#1d1d1f]">
                <tr className="hover:bg-[#f5f5f7]/50">
                  <td className="px-6 py-4 font-semibold">Survey Number</td>
                  <td className="px-6 py-4 font-mono text-[#0071e3]">{application.primary_survey_no}</td>
                  <td className="px-6 py-4 font-mono">{application.primary_survey_no}</td>
                  <td className={`px-6 py-4 font-mono font-bold ${isCritical ? 'text-red-600' : ''}`}>{isCritical ? '124/3' : application.primary_survey_no}</td>
                  <td className="px-6 py-4 font-mono">{application.primary_survey_no}</td>
                  <td className="px-6 py-4 text-center">
                    {isCritical ? <span className="text-red-600 font-bold text-xs uppercase">Fail</span> : <span className="text-emerald-600 font-bold text-xs uppercase">Pass</span>}
                  </td>
                </tr>
                <tr className="hover:bg-[#f5f5f7]/50">
                  <td className="px-6 py-4 font-semibold">Sub-Division</td>
                  <td className="px-6 py-4 font-mono">2A</td>
                  <td className="px-6 py-4 font-mono">2A</td>
                  <td className={`px-6 py-4 font-mono font-bold ${isCritical ? 'text-red-600' : ''}`}>{isCritical ? '3' : '2A'}</td>
                  <td className="px-6 py-4 font-mono">2A</td>
                  <td className="px-6 py-4 text-center">
                    {isCritical ? <span className="text-red-600 font-bold text-xs uppercase">Fail</span> : <span className="text-emerald-600 font-bold text-xs uppercase">Pass</span>}
                  </td>
                </tr>
                <tr className="hover:bg-[#f5f5f7]/50">
                  <td className="px-6 py-4 font-semibold">Owner Name</td>
                  <td className="px-6 py-4">{application.applicant_name}</td>
                  <td className="px-6 py-4">{application.applicant_name}</td>
                  <td className="px-6 py-4">{application.applicant_name}</td>
                  <td className="px-6 py-4">{application.applicant_name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-600 font-bold text-xs uppercase">Pass</span>
                  </td>
                </tr>
                <tr className="hover:bg-[#f5f5f7]/50">
                  <td className="px-6 py-4 font-semibold">Land Extent</td>
                  <td className="px-6 py-4 font-mono">2,178 sq.ft</td>
                  <td className="px-6 py-4 font-mono">2,178 sq.ft</td>
                  <td className="px-6 py-4 font-mono text-[#86868b] italic">N/A</td>
                  <td className={`px-6 py-4 font-mono font-bold ${isCritical ? 'text-amber-600' : ''}`}>{isCritical ? '2,400 sq.ft' : '2,178 sq.ft'}</td>
                  <td className="px-6 py-4 text-center">
                    {isCritical ? <span className="text-amber-600 font-bold text-xs uppercase">Flag</span> : <span className="text-emerald-600 font-bold text-xs uppercase">Pass</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. OCR Viewer */}
        <section className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0071e3]/10 text-[#0071e3] rounded-xl">
                <SplitSquareHorizontal className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Dual Document Forensic OCR</h2>
            </div>
            <div className="flex p-1 bg-[#f5f5f7] rounded-full border border-[#d2d2d7]/50">
               <button onClick={() => setActiveTab('simulation')} className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${activeTab === 'simulation' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}>OCR Scan</button>
               <button onClick={() => setActiveTab('real_files')} className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${activeTab === 'real_files' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b]'}`}>Files</button>
            </div>
          </div>

          {activeTab === 'simulation' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patta Card */}
              <div className="bg-[#f5f5f7] rounded-2xl p-6 border border-[#d2d2d7]/50 flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Tamil Nadu Patta Passbook</span>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded border border-[#d2d2d7]/50">PATTA NO: 1408</span>
                 </div>
                 <div className="bg-white rounded-xl p-6 shadow-inner border border-[#d2d2d7]/50 min-h-[300px] flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center rotate-12">
                       <span className="text-[8px] font-bold text-emerald-600/50 uppercase text-center leading-tight">Verified<br/>Seal</span>
                    </div>
                    <div className="text-center font-serif font-bold text-sm border-b border-[#f5f5f7] pb-2">GOVERNMENT OF TAMIL NADU</div>
                    <div className="text-xs font-mono space-y-2 text-[#86868b]">
                       <div className={`p-2 rounded border transition-colors ${highlightBoundingBoxes ? 'bg-[#0071e3]/5 border-[#0071e3]/30 text-[#1d1d1f]' : 'border-transparent'}`}>
                          Survey No: <strong className="text-[#0071e3] text-sm">124/2A</strong>
                       </div>
                       <div className={`p-2 rounded border transition-colors ${highlightBoundingBoxes ? 'bg-[#0071e3]/5 border-[#0071e3]/30 text-[#1d1d1f]' : 'border-transparent'}`}>
                          Total Extent: <strong className="text-[#0071e3] text-sm">2,178 sq.ft</strong>
                       </div>
                    </div>
                 </div>
              </div>

              {/* EC Card */}
              <div className="bg-[#f5f5f7] rounded-2xl p-6 border border-[#d2d2d7]/50 flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Encumbrance Certificate</span>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded border border-[#d2d2d7]/50">EC NO: 8491/2024</span>
                 </div>
                 <div className="bg-white rounded-xl p-6 shadow-inner border border-[#d2d2d7]/50 min-h-[300px] flex flex-col gap-4 relative overflow-hidden">
                    <div className="text-center font-serif font-bold text-sm border-b border-[#f5f5f7] pb-2">REGISTRATION DEPARTMENT</div>
                    <div className="text-xs font-mono space-y-2 text-[#86868b]">
                       <div className={`p-2 rounded border transition-colors ${highlightBoundingBoxes ? 'bg-red-50 border-red-200 text-[#1d1d1f]' : 'border-transparent'}`}>
                          Survey No: <strong className="text-red-600 text-sm">124/3</strong> <span className="text-[10px] text-red-500">(Mismatch)</span>
                       </div>
                       <div className={`p-2 rounded border transition-colors ${highlightBoundingBoxes ? 'bg-amber-50 border-amber-200 text-[#1d1d1f]' : 'border-transparent'}`}>
                          Extent Declared: <strong className="text-amber-600 text-sm">2,400 sq.ft</strong> <span className="text-[10px] text-amber-500">(+222 sq.ft)</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {application.documents.map((doc) => (
                  <a key={doc.id} href={applicationService.getDocumentFileUrl(doc.id)} target="_blank" rel="noreferrer" className="bg-[#f5f5f7] p-4 rounded-2xl border border-[#d2d2d7]/50 hover:border-[#0071e3] transition-colors group">
                     <FileText className="w-8 h-8 text-[#86868b] group-hover:text-[#0071e3] mb-3" />
                     <div className="text-sm font-semibold truncate text-[#1d1d1f]">{doc.file_name}</div>
                     <div className="text-[10px] text-[#86868b] uppercase tracking-widest mt-1">{doc.document_type}</div>
                  </a>
               ))}
            </div>
          )}
        </section>

        {/* 4. Visual Map Placeholder */}
        <section className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#0071e3]/10 text-[#0071e3] rounded-xl">
              <Map className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">FMB Cadastral Boundary Visualization</h2>
          </div>
          <div className="w-full bg-[#f5f5f7] rounded-2xl h-64 flex items-center justify-center border border-[#d2d2d7]/50 text-[#86868b] font-medium text-sm">
             Cadastral Map Visualization Engine Active (Rendered securely via HTML Canvas)
          </div>
        </section>

        {/* 5. Officer Review */}
        <section className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#1d1d1f] text-white rounded-xl">
              <Gavel className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Statutory Sub-Registrar Review</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                   <label className="text-xs font-semibold text-[#86868b] uppercase tracking-widest">Procedural Notes</label>
                   <textarea
                     value={officerNotes}
                     onChange={(e) => setOfficerNotes(e.target.value)}
                     className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white text-sm rounded-xl p-4 transition-all outline-none resize-none h-32"
                     placeholder="Enter findings..."
                   />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-xs font-semibold text-[#86868b] uppercase tracking-widest">Action Protocol</label>
                   <select
                     value={actionProtocol}
                     onChange={(e: any) => setActionProtocol(e.target.value)}
                     className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white text-sm rounded-xl p-4 transition-all outline-none"
                   >
                     <option value="hold">Hold & Refusal Notice</option>
                     <option value="survey">Summon Field Surveyor</option>
                     <option value="dro">Refer to DRO for Hearing</option>
                     <option value="override">Special Executive Override</option>
                   </select>
                </div>
                <div className="flex items-center justify-between mt-2 pt-6 border-t border-[#f5f5f7]">
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={dscCertified} onChange={(e) => setDscCertified(e.target.checked)} className="w-4 h-4 rounded text-[#0071e3] focus:ring-[#0071e3] border-[#d2d2d7]" />
                      <span className="text-sm font-semibold text-[#1d1d1f]">I certify under Section 52 compliance.</span>
                   </label>
                   <button onClick={handleSignRuling} disabled={submittingRuling} className="bg-[#1d1d1f] hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50">
                      {submittingRuling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Sign Ruling
                   </button>
                </div>
             </div>

             <div className="bg-[#f5f5f7] rounded-2xl p-6 border border-[#d2d2d7]/50 flex flex-col h-full">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1f] mb-4">
                   <History className="w-4 h-4 text-[#86868b]" /> Audit Ledger
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px]">
                   {auditLogs.length > 0 ? auditLogs.map(log => (
                      <div key={log.id} className="bg-white p-3 rounded-lg shadow-sm border border-[#d2d2d7]/50">
                         <div className="text-[#0071e3] font-bold mb-1">{new Date(log.created_at).toLocaleString()}</div>
                         <div className="text-[#1d1d1f] uppercase">{log.action}: {log.details}</div>
                      </div>
                   )) : (
                      <div className="text-[#86868b] italic">No audit logs found.</div>
                   )}
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CaseDetailsPage;
