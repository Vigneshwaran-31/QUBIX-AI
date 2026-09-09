from app.verification.engine import verify_cross_documents

def test_clean_matching_documents():
    docs_data = {
        "PATTA": {"survey_number": "124/2", "owner_name": "Arun Kumar", "property_extent": "2400 sq.ft", "village": "Othakadai"},
        "CHITTA": {"survey_number": "124/2", "owner_name": "Arun Kumar", "property_extent": "2400 sq.ft", "village": "Othakadai"},
        "EC": {"survey_number": "124/2", "owner_name": "Arun Kumar", "property_extent": "2400 sq.ft", "village": "Othakadai"},
        "SALE_DEED": {"survey_number": "124/2", "owner_name": "Arun Kumar", "property_extent": "2400 sq.ft", "village": "Othakadai"}
    }
    issues = verify_cross_documents(docs_data)
    assert len(issues) == 0

def test_survey_number_mismatch_critical():
    docs_data = {
        "PATTA": {"survey_number": "124/2", "owner_name": "Ramesh Kumar"},
        "EC": {"survey_number": "124/3", "owner_name": "Ramesh Kumar"},
        "SALE_DEED": {"survey_number": "124/2", "owner_name": "Ramesh Kumar"}
    }
    issues = verify_cross_documents(docs_data)
    survey_issues = [i for i in issues if i.field_name == "Survey Number"]
    assert len(survey_issues) > 0
    assert survey_issues[0].severity == "CRITICAL"
    assert survey_issues[0].risk_points == 35

def test_owner_name_conflict_critical():
    docs_data = {
        "PATTA": {"survey_number": "124/2", "owner_name": "Ramesh Kumar"},
        "SALE_DEED": {"survey_number": "124/2", "owner_name": "Suresh Kumar"}
    }
    issues = verify_cross_documents(docs_data)
    owner_issues = [i for i in issues if i.field_name == "Owner / Party Name"]
    assert len(owner_issues) > 0
    assert owner_issues[0].severity == "CRITICAL"
    assert owner_issues[0].risk_points == 30

def test_missing_mandatory_document():
    docs_data = {
        "PATTA": {"survey_number": "124/2", "owner_name": "Ramesh Kumar"},
        "CHITTA": {"survey_number": "124/2", "owner_name": "Ramesh Kumar"}
    }
    issues = verify_cross_documents(docs_data)
    missing_issues = [i for i in issues if i.field_name == "Missing Document"]
    assert len(missing_issues) == 2  # EC and SALE_DEED
