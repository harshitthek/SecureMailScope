"""
JSON forensic report formatter.
"""
from __future__ import annotations

import json
from typing import Any


def format_json_report(analysis: dict[str, Any]) -> bytes:
    """
    Format analysis results as a pretty-printed JSON forensic report.
    
    Args:
        analysis: Complete analysis result dict.
        
    Returns:
        UTF-8 encoded JSON bytes.
    """
    report = {
        "report_metadata": {
            "tool": "SecureMailScope",
            "version": "1.0.0",
            "description": "AI-Assisted Cryptographic Security Posture Assessment for Secure Email Communications",
            "generated_at": analysis.get("analyzed_at", ""),
            "analysis_id": analysis.get("analysis_id", ""),
            "source_file": analysis.get("filename", ""),
            "file_size_bytes": analysis.get("file_size_bytes", 0),
            "processing_time_ms": analysis.get("processing_time_ms", 0),
        },
        "executive_summary": {
            "enterprise_score": analysis.get("enterprise_score", 0),
            "enterprise_grade": analysis.get("enterprise_grade", "F"),
            "total_sessions_analyzed": analysis.get("total_sessions", 0),
            "total_packets_processed": analysis.get("total_packets", 0),
            "protocols_detected": analysis.get("protocols_detected", []),
            "critical_vulnerabilities": len([v for v in analysis.get("vulnerabilities", []) if v.get("severity") == "critical"]),
            "high_vulnerabilities": len([v for v in analysis.get("vulnerabilities", []) if v.get("severity") == "high"]),
            "compliance_failures": len([c for c in analysis.get("compliance", []) if c.get("status") == "fail"]),
        },
        "sessions": analysis.get("sessions", []),
        "vulnerabilities": analysis.get("vulnerabilities", []),
        "compliance": analysis.get("compliance", []),
        "certificate_summary": analysis.get("certificate_summary", []),
        "protocol_distribution": analysis.get("protocol_distribution", []),
        "cipher_distribution": analysis.get("cipher_distribution", []),
    }

    return json.dumps(report, indent=2, ensure_ascii=False).encode("utf-8")
