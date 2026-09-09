from app.verification.risk_scorer import calculate_risk_score
from app.verification.engine import ConsistencyIssue

def test_calculate_risk_score_low():
    score, category, breakdown = calculate_risk_score([])
    assert score == 0.0
    assert category == "LOW"

def test_calculate_risk_score_critical():
    issues = [
        ConsistencyIssue("Survey Number", "CRITICAL", "PATTA", "EC", "124/2", "124/3", "Conflict", 35),
        ConsistencyIssue("Owner Name", "CRITICAL", "PATTA", "SALE_DEED", "Ramesh", "Suresh", "Conflict", 30),
        ConsistencyIssue("Property Extent", "HIGH", "PATTA", "SALE_DEED", "2400", "4800", "Conflict", 15)
    ]
    score, category, breakdown = calculate_risk_score(issues)
    assert score == 80.0
    assert category == "CRITICAL"
    assert len(breakdown) == 3

def test_duplicate_score_impact():
    score, category, breakdown = calculate_risk_score([], has_duplicate=True, duplicate_score=92.0)
    assert score == 35.0
    assert category == "MEDIUM"
    assert any("Potential duplicate" in b["reason"] for b in breakdown)
