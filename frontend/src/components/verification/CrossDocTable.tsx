import React, { useState } from 'react';
import { CrossDocComparisonMatrix, CrossDocComparisonRow } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Minus, Info, ChevronRight, X } from 'lucide-react';

interface CrossDocTableProps {
  matrix: CrossDocComparisonMatrix;
}

export const CrossDocTable: React.FC<CrossDocTableProps> = ({ matrix }) => {
  const [selectedRow, setSelectedRow] = useState<CrossDocComparisonRow | null>(null);

  const getStatusBadge = (status: string, severity?: string) => {
    switch (status) {
      case 'MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> MATCH
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <XCircle className="w-3.5 h-3.5" /> CONFLICT ({severity || 'CRITICAL'})
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" /> PARTIAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            <Minus className="w-3.5 h-3.5" /> NOT AVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>3. Cross-Document Consistency Matrix</span>
            <span className="text-xs font-normal text-slate-500">(10-Point Automated Inspection)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any flagged row to inspect detailed discrepancy reasoning and legal reference.
          </p>
        </div>
        <div>
          {matrix.total_conflicts === 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4" /> All Parameters Consistent
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              <XCircle className="w-4 h-4" /> {matrix.total_conflicts} Conflict(s) Detected
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Property Field</th>
              <th className="px-4 py-3">Patta</th>
              <th className="px-4 py-3">Chitta</th>
              <th className="px-4 py-3">EC (Encumbrance)</th>
              <th className="px-4 py-3">Sale Deed</th>
              <th className="px-4 py-3">Verification Result</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {matrix.rows.map((row) => {
              const isConflict = row.status === 'CONFLICT';
              return (
                <tr
                  key={row.field_key}
                  onClick={() => setSelectedRow(row)}
                  className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                    isConflict ? 'bg-rose-50/40 hover:bg-rose-100/50' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{row.field_label}</span>
                      {isConflict && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-mono text-xs">{row.patta}</td>
                  <td className="px-4 py-3.5 text-slate-700 font-mono text-xs">{row.chitta}</td>
                  <td className={`px-4 py-3.5 font-mono text-xs ${isConflict && row.ec !== '—' ? 'text-rose-700 font-bold bg-rose-100/50 px-2 rounded' : 'text-slate-700'}`}>
                    {row.ec}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-mono text-xs">{row.sale_deed}</td>
                  <td className="px-4 py-3.5">{getStatusBadge(row.status, row.severity)}</td>
                  <td className="px-3 py-3.5 text-right">
                    <button className="text-slate-400 hover:text-blue-600">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Discrepancy Detail Modal */}
      {selectedRow && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-base">{selectedRow.field_label} Analysis</h4>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase">Values Extracted Across Records</p>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
                  <div><span className="text-slate-400">Patta:</span> <b>{selectedRow.patta}</b></div>
                  <div><span className="text-slate-400">Chitta:</span> <b>{selectedRow.chitta}</b></div>
                  <div><span className="text-slate-400">EC:</span> <b className="text-rose-600">{selectedRow.ec}</b></div>
                  <div><span className="text-slate-400">Sale Deed:</span> <b>{selectedRow.sale_deed}</b></div>
                </div>
              </div>

              <div className={`p-3.5 rounded-lg border ${
                selectedRow.status === 'CONFLICT'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1">
                  AI Consistency Finding ({selectedRow.status})
                </p>
                <p className="text-xs leading-relaxed">{selectedRow.explanation}</p>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Cross-checked using deterministic rapid entity normalization and TNREGINET indexing rules.
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
