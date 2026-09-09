import os
import shutil
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.config import settings
from app.models.application import Application
from app.models.document import Document, DocumentExtraction
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.document import DocumentResponse
from app.api.deps import get_current_user
from app.ocr.pipeline import calculate_file_hash, extract_text_from_file
from app.ocr.classifier import classify_document
from app.ocr.extractor import extract_structured_fields

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

@router.post("/{app_id}/upload", response_model=DocumentResponse)
async def upload_document(
    app_id: str,
    file: UploadFile = File(...),
    document_type_hint: Optional[str] = Form("UNKNOWN"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only PDF, JPG, and PNG are allowed."
        )

    # Save file to disk
    sub_dir = os.path.join(settings.UPLOAD_DIR, app_id)
    os.makedirs(sub_dir, exist_ok=True)
    
    unique_fn = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(sub_dir, unique_fn)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    file_hash = calculate_file_hash(file_path)

    # Run OCR & Text Extraction
    text, ocr_conf = extract_text_from_file(file_path, file.content_type)
    
    # Classify Document
    doc_type, class_conf, class_exp = classify_document(text, file.filename)
    if document_type_hint and document_type_hint != "UNKNOWN":
        doc_type = document_type_hint

    # Extract Structured Entities
    extracted = extract_structured_fields(text, doc_type)

    # Create Document record
    doc = Document(
        application_id=app.id,
        document_type=doc_type,
        file_name=file.filename,
        file_path=file_path,
        file_hash=file_hash,
        file_size=file_size,
        mime_type=file.content_type or "application/pdf",
        ocr_status="COMPLETED" if text else "FAILED",
        ocr_text=text,
        classification_confidence=class_conf,
        processed_at=datetime.utcnow()
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Create DocumentExtraction record
    doc_ext = DocumentExtraction(
        document_id=doc.id,
        survey_number=extracted.get("survey_number"),
        subdivision_number=extracted.get("subdivision_number"),
        owner_name=extracted.get("owner_name"),
        previous_owner_name=extracted.get("previous_owner_name"),
        property_extent=extracted.get("property_extent"),
        village=extracted.get("village"),
        taluk=extracted.get("taluk"),
        district=extracted.get("district"),
        document_number=extracted.get("document_number"),
        registration_number=extracted.get("registration_number"),
        registration_date=extracted.get("registration_date"),
        property_address=extracted.get("property_address"),
        boundaries=extracted.get("boundaries"),
        raw_extracted_fields=extracted.get("raw_extracted_fields"),
        extraction_confidence=extracted.get("confidence", 0.85)
    )
    db.add(doc_ext)

    # Audit log
    audit = AuditLog(
        application_id=app.id,
        user_id=current_user.id,
        action="UPLOAD_DOCUMENT",
        details=f"Uploaded {doc_type} ({file.filename}) - SHA256: {file_hash[:12]}..."
    )
    db.add(audit)
    db.commit()
    db.refresh(doc)

    return doc

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{doc_id}/file")
def get_document_file(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(doc.file_path, media_type=doc.mime_type, filename=doc.file_name)

@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    app_id = doc.application_id
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    
    log = AuditLog(
        application_id=app_id,
        user_id=current_user.id,
        action="DELETE_DOCUMENT",
        details=f"Deleted document {doc.file_name} ({doc.document_type})"
    )
    db.add(log)
    db.commit()

    return {"message": "Document deleted successfully"}
