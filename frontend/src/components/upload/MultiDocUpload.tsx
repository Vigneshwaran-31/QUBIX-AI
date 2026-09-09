import React, { useState } from 'react';
import { DocumentItem } from '../../types';
import { applicationService } from '../../services/applicationService';
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  FileText,
  Loader2
} from 'lucide-react';

interface MultiDocUploadProps {
  applicationId: string;
  documents: DocumentItem[];
  onDocumentsChanged: () => void;
}

const REQUIRED_DOCS = [
  { type: 'PATTA', title: 'Patta Extract', desc: 'Revenue Department Record of Rights (eservices.tn.gov.in)' },
  { type: 'CHITTA', title: 'Chitta Adangal', desc: 'Land classification, cultivation & extent register' },
  { type: 'EC', title: 'Encumbrance Certificate', desc: 'TNREGINET 30-year transaction index statement' },
  { type: 'SALE_DEED', title: 'Sale Deed (Conveyance)', desc: 'Registered conveyance deed with schedule & boundaries' }
] as const;

export const MultiDocUpload: React.FC<MultiDocUploadProps> = ({
  applicationId,
  documents,
  onDocumentsChanged
}) => {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const getDocForType = (type: string) => {
    return documents.find(d => d.document_type === type);
  };

  const handleFileUpload = async (type: string, file: File) => {
    try {
      setUploadingType(type);
      await applicationService.uploadDocument(applicationId, file, type);
      onDocumentsChanged();
    } catch (err) {
      console.error('File upload failed', err);
      alert('Upload failed. Please ensure file is valid PDF/Image.');
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      await applicationService.deleteDocument(docId);
      onDocumentsChanged();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900">1. Required Land Document Dossier</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit all 4 statutory instruments for automated AI cross-verification. Supported: PDF, JPG, PNG (Max 25MB).
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {documents.length} of 4 Documents Uploaded
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REQUIRED_DOCS.map((docDef) => {
          const doc = getDocForType(docDef.type);
          const isUploading = uploadingType === docDef.type;

          return (
            <div
              key={docDef.type}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                doc
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-slate-50 border-dashed border-slate-300 hover:border-blue-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {docDef.type}
                  </span>
                  {doc ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">Pending</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900">{docDef.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{docDef.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80">
                {doc ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-slate-700 truncate" title={doc.file_name}>
                      {doc.file_name}
                    </div>

                    {/* Progress checklist */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Uploaded ({(doc.file_size / 1024).toFixed(0)} KB)
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> OCR & Classified ({(doc.classification_confidence * 100).toFixed(0)}%)
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Fields Extracted
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(docDef.type, e.target.files[0]);
                          }
                        }}
                      />
                      <div className="py-3 px-2 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 text-center transition-colors">
                        {isUploading ? (
                          <div className="flex items-center justify-center gap-1 text-xs text-blue-600 font-bold">
                            <Loader2 className="w-4 h-4 animate-spin" /> Uploading & OCR...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-xs text-blue-600 font-bold">
                            <UploadCloud className="w-4 h-4" /> Upload Document
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full h-[80vh] flex flex-col p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900">{previewDoc.document_type}: {previewDoc.file_name}</h4>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1">
                ✕
              </button>
            </div>
            <div className="flex-1 mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                src={applicationService.getDocumentFileUrl(previewDoc.id)}
                title="Doc Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
