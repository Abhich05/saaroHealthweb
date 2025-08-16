"""
Extract medical entities from text using med7 (spaCy) with a
fallback simple heuristic when the model/package isn't installed.
"""
import re

try:
    # spaCy / med7 are optional heavy dependencies; Pylance may not have them
    # installed in the environment used by the editor. Silence that specific
    # diagnostic while keeping the runtime import.
    import spacy  # type: ignore[reportMissingImports]

    def extract_details(text):
        med7 = spacy.load("en_core_med7_lg")
        doc = med7(text)
        return [(ent.text, ent.label_) for ent in doc.ents]

except Exception:
    # Lightweight heuristic fallback: find drug-like tokens and numeric strengths/durations
    def extract_details(text):
        # Find words followed by mg, ml, or common duration words
        tokens = []
        # Drug names: words with lowercase letters and optionally numbers
        for m in re.finditer(r"([A-Za-z][A-Za-z0-9\-]+)\s*(\d+mg|\d+ml)?", text):
            name = m.group(1)
            if len(name) > 2:
                tokens.append((name, "DRUG"))
        # Strengths
        for m in re.finditer(r"(\d+mg|\d+ml)", text):
            tokens.append((m.group(1), "STRENGTH"))
        # Durations
        for m in re.finditer(r"(\d+\s*(?:days|day|weeks|week))", text):
            tokens.append((m.group(1), "DURATION"))
        # Frequencies / dosing words
        for w in ["once", "twice", "thrice", "morning", "evening", "after food", "before food"]:
            if w in text:
                tokens.append((w, "FREQUENCY"))
        return tokens
