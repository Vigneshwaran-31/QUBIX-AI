import re
from typing import Optional, Tuple
from rapidfuzz import fuzz

HONORIFICS = [
    "thiru", "mrs", "mr", "dr", "smt", "shri", "miss", "திரு", "திருமதி", "செல்வி"
]

def normalize_name(name: Optional[str]) -> str:
    """Normalize names: lower-casing, removing honorifics, stripping initials & excess spacing."""
    if not name:
        return ""
    
    clean = name.lower().strip()
    # Remove honorifics
    for h in HONORIFICS:
        clean = re.sub(rf'\b{h}\.?\s+', '', clean, flags=re.IGNORECASE)
    
    # Replace dots and special characters with spaces
    clean = re.sub(r'[\.\,\-\_]', ' ', clean)
    # Collapse multiple spaces
    clean = " ".join(clean.split())
    return clean

def compare_names(name1: Optional[str], name2: Optional[str]) -> Tuple[bool, float, str]:
    """
    Compare two names using exact match, normalized match, and token sort fuzzy ratio.
    Returns: (is_match, similarity_percentage, description)
    """
    if not name1 or not name2:
        return False, 0.0, "Missing name in one or both documents"

    if name1.strip().lower() == name2.strip().lower():
        return True, 100.0, "Exact match"

    norm1 = normalize_name(name1)
    norm2 = normalize_name(name2)

    if norm1 == norm2 and len(norm1) > 0:
        return True, 100.0, "Normalized match"

    # Token sort ratio handles out-of-order words
    similarity = fuzz.token_sort_ratio(norm1, norm2)

    # Check individual words when sorted (handles out-of-order tokens like "Kumar Ramesh" vs "Ramesh Kumar")
    words1 = sorted(norm1.split())
    words2 = sorted(norm2.split())
    if len(words1) >= 2 and len(words2) >= 2 and len(words1) == len(words2):
        # Compare token by token
        token_sims = [fuzz.ratio(w1, w2) for w1, w2 in zip(words1, words2)]
        min_token_sim = min(token_sims)
        if min_token_sim < 75.0:
            # Token conflict
            effective_score = min(similarity, min_token_sim)
            return False, round(effective_score, 1), f"Significant name conflict ('{words1}' vs '{words2}', {min_token_sim:.1f}% token similarity)"

    if similarity >= 85.0:
        return True, round(similarity, 1), f"Fuzzy match ({similarity:.1f}%) with minor spelling/format variation"
    elif similarity >= 65.0:
        return False, round(similarity, 1), f"Possible partial match ({similarity:.1f}%), requires verification"
    else:
        return False, round(similarity, 1), f"Significant name conflict ({similarity:.1f}% similarity)"

def normalize_survey_number(survey: Optional[str], subdivision: Optional[str] = None) -> str:
    """
    Standardize survey and sub-division formats.
    e.g., "124/2", "124 / 2", "124-2", "124/ 2A" -> ("124", "2") -> "124/2"
    """
    if not survey:
        return ""
    
    s = survey.strip()
    # If composite e.g. "124/2" or "124-2"
    parts = re.split(r'[\/\-]', s)
    s_num = parts[0].strip()
    sub_num = parts[1].strip() if len(parts) > 1 else (subdivision.strip() if subdivision else "")

    if sub_num:
        return f"{s_num}/{sub_num}"
    return s_num

def parse_extent_to_sqft(extent_str: Optional[str]) -> Optional[float]:
    """
    Convert Indian land extent expressions into square feet for safe comparison.
    1 cent = 435.6 sq ft
    1 acre = 43,560 sq ft
    1 hectare = 107,639.1 sq ft
    1 ground = 2,400 sq ft
    """
    if not extent_str:
        return None

    s = extent_str.lower().strip()
    match = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*([a-z\.\s\u0B80-\u0BFF]+)?', s)
    if not match:
        return None

    val = float(match.group(1))
    unit = (match.group(2) or "").strip().replace(".", "")

    if "cent" in unit or "சென்ட்" in unit:
        return val * 435.6
    elif "acre" in unit or "ஏக்கர்" in unit:
        return val * 43560.0
    elif "hect" in unit or "ஹெக்" in unit:
        return val * 107639.1
    elif "ground" in unit:
        return val * 2400.0
    elif "sq" in unit or "சதுர" in unit:
        return val
    else:
        # If no unit specified, assume sq ft if large, or cents if under 100
        return val * 435.6 if val <= 100 else val

def compare_extents(extent1: Optional[str], extent2: Optional[str]) -> Tuple[bool, float, str]:
    """
    Compare two land extents with tolerance for rounding errors (< 3% difference).
    Returns: (is_match, percentage_diff, explanation)
    """
    sqft1 = parse_extent_to_sqft(extent1)
    sqft2 = parse_extent_to_sqft(extent2)

    if sqft1 is None or sqft2 is None:
        return True, 0.0, "Extent comparison skipped due to missing data"

    if sqft1 == 0 or sqft2 == 0:
        return True, 0.0, "Zero extent recorded"

    diff_pct = abs(sqft1 - sqft2) / max(sqft1, sqft2) * 100.0

    if diff_pct <= 3.0:
        return True, round(diff_pct, 1), f"Extents match closely (~{sqft1:.0f} sq.ft vs ~{sqft2:.0f} sq.ft, {diff_pct:.1f}% variance)"
    else:
        return False, round(diff_pct, 1), f"Extent conflict detected: {extent1} (~{sqft1:.0f} sq.ft) vs {extent2} (~{sqft2:.0f} sq.ft) with {diff_pct:.1f}% discrepancy"
