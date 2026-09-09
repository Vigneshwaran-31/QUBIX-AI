import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import {
  FileSearch,
  Scale,
  Copy,
  BarChart3,
  UserCheck,
  Lock,
  ArrowRight,
  Shield,
  Activity
} from 'lucide-react';
import qubixLogo from '../assets/QUBIX logo.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleQuickDemo = async (caseType: 'case_1' | 'case_2' | 'case_3') => {
    try {
      const app = await applicationService.seedDemoCase(caseType);
      navigate(`/cases/${app.id}`);
    } catch (e) {
      navigate('/dashboard');
    }
  };

  const features = [
    {
      icon: FileSearch,
      title: 'Tamil Nadu Multi-Doc OCR',
      desc: 'Automatic text extraction & entity recognition for Patta, Chitta, TNREGINET EC, and Registered Sale Deeds in Tamil & English.'
    },
    {
      icon: Scale,
      title: 'Cross-Document Verification',
      desc: '10-point automated consistency checking across survey numbers, subdivisions, extents, and ownership chains.'
    },
    {
      icon: Copy,
      title: 'Duplicate Fraud Detection',
      desc: 'High-speed fuzzy entity matching and SHA-256 hash checks to prevent duplicate mortgaging and double-pledging.'
    },
    {
      icon: BarChart3,
      title: 'Explainable Risk Scoring',
      desc: 'Itemized 0–100 risk scoring with transparent deductions and plain-language natural explanation panels.'
    },
    {
      icon: UserCheck,
      title: 'Officer Review & Escalation',
      desc: 'Human-in-the-loop decision workflow: Verify, Request Correction, or Escalate with tamper-evident audit logging.'
    },
    {
      icon: Lock,
      title: 'Tamper-Evident Audit Trail',
      desc: 'Every upload, AI check, status transition, and officer remark is cryptographically logged for state vigilance.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col font-sans text-[#1d1d1f]">
      {/* Hero Section */}
      <div className="bg-white pb-32 pt-24 px-6 md:px-12 border-b border-[#d2d2d7]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]/50 text-[#86868b] text-[10px] font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>National Hackathon 2026 • Team HEXA TITANS</span>
          </div>

          <div className="flex flex-col items-center gap-2 mb-4">
            <img
              src={qubixLogo}
              alt="QUBIX AI Logo"
              className="h-24 w-24 rounded-3xl object-cover shadow-2xl mb-2"
            />
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-[#1d1d1f] leading-tight">
            Verify before you <br/>
            <span className="text-[#0071e3]">approve.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-[#86868b] max-w-2xl mx-auto leading-relaxed font-medium">
            AI-Assisted Land Document Intelligence &amp; Pre-Verification Platform for Tamil Nadu Revenue Administration.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-lg flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Access Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/new-case"
              className="px-8 py-4 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] font-semibold text-lg transition-all"
            >
              Start New Verification
            </Link>
          </div>

          {/* Quick Demo Cases Bar */}
          <div className="pt-16 max-w-3xl mx-auto">
            <p className="text-xs uppercase font-bold text-[#86868b] mb-4 tracking-widest">
              Live Demonstration Scenarios
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleQuickDemo('case_1')}
                className="p-5 rounded-3xl bg-[#f5f5f7] hover:bg-emerald-50 border border-[#d2d2d7]/50 hover:border-emerald-200 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#1d1d1f] group-hover:text-emerald-700">Clear Title</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">10/100</span>
                </div>
                <p className="text-xs text-[#86868b] group-hover:text-emerald-600/80">All 4 documents match perfectly.</p>
              </button>

              <button
                onClick={() => handleQuickDemo('case_2')}
                className="p-5 rounded-3xl bg-[#f5f5f7] hover:bg-amber-50 border border-[#d2d2d7]/50 hover:border-amber-200 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#1d1d1f] group-hover:text-amber-700">Survey Conflict</span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">78/100</span>
                </div>
                <p className="text-xs text-[#86868b] group-hover:text-amber-600/80">Survey mismatch (124/2 vs 124/3).</p>
              </button>

              <button
                onClick={() => handleQuickDemo('case_3')}
                className="p-5 rounded-3xl bg-[#f5f5f7] hover:bg-red-50 border border-[#d2d2d7]/50 hover:border-red-200 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#1d1d1f] group-hover:text-red-700">Critical Fraud</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">92/100</span>
                </div>
                <p className="text-xs text-[#86868b] group-hover:text-red-600/80">Owner conflict + duplicate record.</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-[#1d1d1f]">
            Government-Grade Intelligence.
          </h2>
          <p className="text-[#86868b] mt-4 font-medium text-lg">
            Eliminate registration backlogs, detect document fraud, and empower Sub-Registrars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white rounded-3xl border border-[#d2d2d7]/50 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:border-[#0071e3] transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-3">{f.title}</h3>
                <p className="text-sm text-[#86868b] leading-relaxed font-medium">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-white py-12 border-t border-[#d2d2d7] text-center text-xs">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#1d1d1f] font-bold">
             <Activity className="w-4 h-4 text-[#0071e3]" /> QUBIX-AI
          </div>
          <p className="text-[#86868b] max-w-lg mx-auto leading-relaxed">
            Developed by HEXA TITANS for Tamil Nadu Land Administration. <br/>
            This system provides AI-assisted pre-verification and does not constitute statutory determination of land title.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
