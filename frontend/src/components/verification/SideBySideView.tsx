import React, { useState } from 'react';
import { DocumentItem } from '../../types';
import { FileText, Eye, AlertCircle, CheckCircle, ExternalLink, Code } from 'lucide-react';
import { applicationService } from '../../services/applicationService';

interface SideBySideViewProps {
  documents: DocumentItem[];
  conflictFields?: string[];
}

export const SideBySideView: React.FC<SideBySideViewProps> = ({ documents, conflictFields = [] }) => {
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [showRawOcr, setShowRawOcr] = useState(false);

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        No documents uploaded for side-by-side comparison.
      </div>
    );
  }

  const activeDoc = documents[activeDocIndex] || documents[0];
  const ext = activeDoc.extraction;
  const fileUrl = applicationService.getDocumentFileUrl(activeDoc.id);

  const isFieldInConflict = (fieldName: string) => {
    return conflictFields.some(cf => cf.toLowerCase().includes(fieldName.toLowerCase()));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Document Switcher Tabs */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">4. Side-by-Side Verification Inspector</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare source document visual scan directly against extracted entity graph.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-lg">
          {documents.map((doc, idx) => (
            <button
              key={doc.id}
              onClick={() => setActiveDocIndex(idx)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeDocIndex === idx
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {doc.document_type}
            </button>
          ))}
        </div>
      </div>

      {/* Split Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 min-h-[520px]">
        {/* LEFT: Document Preview */}
        <div className="p-4 bg-slate-100 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-300 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Source: {activeDoc.file_name}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRawOcr(!showRawOcr)}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1"
              >
                <Code className="w-3.5 h-3.5" />
                {showRawOcr ? 'View Render' : 'View OCR Text'}
              </button>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open File
              </a>
            </div>
          </div>

          <div className="flex-1 rounded-lg border border-slate-300 bg-white overflow-hidden flex items-center justify-center min-h-[440px]">
            {showRawOcr ? (
              <div className="p-4 w-full h-full overflow-y-auto font-mono text-xs text-slate-800 bg-slate-50">
                <p className="font-bold text-slate-500 mb-2 border-b pb-1">Extracted Raw OCR Text:</p>
                <pre className="whitespace-pre-wrap leading-relaxed">{activeDoc.ocr_text || 'No text extracted.'}</pre>
              </div>
            ) : (
              <iframe
                src={fileUrl}
                title={activeDoc.file_name}
                className="w-full h-full min-h-[440px] border-0"
              />
            )}
          </div>
        </div>

        {/* RIGHT: Structured Entity Inspector */}
        <div className="p-5 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Classified Entity</span>
                <h4 className="text-lg font-bold text-slate-900">{activeDoc.document_type}</h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">Classification Confidence</span>
                <p className="text-sm font-bold text-emerald-600">
                  {(activeDoc.classification_confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Extracted Fields Grid */}
            <div className="space-y-3">
              {[
                { label: 'Survey Number', val: ext?.survey_number, key: 'survey' },
                { label: 'Sub-division Number', val: ext?.subdivision_number, key: 'subdivision' },
                { label: 'Owner / Party Name', val: ext?.owner_name, key: 'owner' },
                { label: 'Property Extent', val: ext?.property_extent, key: 'extent' },
                { label: 'Village', val: ext?.village, key: 'village' },
                { label: 'Taluk', val: ext?.taluk, key: 'taluk' },
                { label: 'District', val: ext?.district, key: 'district' },
                { label: 'Document / Reg Number', val: ext?.document_number, key: 'document' },
                { label: 'Registration Date', val: ext?.registration_date, key: 'date' },
              ].map((item) => {
                const isConflict = isFieldInConflict(item.key) || isFieldInConflict(item.label);
                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      isConflict
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isConflict ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs font-medium text-slate-600">{item.label}</span>
                    </div>
                    <div className="font-mono text-xs font-bold">
                      {item.val || <span className="text-slate-400 font-normal italic">— Not Specified</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
            <span>SHA-256 Digest: <code className="font-mono text-[11px] font-bold">{activeDoc.file_hash.substring(0, 16)}...</code></span>
            <span className="text-[11px] font-semibold text-blue-700">Tamper-Proof</span>
          </div>
        </div>
      </div>
    </div>
  );
};
