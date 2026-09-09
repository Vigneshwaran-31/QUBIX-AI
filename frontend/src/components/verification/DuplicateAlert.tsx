import React, { useState } from 'react';
import { DuplicateMatch } from '../../types';
import { ShieldAlert, ExternalLink, X, Copy, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DuplicateAlertProps {
  duplicates: DuplicateMatch[];
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({ duplicates }) => {
  const [inspectMatch, setInspectMatch] = useState<DuplicateMatch | null>(null);
  const navigate = useNavigate();

  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="bg-rose-50 border-2 border-rose-400 rounded-xl p-5 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-950 uppercase tracking-wide flex items-center gap-2">
              <span>Potential Duplicate Application / Property Detected</span>
              <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded text-xs font-black">
                {duplicates.length} Match Found
              </span>
            </h4>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              This application has significant overlapping property entities (survey number, boundaries, or identical file hashes) with previously recorded applications in the registry.
            </p>

            <div className="mt-3 space-y-2">
              {duplicates.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-rose-200 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">{d.matching_application_number}</span>
                    <span className="text-slate-500">({d.matching_applicant_name || 'Recorded Applicant'})</span>
                    <span className="font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                      {d.similarity_score.toFixed(1)}% Similarity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectMatch(d)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs"
                    >
                      Inspect Overlap
                    </button>
                    <button
                      onClick={() => navigate(`/cases/${d.matching_application_id}`)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View Record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Inspection Modal */}
      {inspectMatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-rose-600" />
                <h4 className="font-bold text-slate-900 text-base">Duplicate Investigation Inspector</h4>
              </div>
              <button
                onClick={() => setInspectMatch(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                <p className="font-bold">Matching Case: {inspectMatch.matching_application_number}</p>
                <p className="mt-0.5">Calculated AI Parameter Similarity: <b>{inspectMatch.similarity_score.toFixed(1)}%</b></p>
              </div>

              <div>
                <p className="font-bold text-slate-700 uppercase tracking-wider mb-2">Matching Parameters Identified:</p>
                <div className="space-y-1.5">
                  {(inspectMatch.matching_fields || []).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Duplicate detection cross-references geographic coordinates, survey divisions, owner token similarity, and document SHA-256 digital signatures to prevent double-pledging or fraudulent re-registration.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setInspectMatch(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = inspectMatch.matching_application_id;
                  setInspectMatch(null);
                  navigate(`/cases/${id}`);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Navigate to Existing Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
