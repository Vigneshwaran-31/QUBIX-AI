import re
from typing import Tuple

PATTA_KEYWORDS = [
    "patta", "பட்டா", "revenue department", "வருவாய்த்துறை", "பட்டா எண்",
    "record of rights", "pattadhar", "பட்டாதாரர்", "உரிமையாளர் பெயர்",
    "tamil nadu government e-services", "நில உரிமை ஆவணம்", "patta copy"
]

CHITTA_KEYWORDS = [
    "chitta", "சிட்டா", "அடங்கல்", "adangal", "நன்செய்", "புன்செய்",
    "விவசாய நில விவரம்", "விஸ்தீரணம்", "வகைப்பாடு", "chitta extract",
    "classification of land", "dry land", "wet land", "chitta register"
]

EC_KEYWORDS = [
    "encumbrance certificate", "வில்லங்கச் சான்றிதழ்", "tnreginet", "registration department",
    "பதிவுத்துறை", "ec no", "villangam", "விற்பனை விவரம்", "பட்டியல் எண்",
    "encumbrance statement", "nil encumbrance", "search period", "period of search"
]

SALE_DEED_KEYWORDS = [
    "sale deed", "கிரயப் பத்திரம்", "absolute sale", "conveyance", "vendee",
    "vendor", "விற்பனையாளர்", "வாங்குபவர்", "சொத்து விவரம்", "நான்கெல்லை",
    "schedule of property", "witnesseth", "indenture of sale", "consideration amount"
]

def classify_document(text: str, filename: str = "") -> Tuple[str, float, str]:
    """
    Classify a document using extracted text and filename heuristic.
    Returns: (document_type, confidence, explanation)
    """
    lower_text = text.lower()
    lower_fn = filename.lower()

    scores = {
        "PATTA": 0,
        "CHITTA": 0,
        "EC": 0,
        "SALE_DEED": 0
    }

    # Score by keywords in text
    for kw in PATTA_KEYWORDS:
        if kw in lower_text:
            scores["PATTA"] += 2
    for kw in CHITTA_KEYWORDS:
        if kw in lower_text:
            scores["CHITTA"] += 2
    for kw in EC_KEYWORDS:
        if kw in lower_text:
            scores["EC"] += 2
    for kw in SALE_DEED_KEYWORDS:
        if kw in lower_text:
            scores["SALE_DEED"] += 2

    # Boost score by filename hints
    if "patta" in lower_fn or "பட்டா" in lower_fn:
        scores["PATTA"] += 4
    if "chitta" in lower_fn or "சிட்டா" in lower_fn:
        scores["CHITTA"] += 4
    if "ec" in lower_fn or "encumbrance" in lower_fn or "வில்லங்கம்" in lower_fn:
        scores["EC"] += 4
    if "sale" in lower_fn or "deed" in lower_fn or "கிரயம்" in lower_fn:
        scores["SALE_DEED"] += 4

    best_type, best_score = max(scores.items(), key=lambda x: x[1])

    if best_score == 0:
        return "UNKNOWN", 0.30, "No definitive Tamil Nadu land registration markers detected. Manual verification required."

    confidence = min(0.98, 0.65 + (best_score * 0.04))
    
    explanation_map = {
        "PATTA": f"Identified as Patta with {confidence*100:.1f}% confidence based on Revenue Department markers and Pattadhar record indicators.",
        "CHITTA": f"Identified as Chitta extract with {confidence*100:.1f}% confidence based on land classification and cultivation extent markers.",
        "EC": f"Identified as Encumbrance Certificate with {confidence*100:.1f}% confidence based on TNREGINET transaction indices and registration seals.",
        "SALE_DEED": f"Identified as Sale Deed (Conveyance) with {confidence*100:.1f}% confidence based on Vendor/Vendee title transfer schedule."
    }

    return best_type, round(confidence, 3), explanation_map.get(best_type, "Classified successfully.")
