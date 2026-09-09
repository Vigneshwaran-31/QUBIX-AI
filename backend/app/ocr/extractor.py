import re
from typing import Dict, Any

def extract_structured_fields(text: str, document_type: str = "UNKNOWN") -> Dict[str, Any]:
    """
    Extract key property and transaction entities from document text.
    Handles Tamil and English patterns across Patta, Chitta, EC, and Sale Deeds.
    """
    extracted = {
        "survey_number": None,
        "subdivision_number": None,
        "owner_name": None,
        "previous_owner_name": None,
        "property_extent": None,
        "village": None,
        "taluk": None,
        "district": None,
        "document_number": None,
        "registration_number": None,
        "registration_date": None,
        "property_address": None,
        "boundaries": None,
        "raw_extracted_fields": {},
        "confidence": 0.85
    }

    if not text:
        return extracted

    # Normalize whitespace for pattern matching
    clean_text = " ".join(text.split())

    # 1. Survey Number & Subdivision
    # Matches: Survey No: 124/2, 124/2A, S.No. 124/2, புல எண்: 124/2, சர்வே எண்: 124/2
    survey_match = re.search(
        r'(?:survey\s*(?:no|number)?|s\.?no\.?|புல\s*எண்|சர்வே\s*எண்|நில\s*அளவை\s*எண்)[\s:\-\.]*([0-9]+)\s*(?:[\/\-]\s*([0-9A-Za-z]+))?',
        clean_text,
        re.IGNORECASE
    )
    if survey_match:
        extracted["survey_number"] = survey_match.group(1)
        if survey_match.group(2):
            extracted["subdivision_number"] = survey_match.group(2).strip()

    # Fallback for composite notation: e.g. "124/2" or "124/2A"
    if not extracted["survey_number"]:
        composite_match = re.search(r'\b([0-9]{2,4})\s*\/\s*([0-9A-Za-z]+)\b', clean_text)
        if composite_match:
            extracted["survey_number"] = composite_match.group(1)
            extracted["subdivision_number"] = composite_match.group(2)

    # 2. Owner Name / Buyer / Pattadhar
    # Matches: Owner Name: Ramesh Kumar, Pattadhar: ..., Purchaser: ..., வாங்குபவர்: ..., பட்டாதாரர் பெயர்: ...
    owner_match = re.search(
        r'(?:owner\s*name|pattadhar\s*name|pattadhar|purchaser|buyer|வாங்குபவர்|பட்டாதாரர்\s*பெயர்|உரிமையாளர்\s*பெயர்)[\s:\-\.]*([A-Za-z\s\.\-]{3,40}|[\u0B80-\u0BFF\s\.\-]{3,40})(?:,|\n|\.|\s{2,}|$)',
        text,
        re.IGNORECASE
    )
    if owner_match:
        extracted["owner_name"] = owner_match.group(1).strip()

    # 3. Seller / Previous Owner
    seller_match = re.search(
        r'(?:seller\s*name|vendor|previous\s*owner|விற்பனையாளர்|முந்தைய\s*உரிமையாளர்)[\s:\-\.]*([A-Za-z\s\.\-]{3,40}|[\u0B80-\u0BFF\s\.\-]{3,40})(?:,|\n|\.|\s{2,}|$)',
        text,
        re.IGNORECASE
    )
    if seller_match:
        extracted["previous_owner_name"] = seller_match.group(1).strip()

    # 4. Property Extent / Area
    # Matches: 2400 sq ft, 2400 sq.ft, 5.5 cents, 1.20 acres, 0.40 hectare, 2400 சதுர அடி, 5 சென்ட்
    extent_match = re.search(
        r'([0-9]+(?:\.[0-9]+)?)\s*(sq\.?\s*ft|sqft|cents?|acres?|hectares?|சதுர\s*அடி|சென்ட்|ஏக்கர்|ஹெக்டேர்)',
        clean_text,
        re.IGNORECASE
    )
    if extent_match:
        extracted["property_extent"] = f"{extent_match.group(1)} {extent_match.group(2).lower()}"

    # 5. Administrative Jurisdiction (District, Taluk, Village)
    dist_match = re.search(r'(?:district|மாவட்டம்)[\s:\-\.]*([A-Za-z]+|[\u0B80-\u0BFF]+)', clean_text, re.IGNORECASE)
    if dist_match:
        extracted["district"] = dist_match.group(1).strip()

    taluk_match = re.search(r'(?:taluk|வட்டம்)[\s:\-\.]*([A-Za-z]+|[\u0B80-\u0BFF]+)', clean_text, re.IGNORECASE)
    if taluk_match:
        extracted["taluk"] = taluk_match.group(1).strip()

    village_match = re.search(r'(?:village|கிராமம்)[\s:\-\.]*([A-Za-z0-9\s]+|[\u0B80-\u0BFF0-9\s]+)', clean_text, re.IGNORECASE)
    if village_match:
        extracted["village"] = village_match.group(1).strip().split()[0]

    # 6. Document / Registration Number & Date
    doc_num_match = re.search(
        r'(?:doc(?:ument)?\s*(?:no|number)?|reg(?:istration)?\s*(?:no|number)?|ஆவண\s*எண்|பதிவு\s*எண்)[\s:\-\.]*([0-9]+(?:\s*\/\s*[0-9]{4})?)',
        clean_text,
        re.IGNORECASE
    )
    if doc_num_match:
        extracted["document_number"] = doc_num_match.group(1).strip()
        extracted["registration_number"] = doc_num_match.group(1).strip()

    date_match = re.search(
        r'\b([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.](?:19|20)[0-9]{2})\b',
        clean_text
    )
    if date_match:
        extracted["registration_date"] = date_match.group(1).strip()

    # Store raw dictionary copy
    extracted["raw_extracted_fields"] = {k: v for k, v in extracted.items() if v is not None and k != "raw_extracted_fields"}

    return extracted
