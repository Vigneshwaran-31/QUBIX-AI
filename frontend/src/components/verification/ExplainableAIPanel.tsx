import React from 'react';
import { VerificationResult } from '../../types';
import { Sparkles, ShieldAlert, CheckCircle, AlertTriangle, Scale } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface ExplainableAIPanelProps {
  result?: VerificationResult;
}

export const ExplainableAIPanel: React.FC<ExplainableAIPanelProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500">
        Verification pipeline pending execution.
      </div>
    );
  }

  const score = result.overall_risk_score;
  const cat = result.risk_category;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/50 border border-indigo-400/40">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">5. Explainable AI Verification Findings</h3>
            <p className="text-xs text-slate-300">Factual, deterministic discrepancy reasoning engine</p>
          </div>
        </div>
        <div>
          <RiskBadge level={cat} score={score} size="lg" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Score & Reasons Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center items-center text-center">
            <span className="text-xs uppercase font-bold text-slate-500">AI Risk Score</span>
            <div className="text-4xl font-black text-slate-900 mt-1">
              {score.toFixed(0)} <span className="text-base font-normal text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  score > 75 ? 'bg-rose-600' : score > 50 ? 'bg-orange-500' : score > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2">
            <p className="text-xs uppercase font-bold text-slate-500 mb-2">Point Breakdown Attribution</p>
            {result.issues && result.issues.length > 0 ? (
              <div className="space-y-1.5">
                {result.issues.map((iss) => (
                  <div key={iss.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700 font-medium">{iss.field_name} Mismatch ({iss.severity})</span>
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      +{iss.risk_points} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 font-medium py-2">
                ✓ No discrepancy penalties assessed. Zero risk points accumulated.
              </p>
            )}
          </div>
        </div>

        {/* Explainable Text Summary */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2 flex items-center gap-1.5">
            <Scale className="w-4 h-4" /> AI Natural Language Synthesis
          </p>
          <div className="text-xs leading-relaxed space-y-1.5 whitespace-pre-line font-medium text-indigo-900">
            {result.ai_explanation_summary}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <b>Statutory Pre-Verification Notice:</b> QUBIX-AI assists the Sub-Registrar and Revenue Officers by detecting inconsistencies prior to approval. This score does not constitute legal determination of land ownership or final refusal. Final statutory approval remains strictly with the authorized government officer.
          </p>
        </div>
      </div>
    </div>
  );
};
