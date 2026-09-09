import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def generate_verification_pdf(application, db) -> bytes:
    """
    Generate an official government-grade verification summary report PDF using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0f2942')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#4a5568')
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1a365d'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#2d3748')
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#742a2a')
    )

    elements = []

    # Header
    elements.append(Paragraph("GOVERNMENT OF TAMIL NADU", subtitle_style))
    elements.append(Paragraph("REVENUE & REGISTRATION DEPARTMENT", subtitle_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("QUBIX-AI: LAND DOCUMENT PRE-VERIFICATION REPORT", title_style))
    elements.append(Paragraph("TEAM HEXA TITANS &bull; 'Verify Before You Approve'", subtitle_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1a365d'), spaceBefore=4, spaceAfter=12))

    # Application Summary Grid
    app_info = [
        [
            Paragraph("<b>Application Number:</b>", body_style),
            Paragraph(application.application_number, body_style),
            Paragraph("<b>Generated Date:</b>", body_style),
            Paragraph(datetime.utcnow().strftime("%d-%m-%Y %H:%M UTC"), body_style)
        ],
        [
            Paragraph("<b>Applicant Name:</b>", body_style),
            Paragraph(application.applicant_name, body_style),
            Paragraph("<b>Primary Survey No:</b>", body_style),
            Paragraph(f"{application.primary_survey_no} {f'({application.subdivision_number})' if application.subdivision_number else ''}", body_style)
        ],
        [
            Paragraph("<b>District / Taluk:</b>", body_style),
            Paragraph(f"{application.district} / {application.taluk}", body_style),
            Paragraph("<b>Village:</b>", body_style),
            Paragraph(application.village, body_style)
        ],
        [
            Paragraph("<b>Verification Status:</b>", body_style),
            Paragraph(f"<b>{application.status}</b>", body_style),
            Paragraph("<b>AI Risk Score:</b>", body_style),
            Paragraph(f"<b>{application.risk_score:.1f} / 100 ({application.risk_level})</b>", body_style)
        ]
    ]

    t_app = Table(app_info, colWidths=[120, 150, 120, 140])
    t_app.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f7fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(t_app)
    elements.append(Spacer(1, 12))

    # Documents Reviewed
    elements.append(Paragraph("1. Submitted Land Documents Overview", section_title))
    doc_rows = [["Document Type", "File Name", "OCR Status", "Classification Confidence"]]
    for doc_item in application.documents:
        doc_rows.append([
            doc_item.document_type,
            doc_item.file_name[:30],
            doc_item.ocr_status,
            f"{doc_item.classification_confidence*100:.1f}%"
        ])
    
    if len(doc_rows) == 1:
        doc_rows.append(["None", "No documents uploaded", "—", "—"])

    t_docs = Table(doc_rows, colWidths=[120, 210, 100, 100])
    t_docs.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#edf2f7')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1a202c')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_docs)
    elements.append(Spacer(1, 12))

    # Detected Inconsistencies & Issues
    elements.append(Paragraph("2. Detected Inconsistencies & Cross-Document Conflicts", section_title))
    issues = application.verification_result.issues if application.verification_result else []
    
    issue_rows = [["Field", "Severity", "Document A vs B", "Values Found", "Risk Pts"]]
    if issues:
        for iss in issues:
            issue_rows.append([
                Paragraph(iss.field_name, body_style),
                Paragraph(f"<b>{iss.severity}</b>", body_style),
                Paragraph(f"{iss.document_a_type or 'App'} vs {iss.document_b_type or 'Doc'}", body_style),
                Paragraph(f"'{iss.value_a}' vs '{iss.value_b}'", body_style),
                Paragraph(f"+{iss.risk_points}", body_style)
            ])
    else:
        issue_rows.append(["All Fields", "CLEAN", "All Documents", "Perfect Cross-Document Match", "0"])

    t_issues = Table(issue_rows, colWidths=[100, 70, 110, 200, 50])
    t_issues.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#edf2f7')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_issues)
    elements.append(Spacer(1, 12))

    # Explainable AI Finding
    elements.append(Paragraph("3. AI Verification Explanation & Findings", section_title))
    ai_summary = application.verification_result.ai_explanation_summary if application.verification_result else "No verification run recorded."
    elements.append(Paragraph(ai_summary.replace("\n", "<br/>"), body_style))
    elements.append(Spacer(1, 12))

    # Officer Reviews
    elements.append(Paragraph("4. Officer Review Decision & Audit Trail", section_title))
    if application.reviews:
        rev = application.reviews[-1]
        rev_text = f"<b>Decision:</b> {rev.decision} &nbsp;&bull;&nbsp; <b>Date:</b> {rev.reviewed_at.strftime('%d-%m-%Y %H:%M')}<br/><b>Officer Remarks:</b> {rev.comments}"
    else:
        rev_text = "<i>Pending official human officer review.</i>"
    elements.append(Paragraph(rev_text, body_style))
    elements.append(Spacer(1, 16))

    # Legal Disclaimer
    disclaimer_box = [
        [Paragraph(
            "<b>STATUTORY DISCLAIMER:</b> This verification report is generated by QUBIX-AI as an AI-assisted decision support system for "
            "the Registration Department of Tamil Nadu. This report DOES NOT constitute a final legal approval or court-admissible title certification. "
            "Statutory approval or rejection remains strictly under the executive jurisdiction of the Sub-Registrar and Revenue Authorities.",
            disclaimer_style
        )]
    ]
    t_disc = Table(disclaimer_box, colWidths=[530])
    t_disc.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fff5f5')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#feb2b2')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(t_disc)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
