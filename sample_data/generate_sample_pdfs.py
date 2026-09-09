"""
Standalone script to generate realistic synthetic Tamil Nadu land registration PDF documents
for demonstration purposes:
- Demo Case 1: Clean Matching Documents (Patta, Chitta, EC, Sale Deed) -> Low Risk
- Demo Case 2: Survey Number Mismatch (EC 124/3 vs Patta 124/2) -> Critical Risk
- Demo Case 3: Owner Name Conflict (Suresh Kumar vs Ramesh Kumar) + Duplicate Filing -> Critical Risk
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def create_styled_pdf(file_path: str, header_dept: str, doc_title: str, fields: list, footer_note: str = ""):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    styles = getSampleStyleSheet()

    h_style = ParagraphStyle(
        'HeaderStyle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=14,
        alignment=TA_CENTER, textColor=colors.HexColor('#1a365d')
    )
    sub_style = ParagraphStyle(
        'SubStyle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10,
        alignment=TA_CENTER, textColor=colors.HexColor('#4a5568')
    )
    label_style = ParagraphStyle('LabelStyle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#2d3748'))
    val_style = ParagraphStyle('ValStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=colors.HexColor('#1a202c'))

    story = [
        Paragraph("GOVERNMENT OF TAMIL NADU", sub_style),
        Paragraph(header_dept, sub_style),
        Spacer(1, 4),
        Paragraph(doc_title, h_style),
        Spacer(1, 6),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#2b6cb0'), spaceBefore=2, spaceAfter=10)
    ]

    table_data = []
    for lbl, val in fields:
        table_data.append([Paragraph(lbl, label_style), Paragraph(val, val_style)])

    t = Table(table_data, colWidths=[180, 350])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f7fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)

    if footer_note:
        story.append(Spacer(1, 14))
        f_style = ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, alignment=TA_CENTER, textColor=colors.HexColor('#718096'))
        story.append(Paragraph(footer_note, f_style))

    doc.build(story)

def generate_all():
    print("Generating synthetic demo PDFs...")

    # CASE 1: Clean Match
    c1_dir = os.path.join(BASE_DIR, "demo_case_1_clean")
    create_styled_pdf(
        os.path.join(c1_dir, "Patta_124_2_ArunKumar.pdf"),
        "REVENUE DEPARTMENT - E-SERVICES (eservices.tn.gov.in)",
        "PATTA EXTRACT / நில உரிமை ஆவணம் (பட்டா)",
        [
            ("District / மாவட்டம்", "Madurai / மதுரை"),
            ("Taluk / வட்டம்", "Madurai North / மதுரை வடக்கு"),
            ("Village / கிராமம்", "Othakadai / ஒத்தக்கடை"),
            ("Patta Number / பட்டா எண்", "P-2026-00124"),
            ("Survey / Sub-Division No / புல எண்", "124/2"),
            ("Pattadhar / உரிமையாளர் பெயர்", "Arun Kumar / அருண் குமார்"),
            ("Land Classification / நில வகைப்பாடு", "Dry Land / புன்செய்"),
            ("Property Extent / விஸ்தீரணம்", "2400 sq.ft (5.5 cents)"),
            ("Issuing Authority", "Zonal Deputy Tahsildar, Madurai North")
        ],
        "Digitally signed by Revenue Administration, Government of Tamil Nadu."
    )

    create_styled_pdf(
        os.path.join(c1_dir, "Chitta_124_2_ArunKumar.pdf"),
        "REVENUE DEPARTMENT - E-SERVICES",
        "CHITTA ADANGAL REGISTER / சிட்டா அடங்கல் விவரம்",
        [
            ("District / மாவட்டம்", "Madurai / மதுரை"),
            ("Taluk / வட்டம்", "Madurai North / மதுரை வடக்கு"),
            ("Village / கிராமம்", "Othakadai / ஒத்தக்கடை"),
            ("Survey Number / புல எண்", "124/2"),
            ("Sub-Division / உட்பிரிவு எண்", "2"),
            ("Owner Name / பட்டாதாரர் பெயர்", "Arun Kumar"),
            ("Cultivation Extent / பரப்பு", "2400 sq.ft"),
            ("Assessment Tax (Rs.)", "4.50")
        ]
    )

    create_styled_pdf(
        os.path.join(c1_dir, "EC_124_2_Search_2026.pdf"),
        "COMMERCIAL TAXES & REGISTRATION DEPARTMENT (TNREGINET)",
        "ENCUMBRANCE CERTIFICATE (EC) / வில்லங்கச் சான்றிதழ்",
        [
            ("Registration District", "Madurai"),
            ("Sub-Registrar Office", "Othakadai SRO"),
            ("Application / EC Number", "EC-2026-4421"),
            ("Period of Search", "01-01-1990 to 01-02-2026"),
            ("Survey Number / புல எண்", "124/2"),
            ("Owner / Executant Name", "Arun Kumar"),
            ("Property Extent", "2400 sq.ft"),
            ("Registered Document Number", "DOC-4122/2024"),
            ("Registration Date", "14-06-2024"),
            ("Encumbrance Status", "NIL Encumbrances (Clear Title Recorded)")
        ],
        "Official Search Report issued under Section 57 of the Registration Act, 1908."
    )

    create_styled_pdf(
        os.path.join(c1_dir, "SaleDeed_124_2_Registered.pdf"),
        "REGISTRATION DEPARTMENT - SUB REGISTRAR OFFICE",
        "ABSOLUTE SALE DEED (CONVEYANCE) / கிரயப் பத்திரம்",
        [
            ("Document Number / ஆவண எண்", "DOC-4122/2024"),
            ("Registration Date / பதிவு நாள்", "14-06-2024"),
            ("Purchaser / Buyer / வாங்குபவர்", "Arun Kumar"),
            ("Vendor / Seller / விற்பனையாளர்", "M. Sundaram"),
            ("Survey Number / புல எண்", "124/2"),
            ("Property Extent / விஸ்தீரணம்", "2400 sq.ft"),
            ("Village & District", "Othakadai Village, Madurai District"),
            ("North Boundary", "Plot No. 12"),
            ("South Boundary", "30 Feet Panchayat Road"),
            ("East Boundary", "Vacant Land in S.No 124/1"),
            ("West Boundary", "Survey No 124/3")
        ],
        "Registered as Book 1 Document at Sub-Registrar Office, Othakadai."
    )

    # CASE 2: Survey Number Mismatch
    c2_dir = os.path.join(BASE_DIR, "demo_case_2_survey_mismatch")
    create_styled_pdf(
        os.path.join(c2_dir, "Patta_124_2_RameshKumar.pdf"),
        "REVENUE DEPARTMENT - E-SERVICES",
        "PATTA EXTRACT / நில உரிமை ஆவணம் (பட்டா)",
        [
            ("District / மாவட்டம்", "Madurai"),
            ("Taluk / வட்டம்", "Madurai North"),
            ("Village / கிராமம்", "Othakadai"),
            ("Patta Number / பட்டா எண்", "P-2026-00812"),
            ("Survey Number / புல எண்", "124/2"),
            ("Owner / பட்டாதாரர் பெயர்", "Ramesh Kumar"),
            ("Property Extent", "2400 sq.ft")
        ]
    )

    create_styled_pdf(
        os.path.join(c2_dir, "Chitta_124_2_RameshKumar.pdf"),
        "REVENUE DEPARTMENT - E-SERVICES",
        "CHITTA ADANGAL REGISTER",
        [
            ("Village", "Othakadai"),
            ("Survey Number / புல எண்", "124/2"),
            ("Owner Name", "Ramesh Kumar"),
            ("Extent", "2400 sq.ft")
        ]
    )

    create_styled_pdf(
        os.path.join(c2_dir, "EC_124_3_Suspicious.pdf"),
        "COMMERCIAL TAXES & REGISTRATION DEPARTMENT (TNREGINET)",
        "ENCUMBRANCE CERTIFICATE (EC) / வில்லங்கச் சான்றிதழ்",
        [
            ("Sub-Registrar Office", "Othakadai SRO"),
            ("EC Number", "EC-2026-9021"),
            ("Survey Number / புல எண்", "124/3"),  # <-- Mismatch with 124/2
            ("Owner Name", "Ramesh Kumar"),
            ("Property Extent", "2400 sq.ft"),
            ("Document Number", "DOC-891/2023"),
            ("Remarks", "Search performed for S.No 124/3")
        ],
        "Notice: Encumbrance record reflects Survey 124/3."
    )

    create_styled_pdf(
        os.path.join(c2_dir, "SaleDeed_124_2_RameshKumar.pdf"),
        "REGISTRATION DEPARTMENT",
        "SALE DEED / கிரயப் பத்திரம்",
        [
            ("Document Number", "DOC-891/2023"),
            ("Purchaser / Buyer", "Ramesh Kumar"),
            ("Survey Number / புல எண்", "124/2"),  # Matches Patta
            ("Extent", "2400 sq.ft"),
            ("Village", "Othakadai")
        ]
    )

    # CASE 3: Owner Mismatch & Duplicate
    c3_dir = os.path.join(BASE_DIR, "demo_case_3_duplicate_fraud")
    create_styled_pdf(
        os.path.join(c3_dir, "Patta_124_2_RameshKumar.pdf"),
        "REVENUE DEPARTMENT - E-SERVICES",
        "PATTA EXTRACT / நில உரிமை ஆவணம்",
        [
            ("Survey Number", "124/2"),
            ("Owner Name / பட்டாதாரர் பெயர்", "RAMESH KUMAR"),
            ("Extent", "2400 sq.ft"),
            ("Village", "Othakadai")
        ]
    )

    create_styled_pdf(
        os.path.join(c3_dir, "Chitta_124_2_RameshKumar.pdf"),
        "REVENUE DEPARTMENT - E-SERVICES",
        "CHITTA EXTRACT",
        [
            ("Survey Number", "124/2"),
            ("Owner Name", "RAMESH KUMAR"),
            ("Extent", "2400 sq.ft"),
            ("Village", "Othakadai")
        ]
    )

    create_styled_pdf(
        os.path.join(c3_dir, "EC_124_2_RameshKumar.pdf"),
        "COMMERCIAL TAXES & REGISTRATION DEPARTMENT",
        "ENCUMBRANCE CERTIFICATE",
        [
            ("Survey Number", "124/2"),
            ("Owner Name", "RAMESH KUMAR"),
            ("Extent", "2400 sq.ft"),
            ("Village", "Othakadai")
        ]
    )

    create_styled_pdf(
        os.path.join(c3_dir, "SaleDeed_124_2_SureshKumar_Fraud.pdf"),
        "REGISTRATION DEPARTMENT",
        "SALE DEED (SUSPICIOUS APPLICATION)",
        [
            ("Survey Number", "124/2"),
            ("Purchaser / Buyer", "SURESH KUMAR"),  # <-- Mismatch with RAMESH KUMAR
            ("Extent", "2400 sq.ft"),
            ("Village", "Othakadai"),
            ("Document Number", "DOC-9941/2026")
        ],
        "Warning: Discrepancy noted in purchaser title chain."
    )

    print("All synthetic demo PDFs generated successfully!")

if __name__ == "__main__":
    generate_all()
