import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api import auth, applications, documents, processing, verification, duplicate, officer, reports, dashboard
from app.services.demo_seeder import ensure_demo_users, seed_demo_case

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables & ensure demo users
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_demo_users(db)
        # Check if any applications exist, if not seed Demo Case 2 (Survey Mismatch) and Demo Case 1
        from app.models.application import Application
        if db.query(Application).count() == 0:
            seed_demo_case(db, "case_1")
            seed_demo_case(db, "case_2")
    finally:
        db.close()
    yield

app = FastAPI(
    title="QUBIX-AI: AI-Assisted Land Document Verification Platform",
    description="Intelligent pre-verification for Tamil Nadu land registration workflows (Patta, Chitta, EC, Sale Deed). Developed by HEXA TITANS.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(applications.router, prefix=f"{settings.API_V1_STR}/applications", tags=["Applications"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["Documents"])
app.include_router(processing.router, prefix=f"{settings.API_V1_STR}/processing", tags=["AI Verification Processing"])
app.include_router(verification.router, prefix=f"{settings.API_V1_STR}/verification", tags=["Cross-Doc Verification"])
app.include_router(duplicate.router, prefix=f"{settings.API_V1_STR}/duplicate", tags=["Duplicate Detection"])
app.include_router(officer.router, prefix=f"{settings.API_V1_STR}/officer", tags=["Officer Workflow & Audit"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard & Demo"])

@app.get("/")
def root():
    return {
        "platform": "QUBIX-AI",
        "tagline": "Verify Before You Approve",
        "team": "HEXA TITANS",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "status": "OPERATIONAL"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "qubix-ai-backend"}
