def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_auth_login(client):
    res = client.post("/api/auth/login", json={
        "email": "officer@bhumi.tn.gov.in",
        "password": "officer123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "OFFICER"

def test_create_and_fetch_application(client):
    # Login as officer to get token
    login_res = client.post("/api/auth/login", json={
        "email": "officer@bhumi.tn.gov.in",
        "password": "officer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create application
    payload = {
        "applicant_name": "Karthik Raja",
        "applicant_phone": "9842199999",
        "applicant_email": "karthik.raja@gmail.com",
        "district": "Madurai",
        "taluk": "Madurai North",
        "village": "Othakadai",
        "primary_survey_no": "150/1",
        "subdivision_number": "1",
        "property_extent": "1800 sq.ft"
    }
    create_res = client.post("/api/applications", json=payload, headers=headers)
    assert create_res.status_code == 200
    app_data = create_res.json()
    app_id = app_data["id"]

    # Fetch created application
    get_res = client.get(f"/api/applications/{app_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["applicant_name"] == "Karthik Raja"

def test_dashboard_statistics(client):
    res = client.get("/api/dashboard/statistics")
    assert res.status_code == 200
    data = res.json()
    assert "total_applications" in data
    assert "risk_distribution" in data

def test_demo_seed_endpoint(client):
    res = client.post("/api/dashboard/seed-demo", json={"case_type": "case_2"})
    assert res.status_code == 200
    data = res.json()
    assert data["risk_score"] == 78.0
    assert data["risk_level"] == "CRITICAL"
