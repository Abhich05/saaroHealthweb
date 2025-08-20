from __future__ import annotations
import re
from typing import Dict, List, Tuple, Any


SECTION_PATTERNS = [
    ("Patient Information", re.compile(r"\b(patient|pt\.?|name|age|gender|male|female|dob|date of birth)\b", re.I)),
    ("Symptoms", re.compile(r"\b(symptom[s]?|complaint[s]?|presenting|history of|h/o|since|chief|complaint)\b", re.I)),
    ("Diagnosis", re.compile(r"\b(diagnosis|dx|impression|assessment|condition|ailment|disorder)\b", re.I)),
    ("Medication", re.compile(r"\b(medication[s]?|drug[s]?|rx|prescribe|start|continue|tablet|capsule|syrup|drop|injection|mg|ml|microgram|gram)\b", re.I)),
    ("Dosage", re.compile(r"\b(dosage|dose|strength|concentration)\b", re.I)),
    ("Frequency", re.compile(r"\b(frequency|times|schedule|regimen)\b", re.I)),
    ("Duration", re.compile(r"\b(duration|course|period|length|term)\b", re.I)),
    ("Instructions", re.compile(r"\b(instruction[s]?|advice|counsel|direction[s]?|recommend|avoid|take|with food|before meal|after meal)\b", re.I)),
    ("Follow-Up", re.compile(r"\b(follow[- ]?up|review|recheck|return visit|come back|next appointment|see again|appointment|visit)\b", re.I)),
    ("Notes", re.compile(r"\b(note[s]?|remark[s]?|additional|observation)\b", re.I)),
]

MEDICATION_LINE = re.compile(
    r"^(?P<name>[a-z][\w\- ]+?)\s+(?P<dose>\d+\s*(mg|mcg|g|ml))\s*(?P<form>tablet|capsule|syrup|drop|injection|patch)?\s*(?P<route>po|oral|iv|im|sc|topical|inh|s/l|sublingual|pr)?\s*(?P<freq>od|bd|tds|qid|q\d+h|once daily|twice daily|three times daily|every \d+ ?h)?\s*(for\s+(?P<duration>\d+\s*(day[s]?|week[s]?|month[s]?)))?",
    re.I,
)


def confidence_from_text_length(text: str) -> float:
    # Simple heuristic: more content tends to be better recognized; capped
    return max(0.5, min(0.99, len(text.strip()) / 400.0 + 0.5))


def parse_sections(transcript: str) -> Dict[str, str]:
    # Split by cues while preserving order
    lines = [l.strip() for l in re.split(r"[\n\r]", transcript) if l.strip()] or [transcript]
    current = "Notes"
    sections: Dict[str, List[str]] = {k: list() for k, _ in SECTION_PATTERNS}
    if "Notes" not in sections:
        sections["Notes"] = list()
    for line in lines:
        matched = False
        for name, pat in SECTION_PATTERNS:
            if pat.search(line):
                current = name
                matched = True
                # Remove the header cue from line remainder if it contains content
                residual = pat.sub("", line).strip(" :-–—")
                if residual:
                    sections[current].append(residual)
                break
        if not matched:
            sections.setdefault(current, []).append(line)
    # Join lines
    return {k: " ".join(v).strip() for k, v in sections.items() if v and " ".join(v).strip()}


def extract_fields(sections: Dict[str, str]) -> Dict[str, Any]:
    fields: Dict[str, Any] = {}

    # Patient info
    patient_text = sections.get("Patient Information", "")
    if patient_text:
        name = re.search(r"name\s*[:\- ]\s*([A-Za-z\-'. ]{2,})", patient_text, re.I)
        age = re.search(r"(age|\b([0-9]{1,3})\s*y[\/ ]?o\b)\s*[:\- ]?\s*(\d{1,3})", patient_text, re.I)
        gender = re.search(r"\b(male|female|man|woman|boy|girl|M\/F|gender\s*[:\- ]\s*(male|female))\b", patient_text, re.I)
        fields["patient_name"] = name.group(1).strip() if name else None
        fields["patient_age"] = int(age.group(3)) if age else None
        fields["patient_gender"] = (gender.group(1).lower() if gender else None)

    # Symptoms/diagnosis
    if sections.get("Symptoms"):
        fields["symptoms"] = sections["Symptoms"]
    if sections.get("Diagnosis"):
        fields["diagnosis"] = sections["Diagnosis"]

    # Medications with enhanced parsing
    meds: List[dict] = list()
    med_text = sections.get("Medication", "")
    if med_text:
        for part in re.split(r"[\n\.;]", med_text):
            chunk = part.strip()
            if not chunk:
                continue
            m = MEDICATION_LINE.search(chunk)
            if m:
                meds.append({
                    "name": m.group("name").strip(),
                    "dose": m.group("dose"),
                    "form": (m.group("form") or "").lower() or None,
                    "route": (m.group("route") or "").lower() or None,
                    "frequency": (m.group("freq") or "").lower() or None,
                    "duration": (m.group("duration") or "").lower() or None,
                    "raw": chunk,
                })
            else:
                # Fallback if no full match
                meds.append({"raw": chunk})
    if meds:
        fields["medications"] = meds

    # Additional medical entities
    if sections.get("Dosage"):
        fields["dosage"] = sections["Dosage"]
    if sections.get("Frequency"):
        fields["frequency"] = sections["Frequency"]
    if sections.get("Duration"):
        fields["duration"] = sections["Duration"]

    # Instructions
    if sections.get("Instructions"):
        fields["instructions"] = sections["Instructions"]
    if sections.get("Follow-Up"):
        fields["follow_up"] = sections["Follow-Up"]
    if sections.get("Notes"):
        fields["notes"] = sections["Notes"]

    return fields


def score_fields(fields: Dict[str, Any], segments: List[dict]) -> Tuple[float, Dict[str, float]]:
    # Compute naive confidence per field, weighted by content presence and average ASR prob if available
    segment_probs = [s.get("avg_logprob", -0.1) for s in segments if s.get("avg_logprob") is not None]
    base_asr = 0.75 if not segment_probs else min(0.99, max(0.6, (sum(segment_probs) / len(segment_probs) + 1.0) / 2.0))

    field_scores: Dict[str, float] = {}
    for k, v in fields.items():
        text = v if isinstance(v, str) else (" ".join(m.get("raw") or m.get("name", "") for m in v) if isinstance(v, list) else str(v))
        field_scores[k] = round(min(0.99, 0.5 * base_asr + 0.5 * confidence_from_text_length(text)), 3)

    # Overall score considers number of populated fields and ASR base
    coverage = len([1 for v in fields.values() if v]) / max(1, 7)
    overall = round(min(0.99, 0.6 * base_asr + 0.4 * (0.5 + 0.5 * coverage)), 3)
    return overall, field_scores


def build_clarifications(fields: Dict[str, Any], field_scores: Dict[str, float]) -> List[dict]:
    clarifications: List[dict] = list()
    def add(field: str, reason: str, suggestion: str | None = None):
        clarifications.append({"field": field, "reason": reason, "suggestion": suggestion, "confidence": field_scores.get(field, 0.6)})

    if not fields.get("patient_name"):
        add("patient_name", "Missing patient name", "Please state the patient's full name.")
    if not fields.get("diagnosis"):
        add("diagnosis", "Diagnosis not captured", "State the diagnosis explicitly.")
    if not fields.get("medications"):
        add("medications", "No medications parsed", "Say: 'Medication: <drug> <dose> mg oral twice daily for 5 days'.")

    # Low confidence flags
    for k, sc in field_scores.items():
        if sc < 0.8:
            add(k, "Low confidence", "Please confirm or correct.")

    return clarifications


def parse_prescription(transcript: str, segments: List[dict]) -> Tuple[Dict[str, Any], Dict[str, str], float, Dict[str, float], List[dict]]:
    sections = parse_sections(transcript)
    fields = extract_fields(sections)
    overall, field_scores = score_fields(fields, segments)
    clarifications = build_clarifications(fields, field_scores)
    return fields, sections, overall, field_scores, clarifications
