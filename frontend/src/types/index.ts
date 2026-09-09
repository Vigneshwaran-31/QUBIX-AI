export type UserRole = 'ADMIN' | 'OFFICER' | 'CITIZEN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DocumentExtraction {
  id: string;
  document_id: string;
  survey_number?: string;
  subdivision_number?: string;
  owner_name?: string;
  previous_owner_name?: string;
  property_extent?: string;
  village?: string;
  taluk?: string;
  district?: string;
  document_number?: string;
  registration_number?: string;
  registration_date?: string;
  property_address?: string;
  boundaries?: string;
  extraction_confidence: number;
  extracted_at: string;
}

export interface DocumentItem {
  id: string;
  application_id: string;
  document_type: 'PATTA' | 'CHITTA' | 'EC' | 'SALE_DEED' | 'UNKNOWN';
  file_name: string;
  file_path: string;
  file_hash: string;
  file_size: number;
  mime_type: string;
  ocr_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  ocr_text?: string;
  classification_confidence: number;
  uploaded_at: string;
  processed_at?: string;
  extraction?: DocumentExtraction;
}

export interface VerificationIssue {
  id: string;
  field_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  document_a_type?: string;
  document_b_type?: string;
  value_a?: string;
  value_b?: string;
  explanation: string;
  confidence: number;
  risk_points: number;
  status: string;
}

export interface VerificationResult {
  id: string;
  application_id: string;
  overall_risk_score: number;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  total_checks: number;
  total_conflicts: number;
  ai_explanation_summary?: string;
  verified_at: string;
  issues: VerificationIssue[];
}

export interface DuplicateMatch {
  id: string;
  application_id: string;
  matching_application_id: string;
  matching_application_number?: string;
  matching_applicant_name?: string;
  similarity_score: number;
  matching_fields: string[];
  status: string;
  detected_at: string;
}

export interface OfficerReview {
  id: string;
  application_id: string;
  officer_id: string;
  officer_name?: string;
  decision: 'VERIFIED' | 'REQUEST_CORRECTION' | 'ESCALATE';
  comments: string;
  reviewed_at: string;
}

export interface AuditLog {
  id: string;
  application_id?: string;
  user_id?: string;
  user_name?: string;
  action: string;
  previous_status?: string;
  new_status?: string;
  details?: string;
  created_at: string;
}

export interface Application {
  id: string;
  application_number: string;
  applicant_id?: string;
  applicant_name: string;
  applicant_phone?: string;
  applicant_email?: string;
  district: string;
  taluk: string;
  village: string;
  primary_survey_no: string;
  subdivision_number?: string;
  property_extent?: string;
  notes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PROCESSING' | 'VERIFIED' | 'NEEDS_CORRECTION' | 'ESCALATED';
  risk_score: number;
  risk_level: 'PENDING' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  updated_at: string;
  documents: DocumentItem[];
  verification_result?: VerificationResult;
  duplicate_matches: DuplicateMatch[];
  reviews: OfficerReview[];
}

export interface ApplicationSummary {
  id: string;
  application_number: string;
  applicant_name: string;
  district: string;
  primary_survey_no: string;
  documents_count: number;
  risk_score: number;
  risk_level: string;
  status: string;
  created_at: string;
}

export interface CrossDocComparisonRow {
  field_key: string;
  field_label: string;
  patta: string;
  chitta: string;
  ec: string;
  sale_deed: string;
  status: 'MATCH' | 'PARTIAL' | 'CONFLICT' | 'NOT_AVAILABLE';
  severity?: string;
  explanation?: string;
}

export interface CrossDocComparisonMatrix {
  application_id: string;
  application_number: string;
  rows: CrossDocComparisonRow[];
  overall_status: string;
  total_conflicts: number;
}

export interface DashboardStats {
  total_applications: number;
  pending_verification: number;
  verified: number;
  needs_correction: number;
  high_risk: number;
  critical_risk: number;
  status_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  mismatch_type_counts: Record<string, number>;
  recent_activity: Array<{ id: string; action: string; details: string; time: string }>;
}
