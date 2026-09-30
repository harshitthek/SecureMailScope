export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";
export type Severity = "critical" | "high" | "medium" | "low" | "secure";
export type TLSVersion =
  | "SSL 2.0"
  | "SSL 3.0"
  | "TLS 1.0"
  | "TLS 1.1"
  | "TLS 1.2"
  | "TLS 1.3"
  | "None (Cleartext)";

export type NavView =
  | "OVERVIEW"
  | "SESSIONS"
  | "FINDINGS"
  | "CERTIFICATES"
  | "DISSECTOR"
  | "STANDARDS"
  | "REPORTS";

export type SessionDetailTab =
  | "SUMMARY"
  | "PROTOCOL_FLOW"
  | "TLS"
  | "CERTIFICATE"
  | "RAW_STREAM"
  | "STANDARDS";

export interface RawStreamChunk {
  offset: string;
  hex: string;
  ascii: string;
  direction: "C->S" | "S->C";
  protocol_phase: string;
  is_transition_point?: boolean;
  highlight_label?: string;
  highlight_type?: "danger" | "warning" | "secure" | "info";
}

export interface ProtocolStateStep {
  step: number;
  phase: string;
  direction: "C->S" | "S->C";
  summary: string;
  is_transition_point?: boolean;
  status: "secure" | "compromised" | "downgrade" | "normal";
}

export interface StreamForensicInspection {
  state_timeline: ProtocolStateStep[];
  raw_chunks: RawStreamChunk[];
}

export interface AnalysisResult {
  analysis_id: string;
  filename: string;
  file_size_bytes: number;
  analyzed_at: string;
  processing_time_ms: number;
  enterprise_score: number;
  enterprise_grade: Grade;
  total_sessions: number;
  total_packets: number;
  protocols_detected: string[];
  sessions: Session[];
  vulnerabilities: Vulnerability[];
  compliance: ComplianceCheck[];
  protocol_distribution: DistributionItem[];
  cipher_distribution: CipherDistributionItem[];
  certificate_summary: CertSummary[];
}

export interface ScoringBreakdown {
  protocol_penalty: number;
  cipher_penalty: number;
  pfs_penalty: number;
  cert_penalty: number;
  anomaly_penalty: number;
  raw_score: number;
  final_score: number;
}

export interface Session {
  session_id: number;
  src_ip: string;
  src_port: number;
  dst_ip: string;
  dst_port: number;
  server_name: string;
  protocol: string;
  timestamp: string;
  is_encrypted: boolean;
  starttls_detected: boolean;
  starttls_stripped: boolean;
  tls_version: TLSVersion | null;
  cipher_suite_hex: string | null;
  cipher_suite_name: string | null;
  cipher_severity: Severity | null;
  key_exchange: string | null;
  has_forward_secrecy: boolean;
  ja3_hash: string | null;
  ja3_client_name: string | null;
  ja3_is_known: boolean;
  certificate: CertificateInfo | null;
  session_score: number;
  session_grade: Grade;
  session_severity: Severity;
  scoring_breakdown: ScoringBreakdown;
  forensic_inspection?: StreamForensicInspection;
}

export interface CertificateInfo {
  subject_cn: string;
  issuer_cn: string;
  serial_number: string;
  not_before: string;
  not_after: string;
  is_expired: boolean;
  is_not_yet_valid: boolean;
  is_self_signed: boolean;
  validity_days: number;
  days_remaining: number;
  signature_algorithm: string;
  signature_hash: string;
  is_weak_signature: boolean;
  public_key_type: string;
  public_key_bits: number;
  is_weak_key: boolean;
  san_entries: string[];
}

export interface Vulnerability {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  affected_sessions: number[];
  cve_references: string[];
  nist_reference: string | null;
  remediation: string;
}

export interface ComplianceCheck {
  id: string;
  standard: string;
  section: string;
  requirement: string;
  status: "pass" | "fail" | "warn";
  details: string;
}

export interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface CipherDistributionItem {
  name: string;
  count: number;
  severity: Severity;
  color: string;
}

export interface CertSummary {
  server_name: string;
  subject_cn: string;
  is_expired: boolean;
  is_self_signed: boolean;
  is_weak_signature: boolean;
  is_weak_key: boolean;
  days_remaining: number;
  overall_status: Severity;
}

export interface EvidenceCase {
  id: string;
  case_code: string;
  name: string;
  label: string;
  target_host: string;
  protocol: string;
  severity: Severity;
  packet_count: number;
  stream_count: number;
  posture_score: number;
  posture_grade: Grade;
  bpf_filter: string;
  description: string;
  data: AnalysisResult;
}
