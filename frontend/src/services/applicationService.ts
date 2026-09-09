import api from './api';
import {
  Application,
  ApplicationSummary,
  DashboardStats,
  CrossDocComparisonMatrix,
  DocumentItem,
  VerificationResult,
  OfficerReview,
  AuditLog
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const applicationService = {
  // ─── Dashboard ──────────────────────────────────────────────
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<DashboardStats>('/dashboard/statistics');
    return res.data;
  },

  // ─── Applications ────────────────────────────────────────────
  async getApplications(status = 'ALL', search = '', district = ''): Promise<ApplicationSummary[]> {
    const params: Record<string, string> = {};
    if (status && status !== 'ALL') params.status = status;
    if (search) params.search = search;
    if (district && district !== 'ALL') params.district = district;
    const res = await api.get<ApplicationSummary[]>('/applications', { params });
    return res.data;
  },

  async getApplicationById(id: string): Promise<Application> {
    const res = await api.get<Application>(`/applications/${id}`);
    return res.data;
  },

  async createApplication(data: Partial<Application>): Promise<Application> {
    const res = await api.post<Application>('/applications', data);
    return res.data;
  },

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    const res = await api.put<Application>(`/applications/${id}`, data);
    return res.data;
  },

  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  },

  // ─── Documents ───────────────────────────────────────────────
  async uploadDocument(appId: string, file: File, docTypeHint = 'UNKNOWN'): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type_hint', docTypeHint);
    const res = await api.post<DocumentItem>(`/documents/${appId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteDocument(docId: string): Promise<void> {
    await api.delete(`/documents/${docId}`);
  },

  getDocumentFileUrl(docId: string): string {
    return `${BASE_URL}/documents/${docId}/file`;
  },

  // ─── Verification & Processing ────────────────────────────────
  async runVerification(appId: string): Promise<VerificationResult> {
    const res = await api.post<VerificationResult>(`/processing/${appId}/verify`);
    return res.data;
  },

  async getComparisonMatrix(appId: string): Promise<CrossDocComparisonMatrix> {
    const res = await api.get<CrossDocComparisonMatrix>(`/verification/${appId}/comparison-matrix`);
    return res.data;
  },

  // ─── Officer Workflow ─────────────────────────────────────────
  async submitOfficerReview(appId: string, decision: string, comments: string): Promise<OfficerReview> {
    const res = await api.post<OfficerReview>(`/officer/${appId}/review`, { decision, comments });
    return res.data;
  },

  async getAuditTrail(appId: string): Promise<AuditLog[]> {
    const res = await api.get<AuditLog[]>(`/officer/${appId}/audit`);
    return res.data;
  },

  // ─── Global Audit Logs ────────────────────────────────────────
  // Fetches recent audit events across ALL cases from the dashboard stats
  async getGlobalAuditActivity(): Promise<Array<{ id: string; action: string; details: string; time: string }>> {
    const res = await api.get<DashboardStats>('/dashboard/statistics');
    return res.data.recent_activity || [];
  },

  // ─── Duplicate Detection ─────────────────────────────────────
  async runDuplicateCheck(appId: string): Promise<any> {
    const res = await api.post(`/duplicate/${appId}/check`);
    return res.data;
  },

  // ─── Reports ─────────────────────────────────────────────────
  getReportPdfUrl(appId: string): string {
    return `${BASE_URL}/reports/${appId}/report/pdf`;
  },

  // ─── Demo Seeder ─────────────────────────────────────────────
  async seedDemoCase(caseType: 'case_1' | 'case_2' | 'case_3'): Promise<Application> {
    const res = await api.post<Application>('/dashboard/seed-demo', { case_type: caseType });
    return res.data;
  },

  async initDemoUsers(): Promise<void> {
    await api.post('/dashboard/init-users');
  },
};

export default applicationService;
