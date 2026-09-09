from typing import List, Dict, Any

def generate_ai_explanation(
    documents_count: int,
    issues: List[Any],
    risk_score: float,
    risk_category: str,
    duplicate_info: Dict[str, Any] = None
) -> str:
    """
    Synthesize explainable, factual, plain-language AI explanation of document verification.
    Ensures no unsupported legal conclusions are made.
    """
    lines = []
    lines.append(f"AI Pre-Verification Summary (Evaluated {documents_count} submitted land documents):")
    
    critical_issues = [i for i in issues if (getattr(i, 'severity', '') == 'CRITICAL' or (isinstance(i, dict) and i.get('severity') == 'CRITICAL'))]
    high_issues = [i for i in issues if (getattr(i, 'severity', '') == 'HIGH' or (isinstance(i, dict) and i.get('severity') == 'HIGH'))]
    medium_issues = [i for i in issues if (getattr(i, 'severity', '') == 'MEDIUM' or (isinstance(i, dict) and i.get('severity') == 'MEDIUM'))]

    if not issues and (not duplicate_info or not duplicate_info.get("has_duplicate")):
        lines.append("✓ All submitted documents (Patta, Chitta, EC, Sale Deed) demonstrate high cross-consistency.")
        lines.append("✓ Survey numbers, sub-division numbers, ownership entities, and property extents match across records.")
        lines.append(f"✓ Overall Risk Score is {risk_score}/100 (LOW RISK). Application is eligible for standard officer approval.")
        return "\n".join(lines)

    # Discuss critical issues
    if critical_issues:
        lines.append(f"• CRITICAL CONFLICTS ({len(critical_issues)} detected):")
        for iss in critical_issues:
            exp = getattr(iss, 'explanation', None) or (iss.get('explanation') if isinstance(iss, dict) else '')
            lines.append(f"  - {exp}")

    # Discuss high issues
    if high_issues:
        lines.append(f"• HIGH-SEVERITY DISCREPANCIES ({len(high_issues)} detected):")
        for iss in high_issues:
            exp = getattr(iss, 'explanation', None) or (iss.get('explanation') if isinstance(iss, dict) else '')
            lines.append(f"  - {exp}")

    # Discuss duplicate application flag
    if duplicate_info and duplicate_info.get("has_duplicate"):
        app_no = duplicate_info.get("matching_app_number", "Existing Record")
        score = duplicate_info.get("similarity", 0)
        lines.append(f"• DUPLICATE ALERT: Matches existing application {app_no} with {score:.1f}% property parameter overlap.")

    # Discuss missing documents
    if medium_issues:
        missing_docs = [iss for iss in medium_issues if "Missing Document" in (getattr(iss, 'field_name', '') or (iss.get('field_name') if isinstance(iss, dict) else ''))]
        if missing_docs:
            lines.append(f"• INCOMPLETE SUBMISSION: {len(missing_docs)} required document(s) missing from application.")

    lines.append(f"Conclusion: Overall Risk Score is {risk_score}/100 ({risk_category} RISK). Final statutory determination rests with the Sub-Registrar / Revenue Officer.")
    return "\n".join(lines)
