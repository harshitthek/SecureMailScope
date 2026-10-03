"""
HTML forensic dossier report exporter for SecureMailScope.
Generates an air-gapped, self-contained, printable forensic audit report.
"""
from __future__ import annotations

import html
from typing import Any


def generate_html_report(analysis: dict[str, Any]) -> str:
    """
    Generate a self-contained, air-gapped HTML forensic dossier.
    
    Args:
        analysis: Analysis result dictionary containing sessions, vulnerabilities,
                  compliance checklists, scores, and metadata.
                  
    Returns:
        Complete HTML5 string with embedded CSS and print styles.
    """
    analysis_id = html.escape(str(analysis.get("analysis_id", "N/A")))
    source_file = html.escape(str(analysis.get("filename", "capture.pcap")))
    generated_at = html.escape(str(analysis.get("analyzed_at", "")))
    file_size_kb = f"{(analysis.get('file_size_bytes', 0) / 1024):.1f} KB" if analysis.get("file_size_bytes") else "Pre-seeded Capture"
    processing_ms = analysis.get("processing_time_ms", 0)
    
    score = analysis.get("enterprise_score", 0)
    grade = html.escape(str(analysis.get("enterprise_grade", "F")))
    sessions = analysis.get("sessions", [])
    vulns = analysis.get("vulnerabilities", [])
    compliance = analysis.get("compliance", [])
    certs = analysis.get("certificate_summary", [])
    protocols = analysis.get("protocols_detected", [])
    
    critical_vulns = [v for v in vulns if v.get("severity") == "critical"]
    high_vulns = [v for v in vulns if v.get("severity") == "high"]
    medium_vulns = [v for v in vulns if v.get("severity") == "medium"]
    low_vulns = [v for v in vulns if v.get("severity") in ("low", "info")]

    # Grade color
    if score >= 90:
        score_color = "#34d399"
        score_bg = "rgba(16, 185, 129, 0.12)"
        grade_badge_border = "#10b981"
    elif score >= 70:
        score_color = "#60a5fa"
        score_bg = "rgba(59, 130, 246, 0.12)"
        grade_badge_border = "#3b82f6"
    elif score >= 50:
        score_color = "#fbbf24"
        score_bg = "rgba(245, 158, 11, 0.12)"
        grade_badge_border = "#f59e0b"
    else:
        score_color = "#f87171"
        score_bg = "rgba(239, 68, 68, 0.12)"
        grade_badge_border = "#ef4444"

    def sev_badge(sev: str) -> str:
        sev = str(sev).lower()
        if sev == "critical":
            return '<span class="badge badge-critical">CRITICAL</span>'
        elif sev == "high":
            return '<span class="badge badge-high">HIGH</span>'
        elif sev == "medium":
            return '<span class="badge badge-medium">MEDIUM</span>'
        elif sev == "low":
            return '<span class="badge badge-low">LOW</span>'
        return '<span class="badge badge-secure">SECURE</span>'

    def pass_fail_badge(status: str) -> str:
        status = str(status).lower()
        if status == "pass":
            return '<span class="badge badge-pass">PASS</span>'
        return '<span class="badge badge-fail">FAIL</span>'

    # Build Vulnerability Rows
    vuln_rows = []
    for v in vulns:
        v_title = html.escape(str(v.get("title", "")))
        v_desc = html.escape(str(v.get("description", "")))
        v_remed = html.escape(str(v.get("remediation", "")))
        v_sev = v.get("severity", "medium")
        v_proto = html.escape(str(v.get("protocol", "TLS")))
        v_flow = html.escape(str(v.get("affected_session_id", "GLOBAL")))
        
        vuln_rows.append(f"""
        <tr>
          <td>{sev_badge(v_sev)}</td>
          <td><strong>{v_title}</strong><br><span class="desc-text">{v_desc}</span></td>
          <td><code>{v_proto}</code></td>
          <td><code>{v_flow}</code></td>
          <td class="remed-cell"><code>{v_remed}</code></td>
        </tr>
        """)
    vuln_rows_html = "".join(vuln_rows) if vuln_rows else "<tr><td colspan='5' class='text-center'>No cryptographic vulnerabilities detected. Infrastructure passes all security baselines.</td></tr>"

    # Build Session Flow Rows
    flow_rows = []
    for s in sessions:
        s_id = html.escape(str(s.get("session_id", "")))
        s_proto = html.escape(str(s.get("protocol", "")))
        vector = f"{html.escape(str(s.get('src_ip', '')))}:{s.get('src_port', '')} → {html.escape(str(s.get('dst_ip', '')))}:{s.get('dst_port', '')}"
        
        stls_status = "N/A (Direct)"
        if not s.get("is_implicit_tls"):
            if s.get("starttls_stripped"):
                stls_status = '<span class="badge badge-critical">STRIPPED (MITM)</span>'
            elif s.get("starttls_accepted"):
                stls_status = '<span class="badge badge-secure">ACCEPTED</span>'
            elif s.get("is_cleartext_only"):
                stls_status = '<span class="badge badge-fail">CLEARTEXT FALLBACK</span>'
            else:
                stls_status = '<span class="badge badge-low">UNKNOWN</span>'
                
        tls_ver = html.escape(str(s.get("tls_version", "None (Cleartext)")))
        cipher = html.escape(str(s.get("cipher_name", "None (Plaintext)")))
        pfs = "YES (PFS)" if s.get("has_forward_secrecy") else '<span class="text-hazard">NO (STATIC)</span>'
        ja3_client = html.escape(str(s.get("client_fingerprint") or s.get("ja3_hash", "Unknown")))
        s_score = s.get("session_score", 0)
        s_grade = html.escape(str(s.get("session_grade", "F")))
        
        flow_rows.append(f"""
        <tr>
          <td><code>{s_id}</code></td>
          <td><span class="badge badge-proto">{s_proto}</span></td>
          <td><code>{vector}</code></td>
          <td>{stls_status}</td>
          <td><code>{tls_ver}</code></td>
          <td><code>{cipher}</code></td>
          <td>{pfs}</td>
          <td><code>{ja3_client}</code></td>
          <td><strong>{s_score}/100</strong> ({s_grade})</td>
        </tr>
        """)
    flow_rows_html = "".join(flow_rows) if flow_rows else "<tr><td colspan='9' class='text-center'>No email session streams parsed.</td></tr>"

    # Build Compliance Rows
    comp_rows = []
    for c in compliance:
        c_std = html.escape(str(c.get("standard", "")))
        c_sec = html.escape(str(c.get("section", "")))
        c_req = html.escape(str(c.get("requirement", "")))
        c_status = str(c.get("status", "fail"))
        c_details = html.escape(str(c.get("details", "")))
        
        comp_rows.append(f"""
        <tr>
          <td><strong>{c_std}</strong></td>
          <td><code>{c_sec}</code></td>
          <td>{c_req}</td>
          <td>{pass_fail_badge(c_status)}</td>
          <td>{c_details}</td>
        </tr>
        """)
    comp_rows_html = "".join(comp_rows) if comp_rows else "<tr><td colspan='5' class='text-center'>No compliance rules evaluated.</td></tr>"

    # Build Certificate Rows
    cert_rows = []
    for cert in certs:
        sub = html.escape(str(cert.get("subject_cn", "Unknown")))
        iss = html.escape(str(cert.get("issuer_cn", "Unknown")))
        exp = '<span class="badge badge-fail">EXPIRED</span>' if cert.get("is_expired") else '<span class="badge badge-pass">VALID</span>'
        self_s = '<span class="badge badge-fail">SELF-SIGNED</span>' if cert.get("is_self_signed") else '<span class="badge badge-pass">CA-SIGNED</span>'
        days = cert.get("days_remaining", 0)
        key_info = f"{html.escape(str(cert.get('public_key_type', 'RSA')))} {cert.get('public_key_bits', 0)} bit"
        sig_hash = html.escape(str(cert.get("signature_hash", "SHA-256")))
        
        cert_rows.append(f"""
        <tr>
          <td><strong>{sub}</strong></td>
          <td>{iss}</td>
          <td>{exp} ({days} days)</td>
          <td>{self_s}</td>
          <td><code>{key_info}</code></td>
          <td><code>{sig_hash}</code></td>
        </tr>
        """)
    cert_rows_html = "".join(cert_rows) if cert_rows else "<tr><td colspan='6' class='text-center'>No X.509 digital certificates identified in inspected sessions.</td></tr>"

    # Critical Banner if active attack or severe vulnerability
    critical_banner_html = ""
    if critical_vulns:
        crit_msg = "<br>• ".join([html.escape(v.get("title", "")) for v in critical_vulns])
        critical_banner_html = f"""
        <div class="alert-box alert-critical">
          <div class="alert-title">CRITICAL ADVERSARY ALERT: ACTIVE ATTACK / SEVERE VULNERABILITY DETECTED</div>
          <div class="alert-content">
            The cryptographic inspection engine identified critical threats requiring immediate emergency response:<br>
            • {crit_msg}
          </div>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SecureMailScope Forensic Dossier — {analysis_id}</title>
  <style>
    /* Air-gapped self-contained styling: 0 external fonts, 0 external CSS */
    :root {{
      --bg: #090a0f;
      --card-bg: #11131a;
      --card-subtle: #171a23;
      --border: #232734;
      --border-bright: #32384a;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --accent: #cc9166;
      --accent-muted: #9e6d49;
      --critical: #ef4444;
      --critical-bg: rgba(239, 68, 68, 0.12);
      --high: #f97316;
      --medium: #f59e0b;
      --low: #3b82f6;
      --pass: #10b981;
      --pass-bg: rgba(16, 185, 129, 0.12);
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      padding: 32px 24px;
      -webkit-font-smoothing: antialiased;
    }}

    .container {{
      max-width: 1200px;
      margin: 0 auto;
    }}

    /* Top Classification Bar */
    .classification-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: var(--card-subtle);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: var(--accent);
      letter-spacing: 0.05em;
      margin-bottom: 24px;
    }}

    /* Header */
    .header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 24px;
      gap: 20px;
    }}

    .title-group h1 {{
      font-size: 26px;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin-bottom: 6px;
    }}

    .title-group p {{
      color: var(--text-muted);
      font-size: 13px;
    }}

    .meta-box {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: var(--text-muted);
      text-align: right;
      line-height: 1.8;
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 10px 14px;
      border-radius: 6px;
    }}

    /* Alert Box */
    .alert-box {{
      padding: 14px 18px;
      border-radius: 6px;
      margin-bottom: 24px;
      font-size: 13px;
    }}

    .alert-critical {{
      background: var(--critical-bg);
      border: 1px solid var(--critical);
      color: #fecaca;
    }}

    .alert-title {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
      color: var(--critical);
    }}

    /* Executive Score Card */
    .score-grid {{
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }}

    .score-card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }}

    .score-circle {{
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 6px solid {grade_badge_border};
      background: {score_bg};
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-bottom: 12px;
    }}

    .score-val {{
      font-size: 38px;
      font-weight: 800;
      color: {score_color};
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      line-height: 1;
    }}

    .score-max {{
      font-size: 11px;
      color: var(--text-dim);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }}

    .grade-badge {{
      display: inline-block;
      padding: 4px 14px;
      border-radius: 4px;
      background: {score_bg};
      border: 1px solid {grade_badge_border};
      color: {score_color};
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      font-size: 14px;
      margin-top: 4px;
    }}

    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }}

    .kpi-card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
    }}

    .kpi-label {{
      font-size: 11px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }}

    .kpi-value {{
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }}

    .kpi-sub {{
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }}

    /* Section Cards */
    .section-card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 24px;
      overflow: hidden;
    }}

    .section-header {{
      background: var(--card-subtle);
      border-bottom: 1px solid var(--border);
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    .section-title {{
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .section-tag {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: var(--text-dim);
    }}

    /* Tables */
    table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 12px;
    }}

    th {{
      background: var(--card-subtle);
      color: var(--text-muted);
      font-weight: 600;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    td {{
      padding: 11px 14px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
      vertical-align: top;
    }}

    tr:last-child td {{
      border-bottom: none;
    }}

    tr:hover td {{
      background: rgba(255, 255, 255, 0.02);
    }}

    code {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 5px;
      border-radius: 3px;
      color: #cbd5e1;
    }}

    .desc-text {{
      color: var(--text-muted);
      font-size: 11px;
      display: inline-block;
      margin-top: 3px;
    }}

    .remed-cell {{
      max-width: 320px;
      word-break: break-all;
    }}

    /* Badges */
    .badge {{
      display: inline-block;
      padding: 2px 7px;
      border-radius: 3px;
      font-size: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      letter-spacing: 0.03em;
    }}

    .badge-critical {{ background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }}
    .badge-high {{ background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4); }}
    .badge-medium {{ background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.4); }}
    .badge-low {{ background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); }}
    .badge-secure {{ background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }}
    .badge-proto {{ background: rgba(148, 163, 184, 0.15); color: #e2e8f0; border: 1px solid rgba(148, 163, 184, 0.3); }}
    .badge-pass {{ background: var(--pass-bg); color: var(--pass); border: 1px solid rgba(16, 185, 129, 0.3); }}
    .badge-fail {{ background: var(--critical-bg); color: var(--critical); border: 1px solid rgba(239, 68, 68, 0.3); }}

    .text-hazard {{ color: var(--critical); font-weight: 700; }}
    .text-center {{ text-align: center; color: var(--text-dim); padding: 24px; }}

    /* Remediation Config Block */
    .config-code {{
      background: #050608;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 16px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      line-height: 1.6;
      color: #93c5fd;
      overflow-x: auto;
      white-space: pre;
    }}

    /* Footer */
    .footer {{
      border-top: 1px solid var(--border);
      padding-top: 20px;
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--text-dim);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }}

    /* Print optimization */
    @media print {{
      body {{
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }}
      .classification-bar, .header, .section-card, .score-card, .kpi-card {{
        border-color: #cccccc !important;
        background: #ffffff !important;
        color: #000000 !important;
      }}
      .section-header {{
        background: #f1f5f9 !important;
      }}
      th {{
        background: #f8fafc !important;
        color: #334155 !important;
      }}
      td, .title-group h1, .section-title, .kpi-value {{
        color: #000000 !important;
      }}
      code, .config-code {{
        background: #f1f5f9 !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
      }}
      .badge-critical {{ border: 1px solid #ef4444 !important; color: #b91c1c !important; }}
      .badge-pass {{ border: 1px solid #10b981 !important; color: #047857 !important; }}
      .badge-fail {{ border: 1px solid #ef4444 !important; color: #b91c1c !important; }}
    }}
  </style>
</head>
<body>
  <div class="container">

    <!-- Top Classification -->
    <div class="classification-bar">
      <span>NTRO // FORENSIC AUDIT CLASSIFICATION: LAWFUL INTERCEPT / FORENSIC EVIDENCE</span>
      <span>PS-ID: SIH26159</span>
    </div>

    <!-- Header -->
    <header class="header">
      <div class="title-group">
        <h1>SecureMailScope Forensic Audit Dossier</h1>
        <p>AI-Assisted Cryptographic Posture Assessment for Secure Email Communications</p>
      </div>
      <div class="meta-box">
        <div><strong>CASE ID:</strong> {analysis_id}</div>
        <div><strong>CAPTURE FILE:</strong> {source_file}</div>
        <div><strong>FILE SIZE:</strong> {file_size_kb}</div>
        <div><strong>TIMESTAMP:</strong> {generated_at}</div>
        <div><strong>EXEC TIME:</strong> {processing_ms} ms</div>
      </div>
    </header>

    {critical_banner_html}

    <!-- Executive Score Card -->
    <div class="score-grid">
      <div class="score-card">
        <div class="score-circle">
          <div class="score-val">{score}</div>
          <div class="score-max">/ 100</div>
        </div>
        <div class="grade-badge">GRADE {grade}</div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Analyzed Sessions</div>
          <div class="kpi-value">{len(sessions)}</div>
          <div class="kpi-sub">{html.escape(", ".join(protocols) if protocols else "None")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Critical Threats</div>
          <div class="kpi-value" style="color: {'#ef4444' if critical_vulns else '#10b981'}">{len(critical_vulns)}</div>
          <div class="kpi-sub">Total Vulns: {len(vulns)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Certificates Audited</div>
          <div class="kpi-value">{len(certs)}</div>
          <div class="kpi-sub">Expired: {len([c for c in certs if c.get('is_expired')])}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Standards Non-Compliant</div>
          <div class="kpi-value" style="color: {'#ef4444' if len([c for c in compliance if c.get('status') == 'fail']) else '#10b981'}">
            {len([c for c in compliance if c.get('status') == 'fail'])}
          </div>
          <div class="kpi-sub">Total Evaluated: {len(compliance)}</div>
        </div>
      </div>
    </div>

    <!-- Prioritized Vulnerabilities -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">Prioritized Vulnerabilities &amp; Attack Vectors</div>
        <div class="section-tag">{len(vulns)} FINDINGS</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 100px;">Severity</th>
            <th>Vulnerability &amp; Threat Description</th>
            <th style="width: 80px;">Protocol</th>
            <th style="width: 140px;">Affected Flow</th>
            <th>Remediation Snippet</th>
          </tr>
        </thead>
        <tbody>
          {vuln_rows_html}
        </tbody>
      </table>
    </div>

    <!-- Reconstructed Flow Ledger -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">Reconstructed Email Stream Audit Matrix</div>
        <div class="section-tag">{len(sessions)} SESSIONS PARSED</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Stream ID</th>
            <th>Proto</th>
            <th>Network Vector (Src → Dst)</th>
            <th>STARTTLS State</th>
            <th>TLS Version</th>
            <th>Negotiated Cipher</th>
            <th>PFS</th>
            <th>JA3 Client Fingerprint</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {flow_rows_html}
        </tbody>
      </table>
    </div>

    <!-- X.509 Certificate Chain Inspection -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">X.509 Digital Certificate Health &amp; Trust Ledger</div>
        <div class="section-tag">{len(certs)} CERTIFICATES</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Subject Common Name</th>
            <th>Issuer Common Name</th>
            <th>Validity Status</th>
            <th>Trust Type</th>
            <th>Public Key</th>
            <th>Signature Digest</th>
          </tr>
        </thead>
        <tbody>
          {cert_rows_html}
        </tbody>
      </table>
    </div>

    <!-- NIST SP 800-52r2 & RFC 8314 Compliance Checklist -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">NIST SP 800-52r2 &amp; RFC 8314 Compliance Matrix</div>
        <div class="section-tag">{len(compliance)} CONTROLS EVALUATED</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 140px;">Standard</th>
            <th style="width: 110px;">Section</th>
            <th>Mandate Requirement</th>
            <th style="width: 90px;">Status</th>
            <th>Forensic Evidence &amp; Evaluation</th>
          </tr>
        </thead>
        <tbody>
          {comp_rows_html}
        </tbody>
      </table>
    </div>

    <!-- Hardening Configuration Remediation -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">Actionable Mail Daemon Remediation (Postfix &amp; Dovecot)</div>
        <div class="section-tag">HARDENING SPEC</div>
      </div>
      <div style="padding: 18px;">
        <p style="color: var(--text-muted); margin-bottom: 12px;">
          To remediate detected vulnerabilities and satisfy NIST SP 800-52r2 and RFC 8314 mandates, apply the following configuration parameters:
        </p>
        <div class="config-code"># === POSTFIX SMTP HARDENING (main.cf) ===
# Mandate TLS 1.2+ minimum, disable SSLv2/v3 and TLS 1.0/1.1
smtpd_tls_mandatory_protocols = !SSLv2, !SSLv3, !TLSv1, !TLSv1.1
smtpd_tls_protocols = !SSLv2, !SSLv3, !TLSv1, !TLSv1.1

# Enforce Perfect Forward Secrecy with high-grade AEAD ciphers
smtpd_tls_mandatory_ciphers = high
smtpd_tls_exclude_ciphers = aNULL, eNULL, EXPORT, RC4, 3DES, MD5, PSK, SRP, DSS
smtpd_tls_mandatory_exclude_ciphers = aNULL, eNULL, EXPORT, RC4, 3DES, MD5, PSK, SRP, DSS

# Prevent in-band STRIPTLS downgrade attacks
smtpd_tls_security_level = encrypt
smtpd_tls_auth_only = yes

# === DOVECOT IMAP/POP3 HARDENING (conf.d/10-ssl.conf) ===
ssl = required
ssl_min_protocol = TLSv1.2
ssl_cipher_list = ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305
ssl_prefer_server_ciphers = yes</div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div>SecureMailScope // Sponsoring Agency: National Technical Research Organisation (NTRO)</div>
      <div>100% Passive Network Forensic Inspection Engine • Air-Gapped Safe</div>
    </footer>

  </div>
</body>
</html>
"""
