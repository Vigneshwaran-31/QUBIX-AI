import React, { useState } from 'react';
import { CheckCircle2, AlertOctagon, ArrowUpRight, X, Shield, Send } from 'lucide-react';
import { applicationService } from '../../services/applicationService';

interface OfficerDecisionModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OfficerDecisionModal: React.FC<OfficerDecisionModalProps> = ({
  applicationId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [decision, setDecision] = useState<'VERIFIED' | 'REQUEST_CORRECTION' | 'ESCALATE'>('VERIFIED');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim() || comments.trim().length < 5) {
      setError('Official justification comments are mandatory (min 5 characters).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await applicationService.submitOfficerReview(applicationId, decision, comments);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit officer decision.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">Official Officer Determination</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Official Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('VERIFIED')}
                className={`flex flex-col items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  decision === 'VERIFIED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-600" />
                Verified
              </button>

              <button
                type="button"
                onClick={() => setDecision('REQUEST_CORRECTION')}
                className={`flex flex-col items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  decision === 'REQUEST_CORRECTION'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertOctagon className="w-5 h-5 mb-1 text-amber-600" />
                Correction
              </button>

              <button
                type="button"
                onClick={() => setDecision('ESCALATE')}
                className={`flex flex-col items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  decision === 'ESCALATE'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-5 h-5 mb-1 text-rose-600" />
                Escalate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Officer Justification & Directives (Mandatory Audit Requirement)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide reason for approval, specific clarification required from citizen, or rationale for vigilance escalation..."
              rows={4}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            ></textarea>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200 font-medium">
              {error}
            </p>
          )}

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
            This action will be committed to the tamper-evident government audit log with your digital officer credentials and timestamp.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Submitting...' : 'Commit Official Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
