"""
Remediation and countermeasure export API routes for SecureMailScope.
Serves executive remediation plans and downloadable Ansible playbooks & IDS rules.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Response

from app.api.routes import _results, _safe_export_token
from app.remediation import (
    build_remediation_summary,
    generate_ansible_playbook,
    generate_snort_rules,
    generate_suricata_rules,
)

router = APIRouter(prefix="/api/remediation", tags=["Remediation"])


async def _resolve_analysis(analysis_id: str) -> dict[str, Any]:
    """Retrieve analysis results from in-memory cache or persistent repository."""
    if analysis_id in _results:
        return _results[analysis_id]

    try:
        from app.db.repository import CaseRepository

        case = await CaseRepository.get_case_by_id(analysis_id)
        if case:
            _results[analysis_id] = case
            return case
    except ImportError:
        pass
    except Exception as e:
        import logging

        logging.getLogger("securemailscope.remediation").error(
            "Database error querying analysis case %s: %s", analysis_id, e
        )
        raise HTTPException(status_code=500, detail="Database error resolving analysis case")

    raise HTTPException(status_code=404, detail="Analysis case not found")


@router.get("/{analysis_id}/summary")
async def get_remediation_summary(analysis_id: str) -> dict[str, Any]:
    """Retrieve MITRE D3FEND mapped remediation summary plan."""
    case = await _resolve_analysis(analysis_id)
    return build_remediation_summary(case)


@router.get("/{analysis_id}/ansible")
async def export_ansible_playbook(analysis_id: str) -> Response:
    """Download dynamic Ansible hardening playbook (.yml) for Postfix/Dovecot."""
    case = await _resolve_analysis(analysis_id)
    playbook_yaml = generate_ansible_playbook(case)
    safe_id = _safe_export_token(analysis_id)
    filename = f"securemailscope_ansible_{safe_id}.yml"

    return Response(
        content=playbook_yaml,
        media_type="text/yaml; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{analysis_id}/suricata")
async def export_suricata_rules(analysis_id: str) -> Response:
    """Download dynamic Suricata IDS signature rules (.rules) targeting detected threats."""
    case = await _resolve_analysis(analysis_id)
    rules_content = generate_suricata_rules(case)
    safe_id = _safe_export_token(analysis_id)
    filename = f"securemailscope_suricata_{safe_id}.rules"

    return Response(
        content=rules_content,
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{analysis_id}/snort")
async def export_snort_rules(analysis_id: str) -> Response:
    """Download dynamic Snort 3 IDS signature rules (.rules) targeting detected threats."""
    case = await _resolve_analysis(analysis_id)
    rules_content = generate_snort_rules(case)
    safe_id = _safe_export_token(analysis_id)
    filename = f"securemailscope_snort_{safe_id}.rules"

    return Response(
        content=rules_content,
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
