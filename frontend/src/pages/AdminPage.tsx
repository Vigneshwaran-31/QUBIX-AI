import React, { useState } from 'react';
import { Save, CheckCircle, Server, Database, Shield, Settings2 } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [rules, setRules] = useState([
    { key: 'survey_mismatch', label: 'Survey Number Mismatch Penalty (Rule 1)', pts: 45, severity: 'CRITICAL' },
    { key: 'extent_mismatch', label: 'Property Extent Variance (>1.0%) Penalty (Rule 4)', pts: 20, severity: 'HIGH' },
    { key: 'chain_gap', label: 'Prior Link Sequence Gap (Rule 10)', pts: 13, severity: 'HIGH' },
    { key: 'owner_conflict', label: 'Owner Name / Title Conflict Penalty (Rule 3)', pts: 15, severity: 'CRITICAL' },
    { key: 'subdivision_mismatch', label: 'Sub-division Number Divergence (Rule 2)', pts: 25, severity: 'CRITICAL' },
    { key: 'duplicate_app', label: 'Potential Duplicate Application Penalty', pts: 30, severity: 'CRITICAL' },
    { key: 'missing_doc', label: 'Missing Mandatory Document Penalty', pts: 10, severity: 'MEDIUM' },
  ]);

  const handleWeightChange = (index: number, val: number) => {
    const updated = [...rules];
    updated[index].pts = val;
    setRules(updated);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] pb-24">
      {/* Top Header */}
      <div className="bg-white px-8 py-8 border-b border-[#d2d2d7]">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#1d1d1f] text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                System Governance
              </span>
              <span className="text-[#86868b] text-[10px] font-bold uppercase tracking-widest">
                Admin Telemetry
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
              Risk Engine Configuration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className={`px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-sm ${
                saved ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
              }`}
            >
              {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Parameters Committed!' : 'Save Matrix'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Health Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-1">Inference Backend</p>
              <p className="text-sm font-semibold text-[#1d1d1f]">Active (Tesseract 5.3)</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-1">State Land Ledger</p>
              <p className="text-sm font-semibold text-[#1d1d1f]">SQLite Store</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-1">Cryptographic DSC</p>
              <p className="text-sm font-semibold text-[#1d1d1f]">e-Mudhra Class-3</p>
            </div>
          </div>
        </div>

        {/* Risk Rule Engine Parameters */}
        <div className="bg-white rounded-3xl border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="p-8 border-b border-[#f5f5f7]">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#f5f5f7] rounded-lg">
                   <Settings2 className="w-5 h-5 text-[#1d1d1f]" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                  Deterministic Risk Weight Matrix
                </h3>
             </div>
            <p className="text-sm text-[#86868b] mt-2 leading-relaxed">
              Fine-tune point penalties allocated to cross-document conflict categories under TNREGINET rules.
            </p>
          </div>

          <div className="p-8 space-y-6">
            {rules.map((rule, idx) => (
              <div key={rule.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f5f5f7] last:border-0 last:pb-0">
                <div className="flex flex-col gap-2 items-start">
                  <p className="text-sm font-semibold text-[#1d1d1f]">{rule.label}</p>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest ${
                    rule.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' : 
                    rule.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {rule.severity}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-[#86868b] uppercase tracking-widest">Penalty</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={rule.pts}
                      onChange={(e) => handleWeightChange(idx, parseInt(e.target.value) || 0)}
                      className="w-24 bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white text-center font-mono font-bold text-[#1d1d1f] text-sm rounded-xl py-2 px-3 transition-all outline-none"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#86868b] uppercase tracking-widest">PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
