"""
Name and age extraction helpers with an NLP fallback.

This module tries to use NLTK for robust name extraction. If NLTK is
not available, it uses a simple regex-based fallback so the repo can be
smoke-tested without installing heavy dependencies.
"""
import re

try:
    # Optional heavy packages; the editor environment may not have them.
    import nltk  # type: ignore[reportMissingImports]
    from nameparser.parser import HumanName  # type: ignore[reportMissingImports]

    def get_human_names(text):
        # Use NLTK named-entity recognition to find PERSON entities.
        try:
            tokens = nltk.tokenize.word_tokenize(text)
            pos = nltk.pos_tag(tokens)
            sentt = nltk.ne_chunk(pos, binary=False)
            person_list = []
            person = []
            name = ""
            for subtree in sentt.subtrees(filter=lambda t: t.label() == 'PERSON'):
                for leaf in subtree.leaves():
                    person.append(leaf[0])
                for part in person:
                    name += part + ' '
                if name[:-1] not in person_list:
                    person_list.append(name[:-1])
                name = ''
                person = []
            return person_list
        except Exception:
            # On any failure, fall back to the regex approach below
            return _regex_get_human_names(text)

    def get_age(text):
        found = re.findall(r"\d{1,3}", text)
        return found[0] if found else ""

except Exception:
    # Lightweight fallback if NLTK is not installed.
    def _regex_get_human_names(text):
        # Look for common patterns like "Patient name is X" or "name is X"
        patterns = [r"Patient name is ([A-Za-z ]+)", r"patient name is ([A-Za-z ]+)", r"name is ([A-Za-z ]+)"]
        for pat in patterns:
            m = re.search(pat, text)
            if m:
                return [m.group(1).strip()]
        # As a last resort, return an empty list
        return []

    def get_human_names(text):
        return _regex_get_human_names(text)

    def get_age(text):
        found = re.findall(r"\d{1,3}", text)
        return found[0] if found else ""


