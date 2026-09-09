import os
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.application import Application
from app.models.document import Document, DocumentExtraction
from app.models.verification import VerificationResult, VerificationIssue
from app.models.duplicate import DuplicateMatch
from app.models.audit import OfficerReview, AuditLog
from app.utils.security import get_password_hash
from app.config import settings
from app.services.pdf_report import generate_verification_pdf
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def create_sample_pdf(file_path: str, title: str, content: str):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    doc = SimpleDocTemplate(file_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = [
        Paragraph(f"<b>{title}</b>", styles['Heading1']),
        Spacer(1, 10),
        Paragraph(content.replace("\n", "<br/>"), styles['BodyText'])
    ]
    doc.build(story)

def ensure_demo_users(db: Session):
    """Ensure officer, admin, and citizen demo users exist."""
    users = [
        {
            "email": "officer@bhumi.tn.gov.in",
            "full_name": "K. Meenakshi Sundaram (DRO / Sub-Registrar)",
            "role": UserRole.OFFICER.value,
            "department": "Registration Dept, Madurai North",
            "password": "officer123"
        },
        {
            "email": "admin@bhumi.tn.gov.in",
            "full_name": "V. Radhakrishnan (State System Administrator)",
            "role": UserRole.ADMIN.value,
            "department": "Inspector General of Registration, Chennai",
            "password": "admin123"
        },
        {
            "email": "citizen@gmail.com",
            "full_name": "Arun Kumar (Applicant)",
            "role": UserRole.CITIZEN.value,
            "department": "General Public",
            "password": "citizen123"
        }
    ]
    for u in users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            new_u = User(
                email=u["email"],
                full_name=u["full_name"],
                role=u["role"],
                department=u["department"],
                hashed_password=get_password_hash(u["password"])
            )
            db.add(new_u)
    db.commit()

def seed_demo_case(db: Session, case_type: str = "case_2") -> Application:
    """
    Seed realistic demo cases:
    - case_1: Clean Match (Low Risk, 10-15)
    - case_2: Survey Number Mismatch (Patta 124/2, Chitta 124/2, EC 124/3, Sale Deed 124/2) -> Critical Risk
    - case_3: Owner Mismatch & Duplicate Application -> Critical Risk
    """
    ensure_demo_users(db)
    officer = db.query(User).filter(User.role == UserRole.OFFICER.value).first()
    applicant = db.query(User).filter(User.role == UserRole.CITIZEN.value).first()

    base_dir = settings.SAMPLE_DIR

    if case_type == "case_1":
        app_num = f"APP-2026-{datetime.utcnow().strftime('%H%M%S')}-C1"
        app = Application(
            application_number=app_num,
            applicant_id=applicant.id if applicant else None,
            applicant_name="Arun Kumar",
            applicant_phone="9842100001",
            applicant_email="arun.kumar@gmail.com",
            district="Madurai",
            taluk="Madurai North",
            village="Othakadai",
            primary_survey_no="124/2",
            subdivision_number="2",
            property_extent="2400 sq.ft (5.5 cents)",
            status="VERIFIED",
            risk_score=10.0,
            risk_level="LOW"
        )
        db.add(app)
        db.commit()
        db.refresh(app)

        # 4 Documents with matching details
        docs_spec = [
            ("PATTA", "Patta_124_2_ArunKumar.pdf", "124/2", "Arun Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "P-2026-00124"),
            ("CHITTA", "Chitta_124_2_ArunKumar.pdf", "124/2", "Arun Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "C-2026-0098"),
            ("EC", "EC_124_2_Search_2026.pdf", "124/2", "Arun Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "EC-2026-4421"),
            ("SALE_DEED", "SaleDeed_124_2_Registered.pdf", "124/2", "Arun Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "DOC-4122/2024")
        ]

        for dtype, fname, s_no, owner, ext, vil, tlk, dst, doc_no in docs_spec:
            fpath = os.path.join(base_dir, "case_1", fname)
            content = f"Tamil Nadu Land Record: {dtype}\nSurvey No: {s_no}\nOwner Name: {owner}\nExtent: {ext}\nVillage: {vil}\nTaluk: {tlk}\nDistrict: {dst}\nDocument No: {doc_no}\nStatus: Certified"
            create_sample_pdf(fpath, f"Official Land Record: {dtype}", content)

            d = Document(
                application_id=app.id,
                document_type=dtype,
                file_name=fname,
                file_path=fpath,
                file_hash=f"hash-{dtype.lower()}-{app.id[:8]}",
                file_size=15420,
                ocr_status="COMPLETED",
                classification_confidence=0.98,
                ocr_text=content
            )
            db.add(d)
            db.commit()
            db.refresh(d)

            ext_rec = DocumentExtraction(
                document_id=d.id,
                survey_number=s_no,
                owner_name=owner,
                property_extent=ext,
                village=vil,
                taluk=tlk,
                district=dst,
                document_number=doc_no,
                extraction_confidence=0.96
            )
            db.add(ext_rec)

        # Verification result
        vr = VerificationResult(
            application_id=app.id,
            overall_risk_score=10.0,
            risk_category="LOW",
            total_checks=10,
            total_conflicts=0,
            ai_explanation_summary="AI Pre-Verification Summary:\n✓ All 4 submitted documents (Patta, Chitta, EC, Sale Deed) demonstrate high cross-consistency.\n✓ Survey numbers, ownership entities, and property extents match perfectly across records.\n✓ Overall Risk Score is 10.0/100 (LOW RISK). Application verified."
        )
        db.add(vr)

        # Officer Review
        rev = OfficerReview(
            application_id=app.id,
            officer_id=officer.id if officer else app.id,
            decision="VERIFIED",
            comments="Cross-checked Revenue Patta with TNREGINET EC. All survey parameters and boundaries correlate accurately."
        )
        db.add(rev)

        # Audit log
        alog = AuditLog(
            application_id=app.id,
            user_id=officer.id if officer else None,
            action="VERIFICATION_APPROVED",
            previous_status="SUBMITTED",
            new_status="VERIFIED",
            details="All 4 documents verified clean by officer."
        )
        db.add(alog)
        db.commit()
        return app

    elif case_type == "case_2":
        # DEMO CASE 2: Survey Number Mismatch
        app_num = f"APP-2026-{datetime.utcnow().strftime('%H%M%S')}-C2"
        app = Application(
            application_number=app_num,
            applicant_id=applicant.id if applicant else None,
            applicant_name="Ramesh Kumar",
            applicant_phone="9842100002",
            applicant_email="ramesh.kumar@gmail.com",
            district="Madurai",
            taluk="Madurai North",
            village="Othakadai",
            primary_survey_no="124/2",
            subdivision_number="2",
            property_extent="2400 sq.ft",
            status="ESCALATED",
            risk_score=78.0,
            risk_level="CRITICAL"
        )
        db.add(app)
        db.commit()
        db.refresh(app)

        docs_spec = [
            ("PATTA", "Patta_124_2_RameshKumar.pdf", "124/2", "Ramesh Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "P-2026-00812"),
            ("CHITTA", "Chitta_124_2_RameshKumar.pdf", "124/2", "Ramesh Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "C-2026-0441"),
            ("EC", "EC_124_3_Suspicious.pdf", "124/3", "Ramesh Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "EC-2026-9021"),
            ("SALE_DEED", "SaleDeed_124_2_RameshKumar.pdf", "124/2", "Ramesh Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "DOC-891/2023")
        ]

        for dtype, fname, s_no, owner, ext, vil, tlk, dst, doc_no in docs_spec:
            fpath = os.path.join(base_dir, "case_2", fname)
            content = f"Tamil Nadu Land Record: {dtype}\nSurvey No: {s_no}\nOwner Name: {owner}\nExtent: {ext}\nVillage: {vil}\nTaluk: {tlk}\nDistrict: {dst}\nDocument No: {doc_no}"
            create_sample_pdf(fpath, f"Official Land Record: {dtype}", content)

            d = Document(
                application_id=app.id,
                document_type=dtype,
                file_name=fname,
                file_path=fpath,
                file_hash=f"hash-c2-{dtype.lower()}-{app.id[:8]}",
                file_size=16200,
                ocr_status="COMPLETED",
                classification_confidence=0.97,
                ocr_text=content
            )
            db.add(d)
            db.commit()
            db.refresh(d)

            ext_rec = DocumentExtraction(
                document_id=d.id,
                survey_number=s_no,
                owner_name=owner,
                property_extent=ext,
                village=vil,
                taluk=tlk,
                district=dst,
                document_number=doc_no,
                extraction_confidence=0.95
            )
            db.add(ext_rec)

        vr = VerificationResult(
            application_id=app.id,
            overall_risk_score=78.0,
            risk_category="CRITICAL",
            total_checks=10,
            total_conflicts=2,
            ai_explanation_summary=(
                "AI Pre-Verification Summary (Evaluated 4 submitted land documents):\n"
                "• CRITICAL CONFLICTS (1 detected):\n"
                "  - Survey Number conflict: 3 of 4 submitted documents (Patta, Chitta, Sale Deed) identify the property as Survey No. 124/2. "
                "The Encumbrance Certificate (EC) identifies it as Survey No. 124/3.\n"
                "• JURISDICTION CONFLICT: Sub-division divergence between revenue records and registration index.\n"
                "Conclusion: Overall Risk Score is 78.0/100 (CRITICAL RISK). The application has been flagged for mandatory officer investigation."
            )
        )
        db.add(vr)
        db.commit()
        db.refresh(vr)

        # Add Verification Issues
        iss1 = VerificationIssue(
            verification_result_id=vr.id,
            field_name="Survey Number",
            severity="CRITICAL",
            document_a_type="PATTA",
            document_b_type="EC",
            value_a="124/2",
            value_b="124/3",
            explanation="The Encumbrance Certificate contains a different survey number (124/3) from the Patta and Sale Deed (124/2).",
            risk_points=35,
            confidence=0.99
        )
        iss2 = VerificationIssue(
            verification_result_id=vr.id,
            field_name="Sub-division Number",
            severity="CRITICAL",
            document_a_type="SALE_DEED",
            document_b_type="EC",
            value_a="2",
            value_b="3",
            explanation="Sub-division mismatch between registered title deed and encumbrance certificate statement.",
            risk_points=25,
            confidence=0.98
        )
        db.add_all([iss1, iss2])

        # Officer Review
        rev = OfficerReview(
            application_id=app.id,
            officer_id=officer.id if officer else app.id,
            decision="ESCALATE",
            comments="EC lists survey number 124/3 while patta shows 124/2. Escalated to District Registrar (Vigilance) for ground field inspection."
        )
        db.add(rev)

        alog = AuditLog(
            application_id=app.id,
            user_id=officer.id if officer else None,
            action="OFFICER_ESCALATED",
            previous_status="PROCESSING",
            new_status="ESCALATED",
            details="Critical survey mismatch detected by AI engine. Officer escalated for manual field inquiry."
        )
        db.add(alog)
        db.commit()
        return app

    else:
        # DEMO CASE 3: Owner Mismatch + Duplicate Application
        # First ensure a baseline application exists
        base_app_num = "APP-2026-00124"
        existing_app = db.query(Application).filter(Application.application_number == base_app_num).first()
        if not existing_app:
            existing_app = Application(
                application_number=base_app_num,
                applicant_name="Ramesh Kumar",
                district="Madurai",
                taluk="Madurai North",
                village="Othakadai",
                primary_survey_no="124/2",
                subdivision_number="2",
                property_extent="2400 sq.ft",
                status="VERIFIED",
                risk_score=15.0,
                risk_level="LOW"
            )
            db.add(existing_app)
            db.commit()
            db.refresh(existing_app)

        app_num = f"APP-2026-{datetime.utcnow().strftime('%H%M%S')}-C3"
        app = Application(
            application_number=app_num,
            applicant_id=applicant.id if applicant else None,
            applicant_name="Suresh Kumar",
            applicant_phone="9842100003",
            applicant_email="suresh.kumar@gmail.com",
            district="Madurai",
            taluk="Madurai North",
            village="Othakadai",
            primary_survey_no="124/2",
            subdivision_number="2",
            property_extent="2400 sq.ft",
            status="NEEDS_CORRECTION",
            risk_score=92.0,
            risk_level="CRITICAL"
        )
        db.add(app)
        db.commit()
        db.refresh(app)

        docs_spec = [
            ("PATTA", "Patta_124_2_RameshKumar.pdf", "124/2", "Ramesh Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "P-2026-00124"),
            ("CHITTA", "Chitta_124_2_RameshKumar.pdf", "124/2", "Ramesh Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "C-2026-0098"),
            ("EC", "EC_124_2_RameshKumar.pdf", "124/2", "Ramesh Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "EC-2026-4421"),
            ("SALE_DEED", "SaleDeed_124_2_SureshKumar_Fraud.pdf", "124/2", "Suresh Kumar", "2400 sq.ft", "Othakadai", "Madurai North", "Madurai", "DOC-9941/2026")
        ]

        for dtype, fname, s_no, owner, ext, vil, tlk, dst, doc_no in docs_spec:
            fpath = os.path.join(base_dir, "case_3", fname)
            content = f"Tamil Nadu Land Record: {dtype}\nSurvey No: {s_no}\nOwner Name: {owner}\nExtent: {ext}\nVillage: {vil}\nTaluk: {tlk}\nDistrict: {dst}\nDocument No: {doc_no}"
            create_sample_pdf(fpath, f"Official Land Record: {dtype}", content)

            d = Document(
                application_id=app.id,
                document_type=dtype,
                file_name=fname,
                file_path=fpath,
                file_hash=f"hash-c3-{dtype.lower()}-{app.id[:8]}",
                file_size=15800,
                ocr_status="COMPLETED",
                classification_confidence=0.96,
                ocr_text=content
            )
            db.add(d)
            db.commit()
            db.refresh(d)

            ext_rec = DocumentExtraction(
                document_id=d.id,
                survey_number=s_no,
                owner_name=owner,
                property_extent=ext,
                village=vil,
                taluk=tlk,
                district=dst,
                document_number=doc_no,
                extraction_confidence=0.94
            )
            db.add(ext_rec)

        vr = VerificationResult(
            application_id=app.id,
            overall_risk_score=92.0,
            risk_category="CRITICAL",
            total_checks=10,
            total_conflicts=2,
            ai_explanation_summary=(
                "AI Pre-Verification Summary (Evaluated 4 submitted land documents):\n"
                "• CRITICAL CONFLICTS (1 detected):\n"
                "  - Ownership conflict: Patta, Chitta, and EC identify owner as 'RAMESH KUMAR'. However, the submitted Sale Deed lists purchaser as 'SURESH KUMAR' (58.0% similarity).\n"
                "• DUPLICATE ALERT: Matches existing verified application APP-2026-00124 with 91.0% parameter overlap (identical Survey 124/2, Othakadai Village, Extent 2400 sq.ft).\n"
                "Conclusion: Overall Risk Score is 92.0/100 (CRITICAL RISK). Suspected impersonation or duplicate filing. Strict manual investigation mandated."
            )
        )
        db.add(vr)
        db.commit()
        db.refresh(vr)

        iss1 = VerificationIssue(
            verification_result_id=vr.id,
            field_name="Owner / Party Name",
            severity="CRITICAL",
            document_a_type="PATTA",
            document_b_type="SALE_DEED",
            value_a="RAMESH KUMAR",
            value_b="SURESH KUMAR",
            explanation="Ownership conflict: Patta lists 'RAMESH KUMAR', but Sale Deed lists 'SURESH KUMAR' (Similarity: 58%). Significant name conflict.",
            risk_points=30,
            confidence=0.98
        )
        db.add(iss1)

        # Duplicate match
        dup = DuplicateMatch(
            application_id=app.id,
            matching_application_id=existing_app.id,
            similarity_score=91.0,
            matching_fields=["District", "Village", "Survey & Sub-division Number", "Property Extent"],
            status="POTENTIAL_DUPLICATE"
        )
        db.add(dup)

        rev = OfficerReview(
            application_id=app.id,
            officer_id=officer.id if officer else app.id,
            decision="REQUEST_CORRECTION",
            comments="Ownership mismatch between revenue records and sale deed. Overlaps with registered case APP-2026-00124. Explanation requested from applicant."
        )
        db.add(rev)

        alog = AuditLog(
            application_id=app.id,
            user_id=officer.id if officer else None,
            action="REQUEST_CORRECTION",
            previous_status="PROCESSING",
            new_status="NEEDS_CORRECTION",
            details="Critical ownership mismatch and 91% duplicate match flagged by AI."
        )
        db.add(alog)
        db.commit()
        return app
