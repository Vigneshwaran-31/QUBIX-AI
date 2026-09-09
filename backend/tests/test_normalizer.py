import pytest
from app.verification.normalizer import (
    normalize_name, compare_names, normalize_survey_number,
    parse_extent_to_sqft, compare_extents
)

def test_normalize_name():
    assert normalize_name("Thiru. Ramesh Kumar") == "ramesh kumar"
    assert normalize_name("Mr. RAMESH   KUMAR") == "ramesh kumar"
    assert normalize_name("திரு. ரமேஷ் குமார்") == "ரமேஷ் குமார்"

def test_compare_names_exact():
    is_match, score, desc = compare_names("RAMESH KUMAR", "Ramesh Kumar")
    assert is_match is True
    assert score == 100.0

def test_compare_names_fuzzy():
    # Out of order names or minor typo
    is_match, score, desc = compare_names("Kumar Ramesh", "Ramesh Kumar")
    assert is_match is True
    assert score >= 90.0

def test_compare_names_conflict():
    # Suresh Kumar vs Ramesh Kumar
    is_match, score, desc = compare_names("RAMESH KUMAR", "SURESH KUMAR")
    assert is_match is False
    assert score < 70.0
    assert "conflict" in desc.lower()

def test_normalize_survey_number():
    assert normalize_survey_number("124/2") == "124/2"
    assert normalize_survey_number("124 / 2") == "124/2"
    assert normalize_survey_number("124", "2") == "124/2"
    assert normalize_survey_number("124-2A") == "124/2A"

def test_parse_extent_to_sqft():
    # 1 cent = 435.6 sq ft
    assert parse_extent_to_sqft("5.5 cents") == pytest.approx(5.5 * 435.6, rel=1e-2)
    # 2400 sq ft
    assert parse_extent_to_sqft("2400 sq.ft") == 2400.0
    # 1 acre = 43560 sq ft
    assert parse_extent_to_sqft("1 acre") == 43560.0

def test_compare_extents():
    # Extent match within 3% tolerance
    is_match, diff, _ = compare_extents("2400 sq.ft", "5.5 cents") # 5.5 * 435.6 = 2395.8
    assert is_match is True
    assert diff < 1.0

    # Extent mismatch
    is_match, diff, desc = compare_extents("2400 sq.ft", "4800 sq.ft")
    assert is_match is False
    assert diff >= 50.0
